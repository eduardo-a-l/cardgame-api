const mssql = require("mssql");

class ConquistaCRUD {
    constructor(db) {
        this._db = db;
    }

    async listarEVerificarConquistasDoUsuario(idUsuario) {
        try {
            const pool = await this._db;

            const reqStats = pool.request();
            reqStats.input("idUsuario", mssql.Int, idUsuario);
            const resStats = await reqStats.query(`
                SELECT 
                    U.vitorias, 
                    U.moedas, 
                    (SELECT COUNT(*) FROM CARDGAME.CompraUsuario WHERE idUsuario = @idUsuario) AS totalCompras,
                    (SELECT COUNT(*) FROM CARDGAME.Baralho WHERE idUsuario = @idUsuario) AS totalBaralhos,
                    (SELECT ISNULL(MAX(qtd), 0) FROM (
                        SELECT COUNT(*) AS qtd FROM CARDGAME.Inventario WHERE idUsuario = @idUsuario GROUP BY idCarta
                    ) T) AS maxCopiasCarta
                FROM CARDGAME.Usuario U
                WHERE U.idUsuario = @idUsuario
            `);

            if (resStats.recordset.length > 0) {
                const stats = resStats.recordset[0];

                const regras = [
                    { codigo: 'O_PRIMEIRO_PASSO', atendeu: stats.vitorias >= 1 },
                    { codigo: 'CAMINHO_DA_MAESTRIA', atendeu: stats.vitorias >= 10 },
                    { codigo: 'PRIMEIRA_COMPRA', atendeu: stats.totalCompras >= 1 },
                    { codigo: 'PEQUENA_FORTUNA', atendeu: stats.moedas >= 500 },
                    { codigo: 'FORTUNA', atendeu: stats.moedas >= 1000 },
                    { codigo: 'ACUMULADOR', atendeu: stats.maxCopiasCarta >= 3 },
                    { codigo: 'PREPARADO_PARA_A_BATALHA', atendeu: stats.totalBaralhos >= 1 }
                ];

                for (const regra of regras) {
                    if (regra.atendeu) {
                        await this.desbloquearPorCodigo(idUsuario, regra.codigo);
                    }
                }
            }

            const reqList = pool.request();
            reqList.input("idUsuario", mssql.Int, idUsuario);
            const resList = await reqList.query(`
                SELECT 
                    C.idConquista,
                    C.codigo,
                    C.nome,
                    C.descricao,
                    C.dificuldade,
                    C.icone,
                    CASE WHEN UC.idUsuario IS NOT NULL THEN 1 ELSE 0 END AS desbloqueada,
                    UC.dataDesbloqueio
                FROM CARDGAME.Conquista C
                LEFT JOIN CARDGAME.Usuario_Conquista UC 
                    ON C.idConquista = UC.idConquista AND UC.idUsuario = @idUsuario
                ORDER BY C.idConquista
            `);

            return resList.recordset.map(c => ({
                idConquista: c.idConquista,
                codigo: c.codigo,
                nome: c.nome,
                descricao: c.descricao,
                dificuldade: c.dificuldade,
                icone: c.icone,
                desbloqueada: Boolean(c.desbloqueada),
                dataDesbloqueio: c.dataDesbloqueio
            }));
        } catch (erro) {
            console.error(erro);
            throw new Error("Erro ao listar conquistas");
        }
    }

    async desbloquearPorCodigo(idUsuario, codigoConquista) {
        try {
            const pool = await this._db;
            const req = pool.request();
            req.input("idUsuario", mssql.Int, idUsuario);
            req.input("codigo", mssql.VarChar(50), codigoConquista);

            await req.query(`
                INSERT INTO CARDGAME.Usuario_Conquista (idUsuario, idConquista)
                SELECT @idUsuario, C.idConquista
                FROM CARDGAME.Conquista C
                WHERE C.codigo = @codigo
                  AND NOT EXISTS (
                    SELECT 1 FROM CARDGAME.Usuario_Conquista UC 
                    WHERE UC.idUsuario = @idUsuario AND UC.idConquista = C.idConquista
                  )
            `);
        } catch (erro) {
            console.error(erro);
        }
    }
}

module.exports = ConquistaCRUD;