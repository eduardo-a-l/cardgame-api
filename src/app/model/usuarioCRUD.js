const mssql = require("mssql");

class UsuarioCRUD {
  constructor(db) {
    this._db = db;
  }

  listagemUsuarios() {
    return new Promise((resolve, reject) => {
      var sql = "SELECT * FROM CARDGAME.USUARIO ORDER BY IDUSUARIO";

      console.log(sql);

      this._db
        .then((pool) => {
          pool.request().query(sql, function (erro, resultados) {
            if (erro) {
              console.log(erro);
              return reject("Listagem com todos os usuários falhou");
            }

            resolve(resultados);
          });
        })
        .catch((erro) => {
          console.log(erro);
          reject("Erro na conexão com o banco de dados");
        });
    });
  }

  insereUsuario(usuario) {
    return new Promise((resolve, reject) => {
      this._db
        .then(async (pool) => {
          const transacao = new mssql.Transaction(pool);

          try {
            await transacao.begin();

            var sqlExiste =
              "SELECT * FROM CARDGAME.USUARIO " +
              "WHERE NOMEUSUARIO = '" +
              usuario.nomeUsuario +
              "'";

            console.log(sqlExiste);

            var resultadoExiste = await transacao.request().query(sqlExiste);

            if (resultadoExiste.recordset.length > 0) {
              await transacao.rollback();
              return reject("Usuário já cadastrado");
            }

            var sqlInsere =
              "INSERT INTO CARDGAME.USUARIO " +
              "(NOMEUSUARIO, SENHA, PONTOS, MOEDAS, VITORIAS, DERROTAS, PINBATALHA) " +
              "OUTPUT INSERTED.* " +
              "VALUES (" +
              "'" +
              usuario.nomeUsuario +
              "'," +
              "'" +
              usuario.senha +
              "'," +
              "1000," +
              "100," +
              "0," +
              "0," +
              "0" +
              ")";

            console.log("INSERT na tabela usuario = " + sqlInsere);

            var resultadoUsuario = await transacao.request().query(sqlInsere);

            var usuarioInserido = resultadoUsuario.recordset[0];

            var sqlInventario =
              "INSERT INTO CARDGAME.INVENTARIO " +
              "(IDUSUARIO, IDCARTA) VALUES " +
              "(" + usuarioInserido.idUsuario + ",4)," +
              "(" + usuarioInserido.idUsuario + ",4)," +
              "(" + usuarioInserido.idUsuario + ",5)," +
              "(" + usuarioInserido.idUsuario + ",6)," +
              "(" + usuarioInserido.idUsuario + ",7)," +
              "(" + usuarioInserido.idUsuario + ",8)," +
              "(" + usuarioInserido.idUsuario + ",8)," +
              "(" + usuarioInserido.idUsuario + ",9)," +
              "(" + usuarioInserido.idUsuario + ",9)," +
              "(" + usuarioInserido.idUsuario + ",10)";

            console.log(
              "INSERT das cartas iniciais no inventário = " + sqlInventario
            );

            await transacao.request().query(sqlInventario);

            await transacao.commit();

            resolve(usuarioInserido);
          } catch (erro) {
            console.log(erro);

            try {
              await transacao.rollback();
            } catch (erroRollback) {
              console.log(erroRollback);
            }

            reject("Inclusão de novo usuário está com erro");
          }
        })
        .catch((erro) => {
          console.log(erro);
          reject("Erro na conexão com o banco de dados");
        });
    });
  }

  loginUsuario(nomeUsuario, senha) {
    return new Promise((resolve, reject) => {
      var sql =
        "SELECT * FROM CARDGAME.USUARIO " +
        "WHERE NOMEUSUARIO = '" +
        nomeUsuario +
        "' " +
        "AND SENHA = '" +
        senha +
        "'";

      console.log(sql);

      this._db
        .then((pool) => {
          pool.request().query(sql, function (erro, resultados) {
            if (erro) {
              console.log(erro);
              return reject("Erro ao realizar login");
            }

            if (resultados.recordset.length === 0) {
              return resolve(null);
            }

            resolve(resultados.recordset[0]);
          });
        })
        .catch((erro) => {
          console.log(erro);
          reject("Erro na conexão com o banco de dados");
        });
    });
  }

  rankingUsuarios() {
    return new Promise((resolve, reject) => {
      var sql =
        "SELECT IDUSUARIO, NOMEUSUARIO, PONTOS, MOEDAS, FOTOPERFIL " +
        "FROM CARDGAME.USUARIO " +
        "ORDER BY PONTOS DESC";

      console.log(sql);

      this._db
        .then((pool) => {
          pool.request().query(sql, function (erro, resultados) {
            if (erro) {
              console.log(erro);
              return reject("Listagem do ranking falhou");
            }

            resolve(resultados);
          });
        })
        .catch((erro) => {
          console.log(erro);
          reject("Erro na conexão com o banco de dados");
        });
    });
  }

  consultaUsuarioPorId(id) {
    return new Promise((resolve, reject) => {
      var sql =
        "SELECT IDUSUARIO, NOMEUSUARIO, PONTOS, MOEDAS, " +
        "VITORIAS, DERROTAS, PINBATALHA, FOTOPERFIL " +
        "FROM CARDGAME.USUARIO " +
        "WHERE IDUSUARIO = " +
        id;

      console.log(sql);

      this._db
        .then((pool) => {
          pool.request().query(sql, function (erro, resultados) {
            if (erro) {
              console.log(erro);
              return reject("Listagem do usuário de id " + id + " falhou");
            }

            resolve(resultados);
          });
        })
        .catch((erro) => {
          console.log(erro);
          reject("Erro na conexão com o banco de dados");
        });
    });
  }

  atualizaPinBatalha(id, novoPin) {
    return new Promise((resolve, reject) => {
      var sql =
        "UPDATE CARDGAME.USUARIO " +
        "SET PINBATALHA = " +
        novoPin +
        " WHERE IDUSUARIO = " +
        id;

      console.log(sql);

      this._db
        .then((pool) => {
          pool.request().query(sql, function (erro, resultados) {
            if (erro) {
              console.log(erro);
              return reject("Atualização do PIN de batalha falhou");
            }

            if (resultados.rowsAffected[0] === 0) {
              return reject("Usuário não encontrado");
            }

            resolve();
          });
        })
        .catch((erro) => {
          console.log(erro);
          reject("Erro na conexão com o banco de dados");
        });
    });
  }

  registraResultadoBatalha(idVencedor, idPerdedor) {
    return new Promise((resolve, reject) => {
      this._db
        .then(async (pool) => {
          const transacao = new mssql.Transaction(pool);

          try {
            await transacao.begin();

            const resVencedor = await transacao
              .request()
              .query(
                "SELECT * FROM CARDGAME.USUARIO WHERE IDUSUARIO = " + idVencedor
              );

            const resPerdedor = await transacao
              .request()
              .query(
                "SELECT * FROM CARDGAME.USUARIO WHERE IDUSUARIO = " + idPerdedor
              );

            if (
              resVencedor.recordset.length === 0 ||
              resPerdedor.recordset.length === 0
            ) {
              await transacao.rollback();
              return reject("Um ou ambos os usuários não foram encontrados");
            }

            const dadosVencedor = resVencedor.recordset[0];
            const dadosPerdedor = resPerdedor.recordset[0];

            const RA = dadosVencedor.Pontos;
            const RB = dadosPerdedor.Pontos;

            const K = 50;

            const EA = 1 / (1 + Math.pow(10, (RB - RA) / 400));

            const ganhoVencedor = Math.round(K * (1 - EA));
            const perdaPerdedor = ganhoVencedor;

            await transacao.request().query(
              `UPDATE CARDGAME.USUARIO SET ` +
                `PONTOS = PONTOS + ${ganhoVencedor}, ` +
                `MOEDAS = MOEDAS + 50, ` +
                `VITORIAS = VITORIAS + 1 ` +
                `WHERE IDUSUARIO = ${idVencedor}`
            );

            await transacao.request().query(
              `UPDATE CARDGAME.USUARIO SET ` +
                `PONTOS = PONTOS - ${perdaPerdedor}, ` +
                `MOEDAS = MOEDAS + 10, ` +
                `DERROTAS = DERROTAS + 1 ` +
                `WHERE IDUSUARIO = ${idPerdedor}`
            );

            await transacao.commit();

            resolve({ ganhoVencedor, perdaPerdedor });
          } catch (erro) {
            console.log(erro);

            try {
              await transacao.rollback();
            } catch (erroRollback) {
              console.log(erroRollback);
            }

            reject("Erro ao processar o resultado da batalha");
          }
        })
        .catch((erro) => {
          console.log(erro);
          reject("Erro na conexão com o banco de dados");
        });
    });
  }

  removeUsuario(id) {
    return new Promise((resolve, reject) => {
      this._db
        .then(async (pool) => {
          const transacao = new mssql.Transaction(pool);

          try {
            await transacao.begin();

            var resultadoUsuario = await transacao
              .request()
              .query(
                "SELECT * FROM CARDGAME.USUARIO " + "WHERE IDUSUARIO = " + id
              );

            if (resultadoUsuario.recordset.length === 0) {
              await transacao.rollback();
              return reject("Usuário não encontrado");
            }

            await transacao
              .request()
              .query(
                "DELETE FROM CARDGAME.Carta_Baralho " +
                  "WHERE idInventario IN (" +
                  "SELECT IDINVENTARIO " +
                  "FROM CARDGAME.INVENTARIO " +
                  "WHERE IDUSUARIO = " +
                  id +
                  ")"
              );

            await transacao
              .request()
              .query(
                "DELETE FROM CARDGAME.INVENTARIO " + "WHERE IDUSUARIO = " + id
              );

            await transacao
              .request()
              .query(
                "DELETE FROM CARDGAME.BARALHO " + "WHERE IDUSUARIO = " + id
              );

            await transacao
              .request()
              .query(
                "DELETE FROM CARDGAME.COMPRAUSUARIO " +
                  "WHERE IDUSUARIO = " +
                  id
              );

            await transacao
              .request()
              .query(
                "DELETE FROM CARDGAME.USUARIO " + "WHERE IDUSUARIO = " + id
              );

            await transacao.commit();

            resolve();
          } catch (erro) {
            console.log(erro);

            try {
              await transacao.rollback();
            } catch (erroRollback) {
              console.log(erroRollback);
            }

            reject("Exclusão do usuário está com erro");
          }
        })
        .catch((erro) => {
          console.log(erro);
          reject("Erro na conexão com o banco de dados");
        });
    });
  }

  atualizaFotoPerfil(id, imagem, tipoImagem) {
    return new Promise((resolve, reject) => {
      this._db
        .then((pool) => {
          pool
            .request()
            .input("id", mssql.Int, id)
            .input("imagem", mssql.VarBinary(mssql.MAX), imagem)
            .input("tipoImagem", mssql.VarChar(50), tipoImagem)
            .query(
              "UPDATE CARDGAME.USUARIO " +
                "SET FotoPerfil = @imagem, " +
                "TipoFotoPerfil = @tipoImagem " +
                "WHERE IDUSUARIO = @id",
              function (erro, resultados) {
                if (erro) {
                  console.log(erro);
                  return reject(
                    "Atualização da foto de perfil falhou"
                  );
                }

                if (resultados.rowsAffected[0] === 0) {
                  return reject("Usuário não encontrado");
                }

                resolve();
              }
            );
        })
        .catch((erro) => {
          console.log(erro);
          reject("Erro na conexão com o banco de dados");
        });
    });
  }

  consultaFotoPerfil(id) {
    return new Promise((resolve, reject) => {
      var sql =
        "SELECT FotoPerfil, TipoFotoPerfil " +
        "FROM CARDGAME.USUARIO " +
        "WHERE IDUSUARIO = " +
        id;

      this._db
        .then((pool) => {
          pool.request().query(sql, function (erro, resultados) {
            if (erro) {
              console.log(erro);
              return reject("Erro ao consultar foto de perfil");
            }

            resolve(resultados);
          });
        })
        .catch((erro) => {
          console.log(erro);
          reject("Erro na conexão com o banco de dados");
        });
    });
  }
}

module.exports = UsuarioCRUD;