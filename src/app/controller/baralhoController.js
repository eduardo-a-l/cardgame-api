const BaralhoCRUD = require("../model/baralhoCRUD");
const db = require("../../config/database");

class BaralhoController {
    listarBaralhosDoUsuario() {
        return async (request, response) => {
            try {
                const idUsuario = request.params.userId;
                const baralhoCRUD = new BaralhoCRUD(db);

                const resultados = await baralhoCRUD.listagemBaralhosPorUsuario(idUsuario);
                const baralhos = [];

                resultados.forEach((linha) => {
                    let baralho = baralhos.find((b) => b.idBaralho === linha.idBaralho);

                    if (!baralho) {
                        baralho = {
                            idBaralho: linha.idBaralho,
                            nome: linha.nome,
                            idUsuario: linha.idUsuario,
                            Inventarios: []
                        };
                        baralhos.push(baralho);
                    }

                    if (linha.IdInventario !== null && linha.IdInventario !== undefined) {
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

                return response.json(baralhos);
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao listar baralhos do usuário"
                });
            }
        };
    }

    inserirNovoBaralho() {
        return async (request, response) => {
            try {
                const dados = request.body;
                const baralhoCRUD = new BaralhoCRUD(db);

                const baralho = await baralhoCRUD.insereBaralho(dados);
                return response.status(201).json(baralho);
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao inserir novo baralho"
                });
            }
        };
    }

    atualizarBaralho() {
        return async (request, response) => {
            try {
                const { id } = request.params;
                const dados = request.body;
                const baralhoCRUD = new BaralhoCRUD(db);

                await baralhoCRUD.atualizaBaralho(id, dados);
                return response.status(204).end();
            } catch (erro) {
                console.error(erro);

                if (erro.message === "Baralho não encontrado") {
                    return response.status(404).end();
                }

                return response.status(500).json({
                    erro: "Erro ao atualizar baralho"
                });
            }
        };
    }

    excluirBaralho() {
        return async (request, response) => {
            try {
                const { id } = request.params;
                const baralhoCRUD = new BaralhoCRUD(db);

                await baralhoCRUD.removeBaralho(id);
                return response.status(204).end();
            } catch (erro) {
                console.error(erro);

                if (erro.message === "Baralho não encontrado") {
                    return response.status(404).end();
                }

                return response.status(500).json({
                    erro: "Erro ao excluir baralho"
                });
            }
        };
    }
}

module.exports = BaralhoController;