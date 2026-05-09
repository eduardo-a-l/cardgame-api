using Microsoft.EntityFrameworkCore;
using CardGameApi.Models;

namespace CardGameApi.Data;

public class AppDbContext : DbContext 
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Carta> Cartas { get; set; } = null!;
    public DbSet<Inventario> Inventarios { get; set; } = null!;
    public DbSet<Usuario> Usuarios { get; set; } = null!;
    public DbSet<Baralho> Baralhos { get; set; } = null!;
    public DbSet<LojaItem> LojaItens { get; set; } = null!;
    public DbSet<CompraUsuario> ComprasUsuarios { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("CARDGAME");

        modelBuilder.Entity<Carta>().ToTable("Carta");
        modelBuilder.Entity<Inventario>().ToTable("Inventario");
        modelBuilder.Entity<Usuario>().ToTable("Usuario");
        modelBuilder.Entity<Baralho>().ToTable("Baralho");
        modelBuilder.Entity<LojaItem>().ToTable("LojaItem");
        modelBuilder.Entity<CompraUsuario>().ToTable("CompraUsuario");

        modelBuilder.Entity<Carta>(entity => {
            entity.HasKey(c => c.IdCarta);
            entity.Property(c => c.Nome).IsRequired().HasColumnType("varchar(50)");
            entity.Property(c => c.Tipo).IsRequired().HasColumnType("varchar(30)");
            entity.Property(c => c.Raridade).HasColumnType("varchar(20)");
            entity.Property(c => c.Preco).HasColumnName("preco");
        });

        modelBuilder.Entity<Usuario>(entity => {
            entity.HasKey(u => u.IdUsuario);
            entity.Property(u => u.NomeUsuario).HasColumnType("varchar(50)");
            entity.Property(u => u.Senha).HasColumnType("varchar(10)");
            entity.Property(u => u.Pontos).HasDefaultValue(0);
            entity.Property(u => u.Moedas).HasDefaultValue(0);
            entity.Property(u => u.Vitorias).HasDefaultValue(0);
            entity.Property(u => u.Derrotas).HasDefaultValue(0);
            entity.Property(u => u.PinBatalha).HasDefaultValue(0);
        });

        modelBuilder.Entity<Inventario>(entity => {
            entity.HasKey(i => i.IdInventario);
            entity.HasOne(i => i.Carta).WithMany().HasForeignKey(i => i.IdCarta);
            entity.HasOne(i => i.Usuario).WithMany().HasForeignKey(i => i.IdUsuario);
        });

        modelBuilder.Entity<LojaItem>(entity => {
            entity.ToTable("lojaitem");
            entity.HasKey(l => l.IdLojaItem);

            entity.Property(l => l.IdLojaItem).HasColumnName("idlojaitem");
            entity.Property(l => l.IdCarta).HasColumnName("idcarta");
            entity.Property(l => l.Preco).HasColumnName("preco").IsRequired();
            entity.Property(l => l.EhOferta).HasColumnName("ehoferta").HasDefaultValue(false);
            entity.Property(l => l.Ativo).HasColumnName("ativo");

            entity.HasOne(l => l.Carta)
                .WithMany()
                .HasForeignKey(l => l.IdCarta);
        });

        modelBuilder.Entity<CompraUsuario>(entity => {
            entity.ToTable("comprausuario");
            entity.HasKey(c => c.IdCompra);

            entity.Property(c => c.IdCompra).HasColumnName("idcompra");
            entity.Property(c => c.IdUsuario).HasColumnName("idusuario");
            entity.Property(c => c.IdLojaItem).HasColumnName("idlojaitem");
            entity.Property(c => c.DataCompra).HasColumnName("datacompra").HasDefaultValueSql("GETDATE()");

            entity.HasOne(c => c.Usuario)
                .WithMany()
                .HasForeignKey(c => c.IdUsuario);

            entity.HasOne(c => c.LojaItem)
                .WithMany()
                .HasForeignKey(c => c.IdLojaItem);
        });

        modelBuilder.Entity<Baralho>(entity => {
            entity.HasKey(b => b.idBaralho);
            entity.ToTable("Baralho");
            entity.Property(b => b.nome).HasColumnType("varchar(20)");

            entity.HasOne<Usuario>()
                .WithMany(u => u.Baralhos)
                .HasForeignKey(b => b.idUsuario);

            entity.HasMany(b => b.Inventarios)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "Carta_Baralho",
                    j => j.HasOne<Inventario>().WithMany().HasForeignKey("idInventario"),
                    j => j.HasOne<Baralho>().WithMany().HasForeignKey("idBaralho"),
                    j => {
                        j.Property<int>("idCarta_Baralho");
                        j.HasKey("idCarta_Baralho");
                        j.ToTable("Carta_Baralho");
                    });
        });

    }
}