using CardGameApi.Data;
using CardGameApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CardGameApi.Endpoints;

public static class UsuarioEndpoints
{


    public static void MapUsuarioEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/usuarios");

        group.MapGet("/", async (AppDbContext db) => await db.Usuarios.ToListAsync());

        group.MapPost("/", async (Usuario u, AppDbContext db) => {
            var existe = await db.Usuarios.AnyAsync(user => user.NomeUsuario == u.NomeUsuario);
            if (existe) return Results.Conflict("Usu�rio j� cadastrado.");

            u.Pontos = 0;
            u.Moedas = 100;
            u.Vitorias = 0;
            u.Derrotas = 0;
            u.PinBatalha = 0;

            db.Usuarios.Add(u);
            await db.SaveChangesAsync();

            var idsCartasIniciais = new List<int> { 4, 4, 5, 6, 7, 8, 8, 9, 9, 10 };

            var itensInventario = idsCartasIniciais.Select(idCarta => new Inventario
            {
                IdUsuario = u.IdUsuario,
                IdCarta = idCarta
            });

            db.Inventarios.AddRange(itensInventario);
            await db.SaveChangesAsync();

            return Results.Created($"/usuarios/{u.IdUsuario}", u);
        });

        group.MapPost("/login", async (Usuario loginDto, AppDbContext db) =>
        {
            var user = await db.Usuarios
                .FirstOrDefaultAsync(u => u.NomeUsuario == loginDto.NomeUsuario && u.Senha == loginDto.Senha);
            if (user is null) return Results.Unauthorized();
            return Results.Ok(user);
        });

        group.MapGet("/ranking", async (AppDbContext db) =>
        {
            return await db.Usuarios
                .OrderByDescending(u => u.Pontos)
                .Select(u => new { u.IdUsuario, u.NomeUsuario, u.Pontos, u.Moedas })
                .ToListAsync();
        });

        group.MapGet("/{id}", async (int id, AppDbContext db) =>
        {
            var user = await db.Usuarios.FindAsync(id);
            if (user is null) return Results.NotFound();

            return Results.Ok(new
            {
                user.IdUsuario,
                user.NomeUsuario,
                user.Pontos,
                user.Moedas,
                user.Vitorias,
                user.Derrotas,
                user.PinBatalha
            });
        });

        group.MapPatch("/{id}/pinBatalha", async (int id, int novoPin, AppDbContext db) =>
        {
            var user = await db.Usuarios.FindAsync(id);
            if (user is null) return Results.NotFound();

            user.PinBatalha = novoPin;
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        group.MapPut("/resultado-batalha", async (ResultadoBatalhaDto resultado, AppDbContext db) =>
        {
            var vencedor = await db.Usuarios.FindAsync(resultado.IdVencedor);
            var perdedor = await db.Usuarios.FindAsync(resultado.IdPerdedor);

            if (vencedor == null || perdedor == null) return Results.NotFound("Um ou ambos os usuários não foram encontrados.");

            vencedor.Pontos += 10;
            vencedor.Moedas += 50;
            vencedor.Vitorias += 1;

            perdedor.Derrotas += 1;
            perdedor.Moedas += 10;

            await db.SaveChangesAsync();

            return Results.Ok(new { Mensagem = "Resultado processado com sucesso!" });
        });

        group.MapDelete("/{id}", async (int id, AppDbContext db) =>
        {
            var user = await db.Usuarios.FindAsync(id);
            if (user is null) return Results.NotFound();

            var inventarios = await db.Inventarios.Where(i => i.IdUsuario == id).ToListAsync();
            db.Inventarios.RemoveRange(inventarios);

            var baralhos = await db.Baralhos.Where(b => b.idUsuario == id).ToListAsync();
            db.Baralhos.RemoveRange(baralhos);

            var compras = await db.ComprasUsuarios.Where(c => c.IdUsuario == id).ToListAsync();
            db.ComprasUsuarios.RemoveRange(compras);

            db.Usuarios.Remove(user);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}

public record ResultadoBatalhaDto(int IdVencedor, int IdPerdedor);
