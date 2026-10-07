const ConquistaCRUD = require("../model/conquistaCRUD");
const db = require("../../config/database");

class ConquistaController {
    listarConquistasDoUsuario() {
        return async (request, response) => {
            try {
                const { idUsuario } = request.params;
                const conquistaCRUD = new ConquistaCRUD(db);

                const conquistas = await conquistaCRUD.listarEVerificarConquistasDoUsuario(idUsuario);
                return response.json(conquistas);
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({ erro: "Erro ao listar conquistas do usuário" });
            }
        };
    }
}

module.exports = ConquistaController;