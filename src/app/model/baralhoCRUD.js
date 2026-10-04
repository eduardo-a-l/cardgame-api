const mssql = require("mssql");

class BaralhoCRUD {
    constructor(db) {
        this._db = db;
    }

    async listagemBaralhosPorUsuario(idUsuario) {
        try {
            const pool = await this._db;
            const request = pool.request();
            request.input("idUsuario", mssql.Int, idUsuario);

            const sql = `
        SELECT 
          B.idBaralho,
          B.nome,
          B.idUsuario,
          I.idInventario,
          I.idCarta,
          C.Nome AS Carta_Nome,
          C.Tipo AS Carta_Tipo,
          C.Raridade AS Carta_Raridade,
          C.PrecoPadrao AS Carta_PrecoPadrao,
          C.Vida AS Carta_Vida,
          C.Acao1 AS Carta_Acao1,
          C.Acao2 AS Carta_Acao2
        FROM CARDGAME.Baralho B
        LEFT JOIN CARDGAME.Carta_Baralho CB ON B.idBaralho = CB.idBaralho
        LEFT JOIN CARDGAME.Inventario I ON CB.idInventario = I.idInventario
        LEFT JOIN CARDGAME.Carta C ON I.idCarta = C.idCarta
        WHERE B.idUsuario = @idUsuario
        ORDER BY B.idBaralho
      `;

            const resultado = await request.query(sql);
            return resultado.recordset;
        } catch (erro) {
            console.error(erro);
            throw new Error("Listagem dos baralhos falhou");
        }
    }

    async insereBaralho(baralho) {
        try {
            const pool = await this._db;
            const request = pool.request();
            request.input("nome", mssql.VarChar(20), baralho.nome);
            request.input("idUsuario", mssql.Int, baralho.idUsuario);

            const sql = `
        INSERT INTO CARDGAME.Baralho (nome, idUsuario)
        OUTPUT INSERTED.idBaralho, INSERTED.nome, INSERTED.idUsuario
        VALUES (@nome, @idUsuario)
      `;

            const resultado = await request.query(sql);
            return resultado.recordset[0];
        } catch (erro) {
            console.error(erro);
            throw new Error("Inclusão de novo baralho está com erro");
        }
    }

    async atualizaBaralho(id, baralho) {
        const pool = await this._db;
        const transacao = new mssql.Transaction(pool);

        try {
            await transacao.begin();

            const reqExiste = transacao.request();
            reqExiste.input("id", mssql.Int, id);
            const resExiste = await reqExiste.query(
                "SELECT idBaralho FROM CARDGAME.Baralho WHERE idBaralho = @id",
            );

            if (resExiste.recordset.length === 0) {
                await transacao.rollback();
                throw new Error("Baralho não encontrado");
            }

            const reqUpdate = transacao.request();
            reqUpdate.input("id", mssql.Int, id);
            reqUpdate.input("nome", mssql.VarChar(20), baralho.nome);
            await reqUpdate.query(
                "UPDATE CARDGAME.Baralho SET nome = @nome WHERE idBaralho = @id",
            );

            const reqDelete = transacao.request();
            reqDelete.input("id", mssql.Int, id);
            await reqDelete.query(
                "DELETE FROM CARDGAME.Carta_Baralho WHERE idBaralho = @id",
            );

            if (baralho.inventarios && baralho.inventarios.length > 0) {
                for (const item of baralho.inventarios) {
                    const reqInsert = transacao.request();
                    reqInsert.input("idBaralho", mssql.Int, id);
                    reqInsert.input(
                        "idInventario",
                        mssql.Int,
                        item.idInventario || item.IdInventario,
                    );
                    await reqInsert.query(
                        "INSERT INTO CARDGAME.Carta_Baralho (idBaralho, idInventario) VALUES (@idBaralho, @idInventario)",
                    );
                }
            }

            await transacao.commit();
        } catch (erro) {
            console.error(erro);
            try {
                await transacao.rollback();
            } catch (e) { }
            throw new Error(erro.message || "Atualização do baralho está com erro");
        }
    }

    async removeBaralho(id) {
        const pool = await this._db;
        const transacao = new mssql.Transaction(pool);

        try {
            await transacao.begin();

            const reqExiste = transacao.request();
            reqExiste.input("id", mssql.Int, id);
            const resExiste = await reqExiste.query(
                "SELECT idBaralho FROM CARDGAME.Baralho WHERE idBaralho = @id",
            );

            if (resExiste.recordset.length === 0) {
                await transacao.rollback();
                throw new Error("Baralho não encontrado");
            }

            const reqDeleteCB = transacao.request();
            reqDeleteCB.input("id", mssql.Int, id);
            await reqDeleteCB.query(
                "DELETE FROM CARDGAME.Carta_Baralho WHERE idBaralho = @id",
            );

            const reqDeleteB = transacao.request();
            reqDeleteB.input("id", mssql.Int, id);
            await reqDeleteB.query(
                "DELETE FROM CARDGAME.Baralho WHERE idBaralho = @id",
            );

            await transacao.commit();
        } catch (erro) {
            console.error(erro);
            try {
                await transacao.rollback();
            } catch (e) { }
            throw new Error(erro.message || "Exclusão do baralho está com erro");
        }
    }
}

module.exports = BaralhoCRUD;
