const { Router } = require("express");
const CartaController = require("../controller/cartaController");

const router = Router();
const cartaController = new CartaController();

router.get("/Cartas", cartaController.listarTodasCartas());
router.get("/Cartas/:id", cartaController.consultarCartaPorId());
router.post("/Cartas", cartaController.inserirNovaCarta());
router.put("/Cartas/:id", cartaController.atualizarDadosCarta());
router.delete("/Cartas/:id", cartaController.excluirCarta());

router.get("/Inventario", cartaController.listarInventario());
router.get("/Inventario/:idUsuario", cartaController.listarInventarioPorUsuario());
router.post("/Inventario", cartaController.inserirInventario());

module.exports = router;