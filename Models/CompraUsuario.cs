using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CardGameApi.Models;

public class CompraUsuario
{
    [Key]
    public int IdCompra { get; set; }

    public int IdUsuario { get; set; }
    
    public int IdLojaItem { get; set; }

    public DateTime DataCompra { get; set; } = DateTime.Now;

    [ForeignKey("IdUsuario")]
    public Usuario? Usuario { get; set; }

    [ForeignKey("IdLojaItem")]
    public LojaItem? LojaItem { get; set; }
}