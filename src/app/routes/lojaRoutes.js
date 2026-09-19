const LojaController = require("../controller/lojaController");

const obj_LojaController = new LojaController();

module.exports = (aplicacao) => {

    aplicacao.use((request, response, next) => {

        response.header("Access-Control-Allow-Origin", "*");

        next();

    });

    aplicacao.get(
        "/Loja/itens/:idUsuario",
        obj_LojaController.listarItensLoja()
    );

    aplicacao.post(
        "/Loja/comprar/:userId/:idLojaItem",
        obj_LojaController.comprarItem()
    );

    aplicacao.post(
        "/Loja/vender/:userId/:idCarta",
        obj_LojaController.venderCarta()
    );

};