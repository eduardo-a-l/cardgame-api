namespace CardGameApi.Models;

public class Inventario
{
    public int IdInventario { get; set; }
    public int IdUsuario { get; set; }
    public int IdCarta { get; set; }
    
    public Usuario? Usuario { get; set; } 
    public Carta? Carta { get; set; } 
}