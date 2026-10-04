const CartaCRUD = require("../model/cartaCRUD");
const db = require("../../config/database");

class CartaController {
    listarTodasCartas() {
        return async (request, response) => {
            try {
                const cartaCRUD = new CartaCRUD(db);
                const resultados = await cartaCRUD.listagemCartas();

                return response.json(resultados);
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao listar todas as cartas"
                });
            }
        };
    }

    consultarCartaPorId() {
        return async (request, response) => {
            try {
                const idDaCarta = request.params.id;
                const cartaCRUD = new CartaCRUD(db);

                const resultados = await cartaCRUD.consultaCartaPorId(idDaCarta);

                if (!resultados || resultados.length === 0) {
                    return response.status(404).json({ erro: "Carta não encontrada" });
                }

                return response.json(resultados);
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao listar carta por id"
                });
            }
        };
    }

    inserirNovaCarta() {
        return async (request, response) => {
            try {
                const dados = request.body;
                const cartaCRUD = new CartaCRUD(db);

                await cartaCRUD.insereCarta(dados);
                return response.status(201).end();
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao inserir nova carta no bd"
                });
            }
        };
    }

    atualizarDadosCarta() {
        return async (request, response) => {
            try {
                const { id } = request.params;
                const dados = request.body;
                const cartaCRUD = new CartaCRUD(db);

                await cartaCRUD.atualizaCarta(id, dados);
                return response.status(200).end();
            } catch (erro) {
                console.error(erro);

                if (erro.message === "Carta não encontrada") {
                    return response.status(404).end();
                }

                return response.status(500).json({
                    erro: "Erro ao atualizar dados da carta no bd"
                });
            }
        };
    }

    excluirCarta() {
        return async (request, response) => {
            try {
                const idDaCarta = request.params.id;
                const cartaCRUD = new CartaCRUD(db);

                await cartaCRUD.removeCarta(idDaCarta);
                return response.status(204).end();
            } catch (erro) {
                console.error(erro);

                if (erro.message === "Carta não encontrada") {
                    return response.status(404).end();
                }

                return response.status(500).json({
                    erro: "Erro ao excluir carta no bd"
                });
            }
        };
    }

    listarInventario() {
        return async (request, response) => {
            try {
                const cartaCRUD = new CartaCRUD(db);
                const resultados = await cartaCRUD.listagemInventario();

                return response.json(resultados);
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao listar inventário"
                });
            }
        };
    }

    listarInventarioPorUsuario() {
        return async (request, response) => {
            try {
                const { idUsuario } = request.params;
                const cartaCRUD = new CartaCRUD(db);

                const resultados = await cartaCRUD.listagemInventarioPorUsuario(idUsuario);
                return response.json(resultados);
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao listar inventário do usuário"
                });
            }
        };
    }

    inserirInventario() {
        return async (request, response) => {
            try {
                const dados = request.body;
                const cartaCRUD = new CartaCRUD(db);

                await cartaCRUD.insereInventario(dados);
                return response.status(201).end();
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao inserir item no inventário"
                });
            }
        };
    }
}

module.exports = CartaController;