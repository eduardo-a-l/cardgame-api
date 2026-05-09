namespace CardGameApi.Models;

public class Carta
{
    public int IdCarta { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string Raridade { get; set; } = string.Empty;
    public int Preco { get; set; }
}