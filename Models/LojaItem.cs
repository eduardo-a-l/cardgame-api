namespace CardGameApi.Models;

public class LojaItem {
    public int IdLojaItem { get; set; }
    public int IdCarta { get; set; }
    public int Preco { get; set; }
    public bool EhOferta { get; set; }
    public bool Ativo { get; set; }
    
    public Carta? Carta { get; set; }
}