const UsuarioCRUD = require("../model/usuarioCRUD");

var db = require("../../config/database");

class UsuarioController
{

    listarTodosUsuarios()
    {
        return function(request, response)
        {
            const usuarioCRUD = new UsuarioCRUD(db);

            usuarioCRUD
                .listagemUsuarios()
                .then((resultados) =>
                {
                    console.log("Dados (JSON) vindo da tabela usuario:");
                    console.log(resultados.recordset);

                    response.json(resultados.recordset);
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    response.status(500).json({
                        erro: "Erro ao listar todos os usuários"
                    });
                });
        };
    }


    inserirNovoUsuario()
    {
        return function(request, response)
        {
            let dados = request.body;

            console.log("Dados do novo usuário = " + dados);

            const usuarioCRUD = new UsuarioCRUD(db);

            usuarioCRUD
                .insereUsuario(dados)
                .then((usuario) =>
                {
                    console.log("Usuário foi inserido no BD com sucesso");

                    response.status(201).json(usuario);
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    if (erro === "Usuário já cadastrado")
                    {
                        return response.status(409).json({
                            erro: "Usuário já cadastrado"
                        });
                    }

                    response.status(500).json({
                        erro: "Erro ao inserir novo usuário no BD"
                    });
                });
        };
    }


    login()
    {
        return function(request, response)
        {
            let dados = request.body;

            console.log("Login do usuário = " + dados);

            const usuarioCRUD = new UsuarioCRUD(db);

            usuarioCRUD
                .loginUsuario(dados.nomeUsuario, dados.senha)
                .then((usuario) =>
                {
                    if (usuario === null)
                    {
                        return response.status(401).end();
                    }

                    response.status(200).json(usuario);
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    response.status(500).json({
                        erro: "Erro ao realizar login"
                    });
                });
        };
    }


    ranking()
    {
        return function(request, response)
        {
            const usuarioCRUD = new UsuarioCRUD(db);

            usuarioCRUD
                .rankingUsuarios()
                .then((resultados) =>
                {
                    response.json(resultados.recordset);
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    response.status(500).json({
                        erro: "Erro ao listar ranking"
                    });
                });
        };
    }


    consultarUsuarioPorId()
    {
        return function(request, response)
        {
            const idDoUsuario = request.params.id;

            console.log("Id do usuário = " + idDoUsuario);

            const usuarioCRUD = new UsuarioCRUD(db);

            usuarioCRUD
                .consultaUsuarioPorId(idDoUsuario)
                .then((resultados) =>
                {
                    if (resultados.recordset.length === 0)
                    {
                        return response.status(404).end();
                    }

                    response.json(resultados.recordset[0]);
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    response.status(500).json({
                        erro: "Erro ao listar usuário por id"
                    });
                });
        };
    }


    atualizarPinBatalha()
    {
        return function(request, response)
        {
            const id = request.params.id;

            let novoPin = request.body.novoPin;

            if (novoPin === undefined)
            {
                novoPin = request.query.novoPin;
            }

            console.log("Novo PIN de batalha = " + novoPin);

            const usuarioCRUD = new UsuarioCRUD(db);

            usuarioCRUD
                .atualizaPinBatalha(id, novoPin)
                .then(() =>
                {
                    response.status(204).end();
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    if (erro === "Usuário não encontrado")
                    {
                        return response.status(404).end();
                    }

                    response.status(500).json({
                        erro: "Erro ao atualizar PIN de batalha"
                    });
                });
        };
    }


    resultadoBatalha()
    {
        return function(request, response)
        {
            let dados = request.body;

            console.log("Resultado da batalha = " + dados);

            const usuarioCRUD = new UsuarioCRUD(db);

            usuarioCRUD
                .registraResultadoBatalha(
                    dados.idVencedor,
                    dados.idPerdedor
                )
                .then(() =>
                {
                    response.status(200).json({
                        Mensagem: "Resultado processado com sucesso"
                    });
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    if (
                        erro ===
                        "Um ou ambos os usuários não foram encontrados"
                    )
                    {
                        return response.status(404).json({
                            erro: erro
                        });
                    }

                    response.status(500).json({
                        erro: "Erro ao processar resultado da batalha"
                    });
                });
        };
    }


    excluirUsuario()
    {
        return function(request, response)
        {
            const idDoUsuario = request.params.id;

            console.log("Id do usuário a ser excluído = " + idDoUsuario);

            const usuarioCRUD = new UsuarioCRUD(db);

            usuarioCRUD
                .removeUsuario(idDoUsuario)
                .then(() =>
                {
                    response.status(204).end();
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    if (erro === "Usuário não encontrado")
                    {
                        return response.status(404).end();
                    }

                    response.status(500).json({
                        erro: "Erro ao excluir usuário"
                    });
                });
        };
    }

    atualizarFotoPerfil()
    {
        return function(request, response)
        {
            const id = request.params.id;

            if (!request.file)
            {
                return response.status(400).json({
                    erro: "Nenhuma imagem foi enviada"
                });
            }

            const caminho = "/uploads/perfis/" + request.file.filename;

            const usuarioCRUD = new UsuarioCRUD(db);

            usuarioCRUD
                .atualizaFotoPerfil(id, caminho)
                .then(() =>
                {
                    response.status(200).json({
                        FotoPerfil: caminho
                    });
                })
                .catch((erro) =>
                {
                    console.log(erro);

                    if (erro === "Usuário não encontrado")
                    {
                        return response.status(404).end();
                    }

                    response.status(500).json({
                        erro: "Erro ao atualizar foto de perfil"
                    });
                });
        };
    }

}

module.exports = UsuarioController;