const CartaController = require("../controller/cartaController");

const obj_CartaController = new CartaController();

module.exports = (aplicacao) => {

    aplicacao.use((request, response, next) => {

        response.header("Access-Control-Allow-Origin", "*");

        next();

    });

    aplicacao.get("/Cartas", obj_CartaController.listarTodasCartas());

    aplicacao.get(
        "/Cartas/:id",
        obj_CartaController.consultarCartaPorId()
    );

    aplicacao.delete(
        "/Cartas/:id",
        obj_CartaController.excluirCarta()
    );

    aplicacao.post(
        "/Cartas",
        obj_CartaController.inserirNovaCarta()
    );

    aplicacao.put(
        "/Cartas/:id",
        obj_CartaController.atualizarDadosCarta()
    );

    aplicacao.get(
        "/Inventario",
        obj_CartaController.listarInventario()
    );

    aplicacao.get(
        "/Inventario/:idUsuario",
        obj_CartaController.listarInventarioPorUsuario()
    );

    aplicacao.post(
        "/Inventario",
        obj_CartaController.inserirInventario()
    );

};