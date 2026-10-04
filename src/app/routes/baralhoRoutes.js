const { Router } = require("express");
const BaralhoController = require("../controller/baralhoController");

const router = Router();
const baralhoController = new BaralhoController();

router.get("/Baralhos/:userId", baralhoController.listarBaralhosDoUsuario());
router.post("/Baralhos", baralhoController.inserirNovoBaralho());
router.put("/Baralhos/:id", baralhoController.atualizarBaralho());
router.delete("/Baralhos/:id", baralhoController.excluirBaralho());

module.exports = router;