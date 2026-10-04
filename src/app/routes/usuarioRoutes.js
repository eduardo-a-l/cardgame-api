const { Router } = require("express");
const UsuarioController = require("../controller/usuarioController");
const upload = require("../middleware/upload");

const router = Router();
const usuarioController = new UsuarioController();

router.get("/Usuarios", usuarioController.listarTodosUsuarios());
router.post("/Usuarios", usuarioController.inserirNovoUsuario());
router.post("/Usuarios/login", usuarioController.login());
router.get("/Usuarios/ranking", usuarioController.ranking());
router.get("/Usuarios/:id", usuarioController.consultarUsuarioPorId());
router.get("/Usuarios/:id/foto", usuarioController.consultarFotoPerfil());
router.patch("/Usuarios/:id/pinBatalha", usuarioController.atualizarPinBatalha());
router.put("/Usuarios/resultado-batalha", usuarioController.resultadoBatalha());
router.delete("/Usuarios/:id", usuarioController.excluirUsuario());
router.patch("/Usuarios/:id/foto", upload.single("foto"), usuarioController.atualizarFotoPerfil());

module.exports = router;