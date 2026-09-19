const mssql = require("mssql");

class LojaCRUD
{

    constructor(db){
        this._db = db;
    }


    listagemItensLoja(idUsuario)
    {
        return new Promise((resolve, reject) =>
        {
            var sql =
                "SELECT DISTINCT " +
                "L.IDLOJAITEM, " +
                "L.IDCARTA, " +
                "L.DESCONTO, " +
                "L.EHOFERTA, " +
                "L.ATIVO, " +
                "C.* " +
                "FROM CARDGAME.LOJAITEM L " +
                "INNER JOIN CARDGAME.CARTA C " +
                "ON L.IDCARTA = C.IDCARTA " +
                "WHERE L.ATIVO = 1 " +
                "AND (L.EHOFERTA = 0 OR L.IDLOJAITEM NOT IN (" +
                "SELECT C2.IDLOJAITEM " +
                "FROM CARDGAME.COMPRAUSUARIO C2 " +
                "WHERE C2.IDUSUARIO = " + idUsuario +
                "))";

            console.log(sql);

            this._db.then((pool) =>
            {
                pool.request().query(sql, function(erro, resultados)
                {
                    if (erro)
                    {
                        console.log(erro);
                        return reject("Listagem dos itens da loja falhou");
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


    comprarItem(userId, idLojaItem)
    {
        return new Promise((resolve, reject) =>
        {
            this._db.then(async (pool) =>
            {
                const transacao = new mssql.Transaction(pool);

                try
                {
                    await transacao.begin();

                    var resultadoUsuario = await transacao.request().query(
                        "SELECT " +
                        "IDUSUARIO AS IDUSUARIO, " +
                        "MOEDAS AS MOEDAS " +
                        "FROM CARDGAME.USUARIO " +
                        "WHERE IDUSUARIO = " + userId
                    );

                    var resultadoItem = await transacao.request().query(
                        "SELECT " +
                        "L.IDLOJAITEM AS IDLOJAITEM, " +
                        "L.IDCARTA AS IDCARTA, " +
                        "L.DESCONTO AS DESCONTO, " +
                        "L.EHOFERTA AS EHOFERTA, " +
                        "L.ATIVO AS ATIVO, " +
                        "C.PRECOPADRAO AS PRECOPADRAO " +
                        "FROM CARDGAME.LOJAITEM L " +
                        "INNER JOIN CARDGAME.CARTA C " +
                        "ON L.IDCARTA = C.IDCARTA " +
                        "WHERE L.IDLOJAITEM = " + idLojaItem
                    );

                    if (
                        resultadoUsuario.recordset.length === 0 ||
                        resultadoItem.recordset.length === 0
                    )
                    {
                        await transacao.rollback();
                        return reject("Usuário ou item não encontrado");
                    }

                    var usuario = resultadoUsuario.recordset[0];
                    var item = resultadoItem.recordset[0];

                    var precoPadrao = item.PRECOPADRAO || 0;
                    var percentualDesconto = item.DESCONTO || 0;

                    var valorComDesconto =
                        precoPadrao * (1 - percentualDesconto);

                    var precoFinal = Math.floor(valorComDesconto);

                    if (usuario.MOEDAS < precoFinal)
                    {
                        await transacao.rollback();
                        return reject("Saldo insuficiente");
                    }

                    if (item.EHOFERTA === true || item.EHOFERTA === 1)
                    {
                        var resultadoCompra = await transacao.request().query(
                            "SELECT * FROM CARDGAME.COMPRAUSUARIO " +
                            "WHERE IDUSUARIO = " + userId +
                            " AND IDLOJAITEM = " + idLojaItem
                        );

                        if (resultadoCompra.recordset.length > 0)
                        {
                            await transacao.rollback();
                            return reject("Você já adquiriu esta oferta única");
                        }
                    }

                    await transacao.request().query(
                        "UPDATE CARDGAME.USUARIO SET " +
                        "MOEDAS = MOEDAS - " + precoFinal +
                        " WHERE IDUSUARIO = " + userId
                    );

                    await transacao.request().query(
                        "INSERT INTO CARDGAME.INVENTARIO " +
                        "(IDUSUARIO, IDCARTA) VALUES (" +
                        userId + "," +
                        item.IDCARTA +
                        ")"
                    );

                    await transacao.request().query(
                        "INSERT INTO CARDGAME.COMPRAUSUARIO " +
                        "(IDUSUARIO, IDLOJAITEM, DATACOMPRA) VALUES (" +
                        userId + "," +
                        idLojaItem + "," +
                        "GETDATE())"
                    );

                    await transacao.commit();

                    resolve({
                        Mensagem: "Compra realizada.",
                        PrecoPago: precoFinal,
                        NovoSaldo: usuario.MOEDAS - precoFinal
                    });
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

                    reject("Erro ao processar a compra");
                }
            }).catch((erro) =>
            {
                console.log(erro);
                reject("Erro na conexão com o banco de dados");
            });
        });
    }


    venderCarta(userId, idCarta)
    {
        return new Promise((resolve, reject) =>
        {
            this._db.then(async (pool) =>
            {
                const transacao = new mssql.Transaction(pool);

                try
                {
                    await transacao.begin();

                    var resultadoUsuario = await transacao.request().query(
                        "SELECT * FROM CARDGAME.USUARIO " +
                        "WHERE IDUSUARIO = " + userId
                    );

                    var resultadoInventario = await transacao.request().query(
                        "SELECT TOP 1 " +
                        "I.IDINVENTARIO, " +
                        "I.IDUSUARIO, " +
                        "I.IDCARTA, " +
                        "C.PRECOPADRAO " +
                        "FROM CARDGAME.INVENTARIO I " +
                        "INNER JOIN CARDGAME.CARTA C " +
                        "ON I.IDCARTA = C.IDCARTA " +
                        "WHERE I.IDUSUARIO = " + userId +
                        " AND I.IDCARTA = " + idCarta
                    );

                    if (resultadoUsuario.recordset.length === 0)
                    {
                        await transacao.rollback();
                        return reject("Usuário não encontrado");
                    }

                    if (resultadoInventario.recordset.length === 0)
                    {
                        await transacao.rollback();
                        return reject("Você não possui essa carta no inventário");
                    }

                    var inventario = resultadoInventario.recordset[0];

                    var resultadoUso = await transacao.request().query(
                        "SELECT * FROM CARDGAME.Carta_Baralho " +
                        "WHERE idInventario = " + inventario.IDINVENTARIO
                    );

                    if (resultadoUso.recordset.length > 0)
                    {
                        await transacao.rollback();
                        return reject(
                            "Esta carta não pode ser vendida pois está equipada em um de seus baralhos"
                        );
                    }

                    var precoPadrao = inventario.PRECOPADRAO;
                    var valorVenda = Math.floor(precoPadrao * 0.5);

                    await transacao.request().query(
                        "UPDATE CARDGAME.USUARIO SET " +
                        "MOEDAS = MOEDAS + " + valorVenda +
                        " WHERE IDUSUARIO = " + userId
                    );

                    await transacao.request().query(
                        "DELETE FROM CARDGAME.INVENTARIO " +
                        "WHERE IDINVENTARIO = " + inventario.IDINVENTARIO
                    );

                    await transacao.commit();

                    var usuario = resultadoUsuario.recordset[0];

                    resolve({
                        Mensagem: "Carta vendida com sucesso!",
                        ValorRecebido: valorVenda,
                        NovoSaldo: usuario.MOEDAS + valorVenda
                    });
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

                    reject("Erro ao processar a venda");
                }
            }).catch((erro) =>
            {
                console.log(erro);
                reject("Erro na conexão com o banco de dados");
            });
        });
    }

}

module.exports = LojaCRUD;