using Microsoft.EntityFrameworkCore;
using CardGameApi.Data;
using CardGameApi.Models;

namespace CardGameApi.Endpoints;

public static class CartaEndpoints
{
    public static void MapCartaEndpoints(this WebApplication app)
    {
        var grupoCartas = app.MapGroup("/cartas");

        grupoCartas.MapGet("/", async (AppDbContext db) => await db.Cartas.ToListAsync());
        
        grupoCartas.MapPost("/", async (Carta novaCarta, AppDbContext db) => {
            db.Cartas.Add(novaCarta);
            await db.SaveChangesAsync();
            return Results.Created($"/cartas/{novaCarta.IdCarta}", novaCarta);
        });

        var grupoInv = app.MapGroup("/inventario");

        grupoInv.MapGet("/", async (AppDbContext db) => 
            await db.Inventarios
                .Include(i => i.Carta)
                .Include(i => i.Usuario)
                .ToListAsync());

        grupoInv.MapPost("/", async (Inventario i, AppDbContext db) => {
            db.Inventarios.Add(i);
            await db.SaveChangesAsync();
            return Results.Created($"/inventario/{i.IdInventario}", i);
        });

        grupoCartas.MapGet("/{id}", async (int id, AppDbContext db) =>
            await db.Cartas.FindAsync(id) is Carta carta 
                ? Results.Ok(carta) 
                : Results.NotFound());
    }
}