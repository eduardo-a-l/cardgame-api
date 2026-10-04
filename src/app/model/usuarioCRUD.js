const mssql = require("mssql");

class UsuarioCRUD {
    constructor(db) {
        this._db = db;
    }

    async listagemUsuarios() {
        try {
            const pool = await this._db;
            const resultado = await pool
                .request()
                .query("SELECT * FROM CARDGAME.Usuario ORDER BY idUsuario");
            return resultado.recordset;
        } catch (erro) {
            console.error(erro);
            throw new Error("Listagem com todos os usuários falhou");
        }
    }

    async insereUsuario(usuario) {
        const pool = await this._db;
        const transacao = new mssql.Transaction(pool);

        try {
            await transacao.begin();

            const reqExiste = transacao.request();
            reqExiste.input("nomeUsuario", mssql.VarChar(100), usuario.nomeUsuario);
            const resExiste = await reqExiste.query(
                "SELECT idUsuario FROM CARDGAME.Usuario WHERE nomeUsuario = @nomeUsuario"
            );

            if (resExiste.recordset.length > 0) {
                await transacao.rollback();
                throw new Error("Usuário já cadastrado");
            }

            const reqInsere = transacao.request();
            reqInsere.input("nomeUsuario", mssql.VarChar(100), usuario.nomeUsuario);
            reqInsere.input("senha", mssql.VarChar(255), usuario.senha);

            const sqlInsere = `
                INSERT INTO CARDGAME.Usuario 
                    (nomeUsuario, senha, pontos, moedas, vitorias, derrotas, pinBatalha)
                OUTPUT INSERTED.* 
                VALUES (@nomeUsuario, @senha, 1000, 100, 0, 0, 0)
            `;

            const resUsuario = await reqInsere.query(sqlInsere);
            const usuarioInserido = resUsuario.recordset[0];

            const reqInv = transacao.request();
            reqInv.input("idUsuario", mssql.Int, usuarioInserido.idUsuario);

            const sqlInventario = `
                INSERT INTO CARDGAME.Inventario (idUsuario, idCarta) VALUES 
                    (@idUsuario, 4), (@idUsuario, 4),
                    (@idUsuario, 5), (@idUsuario, 6),
                    (@idUsuario, 7), (@idUsuario, 8),
                    (@idUsuario, 8), (@idUsuario, 9),
                    (@idUsuario, 9), (@idUsuario, 10)
            `;

            await reqInv.query(sqlInventario);
            await transacao.commit();

            return usuarioInserido;
        } catch (erro) {
            console.error(erro);
            try {
                await transacao.rollback();
            } catch (e) { }
            throw new Error(erro.message || "Inclusão de novo usuário está com erro");
        }
    }

    async loginUsuario(nomeUsuario, senha) {
        try {
            const pool = await this._db;
            const request = pool.request();
            request.input("nomeUsuario", mssql.VarChar(100), nomeUsuario);
            request.input("senha", mssql.VarChar(255), senha);

            const sql = `
                SELECT * FROM CARDGAME.Usuario 
                WHERE nomeUsuario = @nomeUsuario AND senha = @senha
            `;

            const resultados = await request.query(sql);
            return resultados.recordset[0] || null;
        } catch (erro) {
            console.error(erro);
            throw new Error("Erro ao realizar login");
        }
    }

    async rankingUsuarios() {
        try {
            const pool = await this._db;
            const sql = `
                SELECT idUsuario, nomeUsuario, pontos, moedas, fotoPerfil 
                FROM CARDGAME.Usuario 
                ORDER BY pontos DESC
            `;
            const resultados = await pool.request().query(sql);
            return resultados.recordset;
        } catch (erro) {
            console.error(erro);
            throw new Error("Listagem do ranking falhou");
        }
    }

    async consultaUsuarioPorId(id) {
        try {
            const pool = await this._db;
            const request = pool.request();
            request.input("id", mssql.Int, id);

            const sql = `
                SELECT idUsuario, nomeUsuario, pontos, moedas, 
                       vitorias, derrotas, pinBatalha, fotoPerfil 
                FROM CARDGAME.Usuario 
                WHERE idUsuario = @id
            `;

            const resultados = await request.query(sql);
            return resultados.recordset;
        } catch (erro) {
            console.error(erro);
            throw new Error(`Listagem do usuário de id ${id} falhou`);
        }
    }

    async atualizaPinBatalha(id, novoPin) {
        try {
            const pool = await this._db;
            const request = pool.request();
            request.input("id", mssql.Int, id);
            request.input("novoPin", mssql.Int, novoPin);

            const sql = `
                UPDATE CARDGAME.Usuario 
                SET pinBatalha = @novoPin 
                WHERE idUsuario = @id
            `;

            const resultados = await request.query(sql);
            if (resultados.rowsAffected[0] === 0) {
                throw new Error("Usuário não encontrado");
            }
        } catch (erro) {
            console.error(erro);
            throw new Error(erro.message || "Atualização do PIN de batalha falhou");
        }
    }

    async registraResultadoBatalha(idVencedor, idPerdedor) {
        const pool = await this._db;
        const transacao = new mssql.Transaction(pool);

        try {
            await transacao.begin();

            const reqVencedor = transacao.request();
            reqVencedor.input("idVencedor", mssql.Int, idVencedor);
            const resVencedor = await reqVencedor.query(
                "SELECT pontos FROM CARDGAME.Usuario WHERE idUsuario = @idVencedor"
            );

            const reqPerdedor = transacao.request();
            reqPerdedor.input("idPerdedor", mssql.Int, idPerdedor);
            const resPerdedor = await reqPerdedor.query(
                "SELECT pontos FROM CARDGAME.Usuario WHERE idUsuario = @idPerdedor"
            );

            if (resVencedor.recordset.length === 0 || resPerdedor.recordset.length === 0) {
                await transacao.rollback();
                throw new Error("Um ou ambos os usuários não foram encontrados");
            }

            const RA = resVencedor.recordset[0].pontos;
            const RB = resPerdedor.recordset[0].pontos;
            const K = 50;
            const EA = 1 / (1 + Math.pow(10, (RB - RA) / 400));

            const ganhoVencedor = Math.round(K * (1 - EA));
            const perdaPerdedor = ganhoVencedor;

            const reqUpVencedor = transacao.request();
            reqUpVencedor.input("ganho", mssql.Int, ganhoVencedor);
            reqUpVencedor.input("idVencedor", mssql.Int, idVencedor);
            await reqUpVencedor.query(`
                UPDATE CARDGAME.Usuario SET 
                    pontos = pontos + @ganho, 
                    moedas = moedas + 50, 
                    vitorias = vitorias + 1 
                WHERE idUsuario = @idVencedor
            `);

            const reqUpPerdedor = transacao.request();
            reqUpPerdedor.input("perda", mssql.Int, perdaPerdedor);
            reqUpPerdedor.input("idPerdedor", mssql.Int, idPerdedor);
            await reqUpPerdedor.query(`
                UPDATE CARDGAME.Usuario SET 
                    pontos = pontos - @perda, 
                    moedas = moedas + 10, 
                    derrotas = derrotas + 1 
                WHERE idUsuario = @idPerdedor
            `);

            await transacao.commit();

            return { ganhoVencedor, perdaPerdedor };
        } catch (erro) {
            console.error(erro);
            try {
                await transacao.rollback();
            } catch (e) { }
            throw new Error(erro.message || "Erro ao processar o resultado da batalha");
        }
    }

    async removeUsuario(id) {
        const pool = await this._db;
        const transacao = new mssql.Transaction(pool);

        try {
            await transacao.begin();

            const reqExiste = transacao.request();
            reqExiste.input("id", mssql.Int, id);
            const resExiste = await reqExiste.query(
                "SELECT idUsuario FROM CARDGAME.Usuario WHERE idUsuario = @id"
            );

            if (resExiste.recordset.length === 0) {
                await transacao.rollback();
                throw new Error("Usuário não encontrado");
            }

            const reqDelCartaBaralho = transacao.request();
            reqDelCartaBaralho.input("id", mssql.Int, id);
            await reqDelCartaBaralho.query(`
                DELETE FROM CARDGAME.Carta_Baralho 
                WHERE idInventario IN (
                    SELECT idInventario FROM CARDGAME.Inventario WHERE idUsuario = @id
                )
            `);

            const reqDelInv = transacao.request();
            reqDelInv.input("id", mssql.Int, id);
            await reqDelInv.query("DELETE FROM CARDGAME.Inventario WHERE idUsuario = @id");

            const reqDelBaralho = transacao.request();
            reqDelBaralho.input("id", mssql.Int, id);
            await reqDelBaralho.query("DELETE FROM CARDGAME.Baralho WHERE idUsuario = @id");

            const reqDelCompra = transacao.request();
            reqDelCompra.input("id", mssql.Int, id);
            await reqDelCompra.query("DELETE FROM CARDGAME.CompraUsuario WHERE idUsuario = @id");

            const reqDelUser = transacao.request();
            reqDelUser.input("id", mssql.Int, id);
            await reqDelUser.query("DELETE FROM CARDGAME.Usuario WHERE idUsuario = @id");

            await transacao.commit();
        } catch (erro) {
            console.error(erro);
            try {
                await transacao.rollback();
            } catch (e) { }
            throw new Error(erro.message || "Exclusão do usuário está com erro");
        }
    }

    async atualizaFotoPerfil(id, imagem, tipoImagem) {
        try {
            const pool = await this._db;
            const request = pool.request();
            request.input("id", mssql.Int, id);
            request.input("imagem", mssql.VarBinary(mssql.MAX), imagem);
            request.input("tipoImagem", mssql.VarChar(50), tipoImagem);

            const sql = `
                UPDATE CARDGAME.Usuario 
                SET fotoPerfil = @imagem, 
                    tipoFotoPerfil = @tipoImagem 
                WHERE idUsuario = @id
            `;

            const resultados = await request.query(sql);
            if (resultados.rowsAffected[0] === 0) {
                throw new Error("Usuário não encontrado");
            }
        } catch (erro) {
            console.error(erro);
            throw new Error(erro.message || "Atualização da foto de perfil falhou");
        }
    }

    async consultaFotoPerfil(id) {
        try {
            const pool = await this._db;
            const request = pool.request();
            request.input("id", mssql.Int, id);

            const sql = `
                SELECT fotoPerfil, tipoFotoPerfil 
                FROM CARDGAME.Usuario 
                WHERE idUsuario = @id
            `;

            const resultados = await request.query(sql);
            return resultados.recordset;
        } catch (erro) {
            console.error(erro);
            throw new Error("Erro ao consultar foto de perfil");
        }
    }
}

module.exports = UsuarioCRUD;