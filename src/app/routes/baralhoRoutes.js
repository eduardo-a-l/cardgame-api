const BaralhoController = require("../controller/baralhoController");

const obj_BaralhoController = new BaralhoController();

module.exports = (aplicacao) => {

    aplicacao.use((request, response, next) => {

        response.header("Access-Control-Allow-Origin", "*");

        next();

    });

    aplicacao.get(
        "/Baralhos/:userId",
        obj_BaralhoController.listarBaralhosDoUsuario()
    );

    aplicacao.post(
        "/Baralhos",
        obj_BaralhoController.inserirNovoBaralho()
    );

    aplicacao.put(
        "/Baralhos/:id",
        obj_BaralhoController.atualizarBaralho()
    );

    aplicacao.delete(
        "/Baralhos/:id",
        obj_BaralhoController.excluirBaralho()
    );

};