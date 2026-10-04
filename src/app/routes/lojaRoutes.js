const { Router } = require("express");
const LojaController = require("../controller/lojaController");

const router = Router();
const lojaController = new LojaController();

router.get("/Loja/itens/:idUsuario", lojaController.listarItensLoja());
router.post("/Loja/comprar/:userId/:idLojaItem", lojaController.comprarItem());
router.post("/Loja/vender/:userId/:idCarta", lojaController.venderCarta());

module.exports = router;