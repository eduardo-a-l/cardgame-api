const mssql = require("mssql");

class CartaCRUD {
    constructor(db) {
        this._db = db;
    }

    async consultaCartaPorId(id) {
        try {
            const pool = await this._db;
            const request = pool.request();
            request.input("id", mssql.Int, id);

            const sql = "SELECT * FROM CARDGAME.Carta WHERE idCarta = @id";
            const resultado = await request.query(sql);
            return resultado.recordset[0] || null;
        } catch (erro) {
            console.error(erro);
            throw new Error(`Listagem com os dados da carta de id ${id} falhou`);
        }
    }

    async listagemCartas() {
        try {
            const pool = await this._db;
            const sql = "SELECT * FROM CARDGAME.Carta ORDER BY idCarta";
            const resultado = await pool.request().query(sql);
            return resultado.recordset;
        } catch (erro) {
            console.error(erro);
            throw new Error("Listagem com todas as cartas falhou");
        }
    }

    async insereCarta(carta) {
        try {
            const pool = await this._db;
            const request = pool.request();

            request.input("idCarta", mssql.Int, carta.idCarta);
            request.input("nome", mssql.VarChar(50), carta.nome);
            request.input("tipo", mssql.VarChar(20), carta.tipo);
            request.input("raridade", mssql.VarChar(20), carta.raridade);
            request.input("precoPadrao", mssql.Int, carta.precoPadrao);
            request.input("vida", mssql.Int, carta.vida ?? null);
            request.input("acao1", mssql.VarChar(100), carta.acao1 ?? null);
            request.input("acao2", mssql.VarChar(100), carta.acao2 ?? null);

            const sql = `
        INSERT INTO CARDGAME.Carta 
          (idCarta, nome, tipo, raridade, precoPadrao, vida, acao1, acao2) 
        VALUES 
          (@idCarta, @nome, @tipo, @raridade, @precoPadrao, @vida, @acao1, @acao2)
      `;

            await request.query(sql);
        } catch (erro) {
            console.error(erro);
            throw new Error("Inclusão de nova carta está com erro");
        }
    }

    async atualizaCarta(id, carta) {
        try {
            const pool = await this._db;
            const request = pool.request();

            request.input("id", mssql.Int, id);
            request.input("nome", mssql.VarChar(50), carta.nome);
            request.input("tipo", mssql.VarChar(20), carta.tipo);
            request.input("raridade", mssql.VarChar(20), carta.raridade);
            request.input("precoPadrao", mssql.Int, carta.precoPadrao);
            request.input("vida", mssql.Int, carta.vida ?? null);
            request.input("acao1", mssql.VarChar(100), carta.acao1 ?? null);
            request.input("acao2", mssql.VarChar(100), carta.acao2 ?? null);

            const sql = `
        UPDATE CARDGAME.Carta SET 
          nome = @nome,
          tipo = @tipo,
          raridade = @raridade,
          precoPadrao = @precoPadrao,
          vida = @vida,
          acao1 = @acao1,
          acao2 = @acao2
        WHERE idCarta = @id
      `;

            await request.query(sql);
        } catch (erro) {
            console.error(erro);
            throw new Error("Atualização dos dados da carta está com erro");
        }
    }

    async removeCarta(id) {
        try {
            const pool = await this._db;
            const request = pool.request();
            request.input("id", mssql.Int, id);

            const sql = "DELETE FROM CARDGAME.Carta WHERE idCarta = @id";
            await request.query(sql);
        } catch (erro) {
            console.error(erro);
            throw new Error("Exclusão de uma carta está com erro");
        }
    }

    async listagemInventario() {
        try {
            const pool = await this._db;
            const sql = `
        SELECT
          I.idInventario,
          I.idUsuario,
          I.idCarta,
          C.nome AS carta_nome,
          C.tipo AS carta_tipo,
          C.raridade AS carta_raridade,
          C.precoPadrao AS carta_precoPadrao,
          C.vida AS carta_vida,
          C.acao1 AS carta_acao1,
          C.acao2 AS carta_acao2,
          U.nome AS usuario_nome,
          U.email AS usuario_email
        FROM CARDGAME.Inventario I
        INNER JOIN CARDGAME.Carta C ON I.idCarta = C.idCarta
        INNER JOIN CARDGAME.Usuario U ON I.idUsuario = U.idUsuario
        ORDER BY I.idInventario
      `;

            const resultado = await pool.request().query(sql);
            return resultado.recordset;
        } catch (erro) {
            console.error(erro);
            throw new Error("Listagem do inventário falhou");
        }
    }

    async listagemInventarioPorUsuario(idUsuario) {
        try {
            const pool = await this._db;
            const request = pool.request();
            request.input("idUsuario", mssql.Int, idUsuario);

            const sql = `
        SELECT 
          I.idInventario,
          I.idUsuario,
          C.idCarta,
          C.nome,
          C.tipo,
          C.raridade,
          C.precoPadrao,
          C.vida,
          C.acao1,
          C.acao2
        FROM CARDGAME.Inventario I
        INNER JOIN CARDGAME.Carta C ON I.idCarta = C.idCarta
        WHERE I.idUsuario = @idUsuario
        ORDER BY I.idInventario
      `;

            const resultado = await request.query(sql);
            return resultado.recordset;
        } catch (erro) {
            console.error(erro);
            throw new Error("Listagem do inventário do usuário falhou");
        }
    }

    async insereInventario(inventario) {
        try {
            const pool = await this._db;
            const request = pool.request();

            request.input("idCarta", mssql.Int, inventario.idCarta);
            request.input("idUsuario", mssql.Int, inventario.idUsuario);

            const sql = `
        INSERT INTO CARDGAME.Inventario (idCarta, idUsuario)
        VALUES (@idCarta, @idUsuario)
      `;

            await request.query(sql);
        } catch (erro) {
            console.error(erro);
            throw new Error("Inclusão no inventário está com erro");
        }
    }
}

module.exports = CartaCRUD;