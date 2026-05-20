namespace CardGameApi.Models;

public class Carta
{
    public int IdCarta { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string Raridade { get; set; } = string.Empty;
    public int PrecoPadrao { get; set; }
    public int? Vida { get; set; }
    public string? Acao1 { get; set; }
    public string? Acao2 { get; set; }
}