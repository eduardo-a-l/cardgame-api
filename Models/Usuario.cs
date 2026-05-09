namespace CardGameApi.Models;

public class Usuario
{
    public int IdUsuario { get; set; }
    public string NomeUsuario { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public int Pontos { get; set; }
    public int Moedas { get; set; }
    public int Vitorias { get; set; }
    public int Derrotas { get; set; }
    public int PinBatalha { get; set; }

    public List<Baralho>? Baralhos { get; set; }
}