using CardGameApi.Data;
using CardGameApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CardGameApi.Endpoints;

public static class UsuarioEndpoints
{

    public class PinUpdateDto
    {
        public int PinBatalha { get; set; } = 0;
    }

    public static void MapUsuarioEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/usuarios");

        group.MapGet("/", async (AppDbContext db) => await db.Usuarios.ToListAsync());

        group.MapPost("/", async (Usuario u, AppDbContext db) => {
            var existe = await db.Usuarios.AnyAsync(user => user.NomeUsuario == u.NomeUsuario);
            if (existe) return Results.Conflict("Usuário já cadastrado.");

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
            return Results.Ok(new { user.Pontos, user.Moedas, user.Vitorias, user.Derrotas, user.PinBatalha });
        });

        group.MapPatch("/{id}/pinBatalha", async (int id, PinUpdateDto dto, AppDbContext db) =>
        {
            var user = await db.Usuarios.FindAsync(id);
            if (user is null) return Results.NotFound();

            user.PinBatalha = dto.PinBatalha;
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}
