const LojaCRUD = require("../model/lojaCRUD");
const db = require("../../config/database");

class LojaController {
    listarItensLoja() {
        return async (request, response) => {
            try {
                const { idUsuario } = request.params;
                const lojaCRUD = new LojaCRUD(db);

                const resultados = await lojaCRUD.listagemItensLoja(idUsuario);

                return response.json(resultados);
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao listar itens da loja"
                });
            }
        };
    }

    listagemPacotes() {
        return async (request, response) => {
            try {
                const lojaCRUD = new LojaCRUD(db);
                const resultado = await lojaCRUD.listagemPacotes();

                return response.status(200).json(resultado);
            } catch (erro) {
                console.error(erro);

                return response.status(500).json({
                    erro: "Erro ao listar pacotes"
                });
            }
        };
    }

    comprarItem() {
        return async (request, response) => {
            try {
                const { userId, idLojaItem } = request.params;
                const lojaCRUD = new LojaCRUD(db);

                const resultado = await lojaCRUD.comprarItem(userId, idLojaItem);
                return response.status(200).json(resultado);
            } catch (erro) {
                console.error(erro);

                const mensagemErro = erro.message || erro;

                if (mensagemErro === "Usuário ou item não encontrado") {
                    return response.status(404).json({ erro: mensagemErro });
                }

                if (mensagemErro === "Saldo insuficiente") {
                    return response.status(400).json({ erro: mensagemErro });
                }

                if (mensagemErro === "Você já adquiriu esta oferta única") {
                    return response.status(409).json({ erro: mensagemErro });
                }

                return response.status(500).json({
                    erro: "Erro ao realizar compra"
                });
            }
        };
    }

    comprarPacote() {
        return async (request, response) => {
            try {
                const { userId, idPacote } = request.params;
                const lojaCRUD = new LojaCRUD(db);

                const resultado = await lojaCRUD.comprarPacote(userId, idPacote);

                return response.status(200).json(resultado);
            } catch (erro) {
                console.error(erro);

                const mensagemErro = erro.message || erro;

                if (mensagemErro === "Usuário ou pacote não encontrado") {
                    return response.status(404).json({ erro: mensagemErro });
                }

                if ( mensagemErro === "Saldo insuficiente" || mensagemErro === "Pacote sem probabilidades cadastradas" ||
                    mensagemErro === "As probabilidades do pacote devem somar 100%" || mensagemErro === "Não foi possível sortear a raridade" ) {
                    return response.status(400).json({
                        erro: mensagemErro
                    });
                }

                if ( mensagemErro.startsWith( "Não existem cartas cadastradas com raridade" )) {
                    return response.status(400).json({ erro: mensagemErro });
                }

                return response.status(500).json({ erro: "Erro ao realizar compra do pacote" });
            }
        };
    }


    venderCarta() {
        return async (request, response) => {
            try {
                const { userId, idCarta } = request.params;
                const lojaCRUD = new LojaCRUD(db);

                const resultado = await lojaCRUD.venderCarta(userId, idCarta);
                return response.status(200).json(resultado);
            } catch (erro) {
                console.error(erro);

                const mensagemErro = erro.message || erro;

                if (mensagemErro === "Usuário não encontrado") {
                    return response.status(404).json({ erro: mensagemErro });
                }

                if (mensagemErro === "Você não possui essa carta no inventário") {
                    return response.status(400).json({ Mensagem: mensagemErro });
                }

                return response.status(500).json({
                    erro: "Erro ao vender carta"
                });
            }
        };
    }
}

module.exports = LojaController;