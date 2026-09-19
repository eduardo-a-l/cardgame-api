const UsuarioController = require("../controller/usuarioController");

const obj_UsuarioController = new UsuarioController();

const upload = require("../middleware/upload");

module.exports = (aplicacao) => {

    aplicacao.use((request, response, next) => {

        response.header("Access-Control-Allow-Origin", "*");

        next();

    });

    aplicacao.get(
        "/Usuarios",
        obj_UsuarioController.listarTodosUsuarios()
    );

    aplicacao.post(
        "/Usuarios",
        obj_UsuarioController.inserirNovoUsuario()
    );

    aplicacao.post(
        "/Usuarios/login",
        obj_UsuarioController.login()
    );

    aplicacao.get(
        "/Usuarios/ranking",
        obj_UsuarioController.ranking()
    );

    aplicacao.get(
        "/Usuarios/:id",
        obj_UsuarioController.consultarUsuarioPorId()
    );

    aplicacao.patch(
        "/Usuarios/:id/pinBatalha",
        obj_UsuarioController.atualizarPinBatalha()
    );

    aplicacao.put(
        "/Usuarios/resultado-batalha",
        obj_UsuarioController.resultadoBatalha()
    );

    aplicacao.delete(
        "/Usuarios/:id",
        obj_UsuarioController.excluirUsuario()
    );

    aplicacao.patch(
        "/Usuarios/:id/foto",
        upload.single("foto"),
        obj_UsuarioController.atualizarFotoPerfil()
    );

};