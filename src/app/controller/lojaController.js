const LojaCRUD = require("../model/lojaCRUD");

var db = require("../../config/database");

class LojaController
{

    listarItensLoja()
    {
        return function(request, response)
        {
            const idUsuario = request.params.idUsuario;

            const lojaCRUD = new LojaCRUD(db);

            lojaCRUD
                .listagemItensLoja(idUsuario)
                .then((resultados) =>
                {
                    console.log("Dados (JSON) dos itens da loja:");
                    console.log(resultados.recordset);

                    response.json(resultados.recordset);
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    response.status(500).json({
                        erro: "Erro ao listar itens da loja"
                    });
                });
        };
    }


    comprarItem()
    {
        return function(request, response)
        {
            const userId = request.params.userId;
            const idLojaItem = request.params.idLojaItem;

            const lojaCRUD = new LojaCRUD(db);

            lojaCRUD
                .comprarItem(userId, idLojaItem)
                .then((resultado) =>
                {
                    response.status(200).json(resultado);
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    if (erro === "Usuário ou item não encontrado")
                    {
                        return response.status(404).json({
                            erro: erro
                        });
                    }

                    if (erro === "Saldo insuficiente")
                    {
                        return response.status(400).json({
                            erro: erro
                        });
                    }

                    if (erro === "Você já adquiriu esta oferta única")
                    {
                        return response.status(409).json({
                            erro: erro
                        });
                    }

                    response.status(500).json({
                        erro: "Erro ao realizar compra"
                    });
                });
        };
    }


    venderCarta()
    {
        return function(request, response)
        {
            const userId = request.params.userId;
            const idCarta = request.params.idCarta;

            const lojaCRUD = new LojaCRUD(db);

            lojaCRUD
                .venderCarta(userId, idCarta)
                .then((resultado) =>
                {
                    response.status(200).json(resultado);
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    if (erro === "Usuário não encontrado")
                    {
                        return response.status(404).json({
                            erro: erro
                        });
                    }

                    if (erro === "Você não possui essa carta no inventário")
                    {
                        return response.status(400).json({
                            Mensagem: erro
                        });
                    }

                    response.status(500).json({
                        erro: "Erro ao vender carta"
                    });
                });
        };
    }

}

module.exports = LojaController;