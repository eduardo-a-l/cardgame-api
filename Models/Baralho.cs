namespace CardGameApi.Models;

public class Baralho
{
    public int idBaralho { get; set; }
    public string nome { get; set; } = string.Empty;
    public int idUsuario { get; set; }

    public List<Inventario> Inventarios { get; set; } = new();
}