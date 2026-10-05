const UsuarioCRUD = require("../model/usuarioCRUD");
const db = require("../../config/database");

class UsuarioController {
    listarTodosUsuarios() {
        return async (request, response) => {
            try {
                const usuarioCRUD = new UsuarioCRUD(db);
                const resultados = await usuarioCRUD.listagemUsuarios();

                return response.json(resultados);
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao listar todos os usuários"
                });
            }
        };
    }

    inserirNovoUsuario() {
        return async (request, response) => {
            try {
                const dados = request.body;
                const usuarioCRUD = new UsuarioCRUD(db);

                const usuario = await usuarioCRUD.insereUsuario(dados);
                return response.status(201).json(usuario);
            } catch (erro) {
                console.error(erro);

                const mensagemErro = erro.message || erro;

                if (mensagemErro === "Usuário já cadastrado") {
                    return response.status(409).json({
                        erro: "Usuário já cadastrado"
                    });
                }

                return response.status(500).json({
                    erro: "Erro ao inserir novo usuário no BD"
                });
            }
        };
    }

    login() {
        return async (request, response) => {
            try {
                const { nomeUsuario, senha } = request.body;
                const usuarioCRUD = new UsuarioCRUD(db);

                const usuario = await usuarioCRUD.loginUsuario(nomeUsuario, senha);

                if (usuario === null) {
                    return response.status(401).end();
                }

                return response.status(200).json(usuario);
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao realizar login"
                });
            }
        };
    }

    ranking() {
        return async (request, response) => {
            try {
                const usuarioCRUD = new UsuarioCRUD(db);
                const resultados = await usuarioCRUD.rankingUsuarios();

                return response.json(resultados);
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao listar ranking"
                });
            }
        };
    }

    consultarUsuarioPorId() {
        return async (request, response) => {
            try {
                const idDoUsuario = request.params.id;
                const usuarioCRUD = new UsuarioCRUD(db);

                const resultados = await usuarioCRUD.consultaUsuarioPorId(idDoUsuario);

                if (!resultados || resultados.length === 0) {
                    return response.status(404).json({
                        erro: "Usuário não encontrado"
                    });
                }

                return response.json(resultados[0]);
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao listar usuário por id"
                });
            }
        };
    }

    atualizarPinBatalha() {
        return async (request, response) => {
            try {
                const { id } = request.params;
                const novoPin = request.body.novoPin ?? request.query.novoPin;

                const usuarioCRUD = new UsuarioCRUD(db);
                await usuarioCRUD.atualizaPinBatalha(id, novoPin);

                return response.status(204).end();
            } catch (erro) {
                console.error(erro);

                const mensagemErro = erro.message || erro;

                if (mensagemErro === "Usuário não encontrado") {
                    return response.status(404).end();
                }

                return response.status(500).json({
                    erro: "Erro ao atualizar PIN de batalha"
                });
            }
        };
    }

    resultadoBatalha() {
        return async (request, response) => {
            try {
                const { idVencedor, idPerdedor } = request.body;
                const usuarioCRUD = new UsuarioCRUD(db);

                await usuarioCRUD.registraResultadoBatalha(idVencedor, idPerdedor);

                return response.status(200).json({
                    Mensagem: "Resultado processado com sucesso"
                });
            } catch (erro) {
                console.error(erro);

                const mensagemErro = erro.message || erro;

                if (
                    mensagemErro === "Um ou ambos os usuários não foram encontrados"
                ) {
                    return response.status(404).json({
                        erro: mensagemErro
                    });
                }

                return response.status(500).json({
                    erro: "Erro ao processar resultado da batalha"
                });
            }
        };
    }

    excluirUsuario() {
        return async (request, response) => {
            try {
                const idDoUsuario = request.params.id;
                const usuarioCRUD = new UsuarioCRUD(db);

                await usuarioCRUD.removeUsuario(idDoUsuario);

                return response.status(204).end();
            } catch (erro) {
                console.error(erro);

                const mensagemErro = erro.message || erro;

                if (mensagemErro === "Usuário não encontrado") {
                    return response.status(404).end();
                }

                return response.status(500).json({
                    erro: "Erro ao excluir usuário"
                });
            }
        };
    }

    atualizarFotoPerfil() {
        return async (request, response) => {
            try {
                const { id } = request.params;

                if (!request.file) {
                    return response.status(400).json({
                        erro: "Nenhuma imagem foi enviada"
                    });
                }

                const imagem = request.file.buffer;
                const tipoImagem = request.file.mimetype;

                const usuarioCRUD = new UsuarioCRUD(db);
                await usuarioCRUD.atualizaFotoPerfil(id, imagem, tipoImagem);

                return response.status(200).json({
                    mensagem: "Foto de perfil atualizada com sucesso"
                });
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao atualizar foto de perfil"
                });
            }
        };
    }

    consultarFotoPerfil() {
        return async (request, response) => {
            try {
                const { id } = request.params;
                const usuarioCRUD = new UsuarioCRUD(db);

                const resultados = await usuarioCRUD.consultaFotoPerfil(id);

                if (!resultados || resultados.length === 0) {
                    return response.status(404).end();
                }

                const usuario = resultados[0];

                if (!usuario.fotoPerfil) {
                    return response.status(404).end();
                }

                response.set("Content-Type", usuario.tipoFotoPerfil);
                return response.send(usuario.fotoPerfil);
            } catch (erro) {
                console.error(erro);
                return response.status(500).json({
                    erro: "Erro ao consultar foto de perfil"
                });
            }
        };
    }
}

module.exports = UsuarioController;