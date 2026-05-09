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
            if (existe) return Results.Conflict();
            db.Usuarios.Add(u);
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
    }
}
