const CartaCRUD = require("../model/cartaCRUD");

var db = require("../../config/database");

class CartaController
{

listarTodasCartas()
{
    return function(request, response)
    {
        const cartaCRUD = new CartaCRUD(db);

        cartaCRUD
            .listagemCartas()
            .then((resultados) =>
            {
                console.log("Dados (JSON) vindo da tabela carta:");
                console.log(resultados.recordset);

                response.json(resultados.recordset);
            })
            .catch((erro) =>
            {
                console.log(erro);

                response.status(500).json({
                    erro: "Erro ao listar todas as cartas"
                });
            });
    };
}

consultarCartaPorId()
{
    return function(request, response)
    {
        const idDaCarta = request.params.id;

        console.log("Id da carta = " + idDaCarta);

        const cartaCRUD = new CartaCRUD(db);

        cartaCRUD
            .consultaCartaPorId(idDaCarta)
            .then((resultados) =>
            {
                console.log("Dados (JSON) da carta especificada:");
                console.log(resultados.recordset);

                response.json(resultados.recordset);
            })
            .catch((erro) =>
            {
                console.log(erro);

                response.status(500).json({
                    erro: "Erro ao listar carta por id"
                });
            });
    };
}

inserirNovaCarta()
{
    return function(request, response)
    {
        let dados = request.body;

        console.log("Dados da nova carta = " + dados);

        const cartaCRUD = new CartaCRUD(db);

        cartaCRUD
            .insereCarta(dados)
            .then(() =>
            {
                console.log("carta foi inserida no bd com sucesso");

                response.status(200).end();
            })
            .catch((erro) =>
            {
                console.log(erro);

                response.status(500).json({
                    erro: "Erro ao inserir nova carta no bd"
                });
            });
    };
}

atualizarDadosCarta()
{
    return function(request, response)
    {
        let dados = request.body;
        let id = request.params.id;

        console.log("Dados da carta a serem atualizados = " + dados);

        const cartaCRUD = new CartaCRUD(db);

        cartaCRUD
            .atualizaCarta(id, dados)
            .then(() =>
            {
                console.log("Dados da carta foram atualizados com sucesso");

                response.status(200).end();
            })
            .catch((erro) =>
            {
                console.log(erro);

                response.status(500).json({
                    erro: "Erro ao atualizar dados da carta no bd"
                });
            });
    };
}

excluirCarta()
{
    return function(request, response)
    {
        const idDaCarta = request.params.id;

        const cartaCRUD = new CartaCRUD(db);

        cartaCRUD
            .removeCarta(idDaCarta)
            .then(() =>
            {
                console.log("Carta foi excluída do bd com sucesso");

                response.status(200).end();
            })
            .catch((erro) =>
            {
                console.log(erro);

                response.status(500).json({
                    erro: "Erro ao excluir carta no bd"
                });
            });
    };
}

listarInventario()
{
    return function(request, response)
    {
        const cartaCRUD = new CartaCRUD(db);

        cartaCRUD
            .listagemInventario()
            .then((resultados) =>
            {
                console.log("Dados (JSON) do inventário:");
                console.log(resultados.recordset);

                response.json(resultados.recordset);
            })
            .catch((erro) =>
            {
                console.log(erro);

                response.status(500).json({
                    erro: "Erro ao listar inventário"
                });
            });
    };
}

listarInventarioPorUsuario()
{
    return function(request, response)
    {
        const idUsuario = request.params.idUsuario;

        const cartaCRUD = new CartaCRUD(db);

        cartaCRUD
            .listagemInventarioPorUsuario(idUsuario)
            .then((resultados) =>
            {
                response.json(resultados.recordset);
            })
            .catch((erro) =>
            {
                console.log(erro);

                response.status(500).json({
                    erro: "Erro ao listar inventário do usuário"
                });
            });
    };
}

inserirInventario()
{
    return function(request, response)
    {
        let dados = request.body;

        console.log("Dados do novo item do inventário = " + dados);

        const cartaCRUD = new CartaCRUD(db);

        cartaCRUD
            .insereInventario(dados)
            .then(() =>
            {
                console.log("Item foi inserido no inventário com sucesso");

                response.status(200).end();
            })
            .catch((erro) =>
            {
                console.log(erro);

                response.status(500).json({
                    erro: "Erro ao inserir item no inventário"
                });
            });
    };
}

}

module.exports = CartaController;
