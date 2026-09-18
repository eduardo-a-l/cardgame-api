namespace CardGameApi.Models;

public class Usuario
{
    public int IdUsuario { get; set; }
    public string NomeUsuario { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public int Pontos { get; set; } = 0;
    public int Moedas { get; set; } = 100;
    public int Vitorias { get; set; } = 0;
    public int Derrotas { get; set; } = 0;
    public int PinBatalha { get; set; } = 0;

    public List<Baralho>? Baralhos { get; set; }
}