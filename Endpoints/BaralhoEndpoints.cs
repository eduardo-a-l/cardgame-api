using Microsoft.EntityFrameworkCore;
using CardGameApi.Data;
using CardGameApi.Models;

namespace CardGameApi.Endpoints;

public static class BaralhoEndpoints
{
    public static void MapBaralhoEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/baralhos");

        group.MapGet("/{userId}", async (int userId, AppDbContext db) =>
            await db.Baralhos
                .Include(b => b.Inventarios)
                    .ThenInclude(i => i.Carta)
                .Where(b => b.idUsuario == userId)
                .ToListAsync());

        group.MapPost("/", async (Baralho baralho, AppDbContext db) =>
        {
            db.Baralhos.Add(baralho);
            await db.SaveChangesAsync();
            return Results.Created($"/baralhos/{baralho.idBaralho}", baralho);
        });

        group.MapPut("/{id}", async (int id, Baralho baralhoAtualizado, AppDbContext db) =>
        {
            var baralho = await db.Baralhos
                .Include(b => b.Inventarios)
                .FirstOrDefaultAsync(b => b.idBaralho == id);

            if (baralho == null) return Results.NotFound();

            baralho.nome = baralhoAtualizado.nome;
            baralho.Inventarios.Clear();

            foreach (var inv in baralhoAtualizado.Inventarios)
            {
                var itemInventario = await db.Inventarios.FindAsync(inv.IdInventario);
                if (itemInventario != null) baralho.Inventarios.Add(itemInventario);
            }

            await db.SaveChangesAsync();
            return Results.NoContent();
        });

        group.MapDelete("/{id}", async (int id, AppDbContext db) =>
        {
            var baralho = await db.Baralhos.FindAsync(id);
            if (baralho == null) return Results.NotFound();
            db.Baralhos.Remove(baralho);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}