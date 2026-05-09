using Microsoft.EntityFrameworkCore;
using CardGameApi.Data;
using CardGameApi.Models;

namespace CardGameApi.Endpoints;

public static class LojaEndpoints
{
    public static void MapLojaEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/loja");

        group.MapGet("/itens/{idUsuario}", async (int idUsuario, AppDbContext db) =>
        {
            var comprados = await db.ComprasUsuarios
                .Where(c => c.IdUsuario == idUsuario)
                .Select(c => c.IdLojaItem)
                .ToListAsync();

            var itens = await db.LojaItens
                .Include(l => l.Carta)
                .Where(l => !l.EhOferta || !comprados.Contains(l.IdLojaItem))
                .ToListAsync();

            return Results.Ok(itens);
        });
        group.MapPost("/comprar/{userId}/{idLojaItem}", async (int userId, int idLojaItem, AppDbContext db) =>
        {
            var user = await db.Usuarios.FindAsync(userId);
            var item = await db.LojaItens.Include(l => l.Carta).FirstOrDefaultAsync(l => l.IdLojaItem == idLojaItem);

            if (user == null || item == null) return Results.NotFound("Usuário ou Item não encontrado.");

            if (user.Moedas < item.Preco) return Results.BadRequest("Saldo insuficiente.");

            if (item.EhOferta)
            {
                var jaComprou = await db.ComprasUsuarios.AnyAsync(c => c.IdUsuario == userId && c.IdLojaItem == idLojaItem);
                if (jaComprou) return Results.Conflict("Você já adquiriu esta oferta.");
            }

            using var transaction = await db.Database.BeginTransactionAsync();
            try
            {
                user.Moedas -= item.Preco;

                db.Inventarios.Add(new Inventario 
                { 
                    IdUsuario = userId, 
                    IdCarta = item.IdCarta 
                });

                if (item.EhOferta)
                {
                    db.ComprasUsuarios.Add(new CompraUsuario 
                    { 
                        IdUsuario = userId, 
                        IdLojaItem = idLojaItem 
                    });
                }

                await db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Results.Ok(new { Mensagem = "Compra realizada com sucesso!", NovoSaldo = user.Moedas });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return Results.Problem("Erro ao processar a compra.");
            }
        });
    }
}
