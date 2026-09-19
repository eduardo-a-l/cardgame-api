const BaralhoCRUD = require("../model/baralhoCRUD");

var db = require("../../config/database");

class BaralhoController
{

    listarBaralhosDoUsuario()
    {
        return function(request, response)
        {
            const idUsuario = request.params.userId;

            const baralhoCRUD = new BaralhoCRUD(db);

            baralhoCRUD
                .listagemBaralhosPorUsuario(idUsuario)
                .then((resultados) =>
                {
                    var baralhos = [];

                    resultados.recordset.forEach((linha) =>
                    {
                        var baralho = baralhos.find(
                            b => b.idBaralho === linha.idBaralho
                        );

                        if (!baralho)
                        {
                            baralho = {
                                idBaralho: linha.idBaralho,
                                nome: linha.nome,
                                idUsuario: linha.idUsuario,
                                Inventarios: []
                            };

                            baralhos.push(baralho);
                        }

                        if (linha.IdInventario !== null)
                        {
                            baralho.Inventarios.push({
                                IdInventario: linha.IdInventario,
                                IdUsuario: linha.IdUsuario,
                                IdCarta: linha.IdCarta,
                                Carta: {
                                    IdCarta: linha.Carta_IdCarta,
                                    Nome: linha.Carta_Nome,
                                    Tipo: linha.Carta_Tipo,
                                    Raridade: linha.Carta_Raridade,
                                    PrecoPadrao: linha.Carta_PrecoPadrao,
                                    Vida: linha.Carta_Vida,
                                    Acao1: linha.Carta_Acao1,
                                    Acao2: linha.Carta_Acao2
                                }
                            });
                        }
                    });

                    response.json(baralhos);
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    response.status(500).json({
                        erro: "Erro ao listar baralhos do usuário"
                    });
                });
        };
    }


    inserirNovoBaralho()
    {
        return function(request, response)
        {
            let dados = request.body;

            console.log("Dados do novo baralho = " + dados);

            const baralhoCRUD = new BaralhoCRUD(db);

            baralhoCRUD
                .insereBaralho(dados)
                .then((baralho) =>
                {
                    response.status(201).json(baralho);
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    response.status(500).json({
                        erro: "Erro ao inserir novo baralho"
                    });
                });
        };
    }


    atualizarBaralho()
    {
        return function(request, response)
        {
            const id = request.params.id;

            let dados = request.body;

            console.log("Dados do baralho a serem atualizados = " + dados);

            const baralhoCRUD = new BaralhoCRUD(db);

            baralhoCRUD
                .atualizaBaralho(id, dados)
                .then(() =>
                {
                    response.status(204).end();
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    if (erro === "Baralho não encontrado")
                    {
                        return response.status(404).end();
                    }

                    response.status(500).json({
                        erro: "Erro ao atualizar baralho"
                    });
                });
        };
    }


    excluirBaralho()
    {
        return function(request, response)
        {
            const id = request.params.id;

            console.log("Id do baralho = " + id);

            const baralhoCRUD = new BaralhoCRUD(db);

            baralhoCRUD
                .removeBaralho(id)
                .then(() =>
                {
                    response.status(204).end();
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    if (erro === "Baralho não encontrado")
                    {
                        return response.status(404).end();
                    }

                    response.status(500).json({
                        erro: "Erro ao excluir baralho"
                    });
                });
        };
    }

}

module.exports = BaralhoController;