const mssql = require("mssql");

class LojaCRUD {
    constructor(db) {
        this._db = db;
    }

    async listagemItensLoja(idUsuario) {
        try {
            const pool = await this._db;
            const request = pool.request();
            request.input("idUsuario", mssql.Int, idUsuario);

            const sql = `
        SELECT DISTINCT 
          L.idLojaItem,
          L.idCarta,
          L.desconto,
          L.ehOferta,
          L.ativo,
          C.nome AS carta_nome,
          C.tipo AS carta_tipo,
          C.raridade AS carta_raridade,
          C.precoPadrao AS carta_precoPadrao,
          C.vida AS carta_vida,
          C.acao1 AS carta_acao1,
          C.acao2 AS carta_acao2
        FROM CARDGAME.LojaItem L
        INNER JOIN CARDGAME.Carta C ON L.idCarta = C.idCarta
        WHERE L.ativo = 1 
          AND (L.ehOferta = 0 OR L.idLojaItem NOT IN (
            SELECT C2.idLojaItem 
            FROM CARDGAME.CompraUsuario C2 
            WHERE C2.idUsuario = @idUsuario
          ))
      `;

            const resultado = await request.query(sql);
            return resultado.recordset;
        } catch (erro) {
            console.error(erro);
            throw new Error("Listagem dos itens da loja falhou");
        }
    }

    async comprarItem(userId, idLojaItem) {
        const pool = await this._db;
        const transacao = new mssql.Transaction(pool);

        try {
            await transacao.begin();

            const reqUser = transacao.request();
            reqUser.input("userId", mssql.Int, userId);
            const resUser = await reqUser.query(
                "SELECT idUsuario, moedas FROM CARDGAME.Usuario WHERE idUsuario = @userId"
            );

            const reqItem = transacao.request();
            reqItem.input("idLojaItem", mssql.Int, idLojaItem);
            const resItem = await reqItem.query(
                `SELECT 
          L.idLojaItem,
          L.idCarta,
          L.desconto,
          L.ehOferta,
          L.ativo,
          C.precoPadrao 
        FROM CARDGAME.LojaItem L 
        INNER JOIN CARDGAME.Carta C ON L.idCarta = C.idCarta 
        WHERE L.idLojaItem = @idLojaItem`
            );

            if (resUser.recordset.length === 0 || resItem.recordset.length === 0) {
                await transacao.rollback();
                throw new Error("Usuário ou item não encontrado");
            }

            const usuario = resUser.recordset[0];
            const item = resItem.recordset[0];

            const precoPadrao = item.precoPadrao || 0;
            const percentualDesconto = item.desconto || 0;
            const precoFinal = Math.floor(precoPadrao * (1 - percentualDesconto));

            if (usuario.moedas < precoFinal) {
                await transacao.rollback();
                throw new Error("Saldo insuficiente");
            }

            if (item.ehOferta) {
                const reqCompra = transacao.request();
                reqCompra.input("userId", mssql.Int, userId);
                reqCompra.input("idLojaItem", mssql.Int, idLojaItem);
                const resCompra = await reqCompra.query(
                    "SELECT idCompraUsuario FROM CARDGAME.CompraUsuario WHERE idUsuario = @userId AND idLojaItem = @idLojaItem"
                );

                if (resCompra.recordset.length > 0) {
                    await transacao.rollback();
                    throw new Error("Você já adquiriu esta oferta única");
                }
            }

            const reqUpdateMoedas = transacao.request();
            reqUpdateMoedas.input("precoFinal", mssql.Int, precoFinal);
            reqUpdateMoedas.input("userId", mssql.Int, userId);
            await reqUpdateMoedas.query(
                "UPDATE CARDGAME.Usuario SET moedas = moedas - @precoFinal WHERE idUsuario = @userId"
            );

            const reqInsertInv = transacao.request();
            reqInsertInv.input("userId", mssql.Int, userId);
            reqInsertInv.input("idCarta", mssql.Int, item.idCarta);
            await reqInsertInv.query(
                "INSERT INTO CARDGAME.Inventario (idUsuario, idCarta) VALUES (@userId, @idCarta)"
            );

            const reqInsertCompra = transacao.request();
            reqInsertCompra.input("userId", mssql.Int, userId);
            reqInsertCompra.input("idLojaItem", mssql.Int, idLojaItem);
            await reqInsertCompra.query(
                "INSERT INTO CARDGAME.CompraUsuario (idUsuario, idLojaItem, dataCompra) VALUES (@userId, @idLojaItem, GETDATE())"
            );

            await transacao.commit();

            return {
                mensagem: "Compra realizada.",
                precoPago: precoFinal,
                novoSaldo: usuario.moedas - precoFinal
            };
        } catch (erro) {
            console.error(erro);
            try {
                await transacao.rollback();
            } catch (e) { }
            throw new Error(erro.message || "Erro ao processar a compra");
        }
    }

    async venderCarta(userId, idCarta) {
        const pool = await this._db;
        const transacao = new mssql.Transaction(pool);

        try {
            await transacao.begin();

            const reqUser = transacao.request();
            reqUser.input("userId", mssql.Int, userId);
            const resUser = await reqUser.query(
                "SELECT idUsuario, moedas FROM CARDGAME.Usuario WHERE idUsuario = @userId"
            );

            if (resUser.recordset.length === 0) {
                await transacao.rollback();
                throw new Error("Usuário não encontrado");
            }

            const reqInv = transacao.request();
            reqInv.input("userId", mssql.Int, userId);
            reqInv.input("idCarta", mssql.Int, idCarta);
            const resInv = await reqInv.query(
                `SELECT TOP 1 
          I.idInventario,
          I.idUsuario,
          I.idCarta,
          C.precoPadrao 
        FROM CARDGAME.Inventario I 
        INNER JOIN CARDGAME.Carta C ON I.idCarta = C.idCarta 
        WHERE I.idUsuario = @userId AND I.idCarta = @idCarta`
            );

            if (resInv.recordset.length === 0) {
                await transacao.rollback();
                throw new Error("Você não possui essa carta no inventário");
            }

            const inventario = resInv.recordset[0];

            const reqUso = transacao.request();
            reqUso.input("idInventario", mssql.Int, inventario.idInventario);
            const resUso = await reqUso.query(
                "SELECT idBaralho FROM CARDGAME.Carta_Baralho WHERE idInventario = @idInventario"
            );

            if (resUso.recordset.length > 0) {
                await transacao.rollback();
                throw new Error("Esta carta não pode ser vendida pois está equipada em um de seus baralhos");
            }

            const valorVenda = Math.floor(inventario.precoPadrao * 0.5);

            const reqUpdateMoedas = transacao.request();
            reqUpdateMoedas.input("valorVenda", mssql.Int, valorVenda);
            reqUpdateMoedas.input("userId", mssql.Int, userId);
            await reqUpdateMoedas.query(
                "UPDATE CARDGAME.Usuario SET moedas = moedas + @valorVenda WHERE idUsuario = @userId"
            );

            const reqDelInv = transacao.request();
            reqDelInv.input("idInventario", mssql.Int, inventario.idInventario);
            await reqDelInv.query(
                "DELETE FROM CARDGAME.Inventario WHERE idInventario = @idInventario"
            );

            await transacao.commit();

            const usuario = resUser.recordset[0];

            return {
                mensagem: "Carta vendida com sucesso",
                valorRecebido: valorVenda,
                novoSaldo: usuario.moedas + valorVenda
            };
        } catch (erro) {
            console.error(erro);
            try {
                await transacao.rollback();
            } catch (e) { }
            throw new Error(erro.message || "Erro ao processar a venda");
        }
    }
}

module.exports = LojaCRUD;