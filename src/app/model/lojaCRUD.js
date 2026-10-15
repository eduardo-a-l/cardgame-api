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
            AND C2.idLojaItem != 0
          ))
      `;

            const resultado = await request.query(sql);
            return resultado.recordset;
        } catch (erro) {
            console.error(erro);
            throw new Error("Listagem dos itens da loja falhou");
        }
    }

    async listagemPacotes() {
        try {
            const pool = await this._db;
            const request = pool.request();

            const sql = `
                SELECT
                    P.idPacote,
                    P.raridade,
                    P.preco,
                    P.descricao,
                    JSON_QUERY((
                        SELECT
                            PC.raridade,
                            PC.[chanceCartas1a4] AS chanceCartas,
                            PC.chanceCarta5 AS chanceUltimaCarta
                        FROM CARDGAME.PacoteChance PC
                        WHERE PC.idPacote = P.idPacote
                        FOR JSON PATH 
                    )) AS probabilidades
                FROM CARDGAME.Pacote P
            `;

            const resultado = await request.query(sql);
            return resultado.recordset;
        } catch (erro) {
            console.error("Erro original ao listar pacotes:", erro);
            throw new Error(
                `Listagem dos pacotes falhou: ${erro.message}`
            );
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

    async comprarPacote(userId, idPacote) {
        const pool = await this._db;
        const transacao = new mssql.Transaction(pool);

        try {
            await transacao.begin();

            const reqUser = transacao.request();
            reqUser.input("userId", mssql.Int, userId);
            const resUser = await reqUser.query(
                "SELECT idUsuario, moedas FROM CARDGAME.Usuario WHERE idUsuario = @userId"
            );

            const reqPacote = transacao.request();
            reqPacote.input("idPacote", mssql.Int, idPacote);
            const resPacote = await reqPacote.query(
                `SELECT 
                    idPacote,
                    preco
                FROM CARDGAME.Pacote
                WHERE idPacote = @idPacote`
            );

            if (resUser.recordset.length === 0 || resPacote.recordset.length === 0) {
                await transacao.rollback();
                throw new Error("Usuário ou pacote não encontrado");
            }

            const usuario = resUser.recordset[0];
            const pacote = resPacote.recordset[0];

            const preco = pacote.preco;

            if (usuario.moedas < preco) {
                await transacao.rollback();
                throw new Error("Saldo insuficiente");
            }

            const reqProbabilidades = transacao.request();
            reqProbabilidades.input("idPacote", mssql.Int, idPacote);

            const resProbabilidades = await reqProbabilidades.query(`
                SELECT
                    raridade,
                    chanceCartas1a4,
                    chanceCarta5
                FROM CARDGAME.PacoteChance
                WHERE idPacote = @idPacote
            `);

            const probabilidades = resProbabilidades.recordset;

            if (probabilidades.length === 0) {
                throw new Error("Pacote sem probabilidades cadastradas");
            }

            const totalCartas1a4 = probabilidades.reduce(
                (total, p) => total + Number(p.chanceCartas1a4),
                0
            );

            const totalCarta5 = probabilidades.reduce(
                (total, p) => total + Number(p.chanceCarta5),
                0
            );

            if (
                Math.abs(totalCartas1a4 - 1) > 0.0001 ||
                Math.abs(totalCarta5 - 1) > 0.0001
            ) {
                throw new Error("As probabilidades do pacote devem somar 100%");
            }
            
            const cartasSorteadas = [];

            for (let i = 0; i < 5; i++) {
                const colunaChance =
                    i === 4 ? "chanceCarta5" : "chanceCartas1a4";

                const sorteio = Math.random();
                let acumulado = 0;
                let raridadeSorteada = null;

                for (const p of probabilidades) {
                    acumulado += Number(p[colunaChance]);

                    if (sorteio < acumulado) {
                        raridadeSorteada = p.raridade;
                        break;
                    }
                }

                if (!raridadeSorteada) {
                    throw new Error("Não foi possível sortear a raridade");
                }

                
                const reqCarta = transacao.request();
                reqCarta.input("raridade", mssql.NVarChar, raridadeSorteada);

                const resCarta = await reqCarta.query(`
                    SELECT TOP 1 idCarta, nome, raridade
                    FROM CARDGAME.Carta
                    WHERE raridade = @raridade
                    ORDER BY NEWID()
                `);

                if (resCarta.recordset.length === 0) {
                    throw new Error(
                        `Não existem cartas cadastradas com raridade ${raridadeSorteada}`
                    );
                }

                const carta = resCarta.recordset[0];
                
                const reqInventario = transacao.request();
                reqInventario.input("userId", mssql.Int, userId);
                reqInventario.input("idCarta", mssql.Int, carta.idCarta);

                await reqInventario.query(`
                    INSERT INTO CARDGAME.Inventario (idUsuario, idCarta)
                    VALUES (@userId, @idCarta)
                `);

                cartasSorteadas.push(carta);
            }

            const reqUpdateMoedas = transacao.request();
            reqUpdateMoedas.input("preco", mssql.Int, preco);
            reqUpdateMoedas.input("userId", mssql.Int, userId);
            await reqUpdateMoedas.query(
                "UPDATE CARDGAME.Usuario SET moedas = moedas - @preco WHERE idUsuario = @userId"
            );

            const reqInsertCompra = transacao.request();
            reqInsertCompra.input("userId", mssql.Int, userId);
            reqInsertCompra.input("idPacote", mssql.Int, idPacote);
            await reqInsertCompra.query(
                "INSERT INTO CARDGAME.CompraUsuario (idUsuario, idPacote, dataCompra) VALUES (@userId, @idPacote, GETDATE())"
            );

            await transacao.commit();

            return {
                mensagem: "Compra realizada.",
                precoPago: preco,
                novoSaldo: usuario.moedas - preco,
                cartas: cartasSorteadas
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