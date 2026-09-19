const mssql = require("mssql");

class BaralhoCRUD
{

    constructor(db){
        this._db = db;
    }


    listagemBaralhosPorUsuario(idUsuario)
    {
        return new Promise((resolve, reject) =>
        {
            var sql =
                "SELECT " +
                "B.idBaralho AS idBaralho, " +
                "B.nome AS nome, " +
                "B.idUsuario AS idUsuario, " +
                "I.IdInventario AS IdInventario, " +
                "I.IdUsuario AS IdUsuario, " +
                "I.IdCarta AS IdCarta, " +
                "C.IdCarta AS Carta_IdCarta, " +
                "C.Nome AS Carta_Nome, " +
                "C.Tipo AS Carta_Tipo, " +
                "C.Raridade AS Carta_Raridade, " +
                "C.Precopadrao AS Carta_PrecoPadrao, " +
                "C.Vida AS Carta_Vida, " +
                "C.Acao1 AS Carta_Acao1, " +
                "C.Acao2 AS Carta_Acao2 " +
                "FROM CARDGAME.Baralho B " +
                "LEFT JOIN CARDGAME.Carta_Baralho CB " +
                "ON B.idBaralho = CB.idBaralho " +
                "LEFT JOIN CARDGAME.Inventario I " +
                "ON CB.idInventario = I.IdInventario " +
                "LEFT JOIN CARDGAME.Carta C " +
                "ON I.IdCarta = C.IdCarta " +
                "WHERE B.idUsuario = " + idUsuario + " " +
                "ORDER BY B.idBaralho";

            console.log(sql);

            this._db.then((pool) =>
            {
                pool.request().query(sql, function(erro, resultados)
                {
                    if (erro)
                    {
                        console.log(erro);
                        return reject("Listagem dos baralhos falhou");
                    }

                    resolve(resultados);
                });
            }).catch((erro) =>
            {
                console.log(erro);
                reject("Erro na conexão com o banco de dados");
            });
        });
    }


    insereBaralho(baralho)
    {
        return new Promise((resolve, reject) =>
        {
            var sql =
                "INSERT INTO CARDGAME.Baralho " +
                "(nome, idUsuario) " +
                "OUTPUT INSERTED.idBaralho, INSERTED.nome, INSERTED.idUsuario " +
                "VALUES (" +
                "'" + baralho.nome + "'," +
                baralho.idUsuario +
                ")";

            console.log("INSERT na tabela baralho = " + sql);

            this._db.then((pool) =>
            {
                pool.request().query(sql, function(erro, resultados)
                {
                    if (erro)
                    {
                        console.log(erro);
                        return reject("Inclusão de novo baralho está com erro");
                    }

                    resolve(resultados.recordset[0]);
                });
            }).catch((erro) =>
            {
                console.log(erro);
                reject("Erro na conexão com o banco de dados");
            });
        });
    }


    atualizaBaralho(id, baralho)
    {
        return new Promise((resolve, reject) =>
        {
            this._db.then(async (pool) =>
            {
                const transacao = new mssql.Transaction(pool);

                try
                {
                    await transacao.begin();

                    var resultadoBaralho = await transacao.request().query(
                        "SELECT * FROM CARDGAME.Baralho " +
                        "WHERE idBaralho = " + id
                    );

                    if (resultadoBaralho.recordset.length === 0)
                    {
                        await transacao.rollback();
                        return reject("Baralho não encontrado");
                    }

                    await transacao.request().query(
                        "UPDATE CARDGAME.Baralho SET " +
                        "nome = '" + baralho.nome + "' " +
                        "WHERE idBaralho = " + id
                    );

                    await transacao.request().query(
                        "DELETE FROM CARDGAME.Carta_Baralho " +
                        "WHERE idBaralho = " + id
                    );

                    if (
                        baralho.inventarios &&
                        baralho.inventarios.length > 0
                    )
                    {
                        for (const inventario of baralho.inventarios)
                        {
                            await transacao.request().query(
                                "INSERT INTO CARDGAME.Carta_Baralho " +
                                "(idBaralho, idInventario) " +
                                "VALUES (" +
                                id + "," +
                                inventario.IdInventario +
                                ")"
                            );
                        }
                    }

                    await transacao.commit();

                    resolve();
                }
                catch (erro)
                {
                    console.log(erro);

                    try
                    {
                        await transacao.rollback();
                    }
                    catch (erroRollback)
                    {
                        console.log(erroRollback);
                    }

                    reject("Atualização do baralho está com erro");
                }
            }).catch((erro) =>
            {
                console.log(erro);
                reject("Erro na conexão com o banco de dados");
            });
        });
    }


    removeBaralho(id)
    {
        return new Promise((resolve, reject) =>
        {
            this._db.then(async (pool) =>
            {
                const transacao = new mssql.Transaction(pool);

                try
                {
                    await transacao.begin();

                    var resultadoBaralho = await transacao.request().query(
                        "SELECT * FROM CARDGAME.Baralho " +
                        "WHERE idBaralho = " + id
                    );

                    if (resultadoBaralho.recordset.length === 0)
                    {
                        await transacao.rollback();
                        return reject("Baralho não encontrado");
                    }

                    await transacao.request().query(
                        "DELETE FROM CARDGAME.Carta_Baralho " +
                        "WHERE idBaralho = " + id
                    );

                    await transacao.request().query(
                        "DELETE FROM CARDGAME.Baralho " +
                        "WHERE idBaralho = " + id
                    );

                    await transacao.commit();

                    resolve();
                }
                catch (erro)
                {
                    console.log(erro);

                    try
                    {
                        await transacao.rollback();
                    }
                    catch (erroRollback)
                    {
                        console.log(erroRollback);
                    }

                    reject("Exclusão do baralho está com erro");
                }
            }).catch((erro) =>
            {
                console.log(erro);
                reject("Erro na conexão com o banco de dados");
            });
        });
    }

}

module.exports = BaralhoCRUD;