class CartaCRUD
{

    constructor(db){
        this._db = db;
    }

    consultaCartaPorId(id)
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "SELECT * FROM CARDGAME.CARTA WHERE IDCARTA = " + id;

            console.log(sql);

            this._db.then((pool) =>
            {
                pool.request().query(sql, function(erro, resultados)
                {
                    if (erro)
                    {
                        console.log(erro);
                        return reject("Listagem com os dados da carta de id " + id + " falhou");
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


    listagemCartas()
    {
        return new Promise((resolve, reject) =>
        {
            var sql = "SELECT * FROM CARDGAME.CARTA ORDER BY IDCARTA";

            console.log(sql);

            this._db.then((pool) =>
            {
                pool.request().query(sql, function(erro, resultados)
                {
                    if (erro)
                    {
                        console.log(erro);
                        return reject("Listagem com todas as cartas falhou");
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


    insereCarta(carta)
    {
        return new Promise((resolve, reject) =>
        {
            var vida = carta.vida === null || carta.vida === undefined
                ? "NULL"
                : carta.vida;

            var acao1 = carta.acao1 === null || carta.acao1 === undefined
                ? "NULL"
                : "'" + carta.acao1 + "'";

            var acao2 = carta.acao2 === null || carta.acao2 === undefined
                ? "NULL"
                : "'" + carta.acao2 + "'";

            var sqlInsere =
                "INSERT INTO CARDGAME.CARTA " +
                "(IDCARTA, NOME, TIPO, RARIDADE, PRECOPADRAO, VIDA, ACAO1, ACAO2) " +
                "VALUES (" +
                carta.idCarta + "," +
                "'" + carta.nome + "'," +
                "'" + carta.tipo + "'," +
                "'" + carta.raridade + "'," +
                carta.precoPadrao + "," +
                vida + "," +
                acao1 + "," +
                acao2 +
                ")";

            console.log("INSERT na tabela carta = " + sqlInsere);

            this._db.then((pool) =>
            {
                pool.request().query(sqlInsere, function(erro)
                {
                    if (erro)
                    {
                        console.log(erro);
                        return reject("Inclusão de nova carta está com erro");
                    }

                    resolve();
                });
            }).catch((erro) =>
            {
                console.log(erro);
                reject("Erro na conexão com o banco de dados");
            });
        });
    }


    atualizaCarta(id, carta)
    {
        return new Promise((resolve, reject) =>
        {
            var vida = carta.vida === null || carta.vida === undefined
                ? "NULL"
                : carta.vida;

            var acao1 = carta.acao1 === null || carta.acao1 === undefined
                ? "NULL"
                : "'" + carta.acao1 + "'";

            var acao2 = carta.acao2 === null || carta.acao2 === undefined
                ? "NULL"
                : "'" + carta.acao2 + "'";

            var sqlAtualiza =
                "UPDATE CARDGAME.CARTA SET " +
                "NOME='" + carta.nome + "'," +
                "TIPO='" + carta.tipo + "'," +
                "RARIDADE='" + carta.raridade + "'," +
                "PRECOPADRAO=" + carta.precoPadrao + "," +
                "VIDA=" + vida + "," +
                "ACAO1=" + acao1 + "," +
                "ACAO2=" + acao2 +
                " WHERE IDCARTA = " + id;

            console.log("UPDATE na tabela carta = " + sqlAtualiza);

            this._db.then((pool) =>
            {
                pool.request().query(sqlAtualiza, function(erro)
                {
                    if (erro)
                    {
                        console.log(erro);
                        return reject("Atualização dos dados da carta está com erro");
                    }

                    resolve();
                });
            }).catch((erro) =>
            {
                console.log(erro);
                reject("Erro na conexão com o banco de dados");
            });
        });
    }


    removeCarta(id)
    {
        return new Promise((resolve, reject) =>
        {
            var sqlDelete =
                "DELETE FROM CARDGAME.CARTA WHERE IDCARTA = " + id;

            console.log("DELETE na tabela carta = " + sqlDelete);

            this._db.then((pool) =>
            {
                pool.request().query(sqlDelete, function(erro)
                {
                    if (erro)
                    {
                        console.log(erro);
                        return reject("Exclusão de uma carta está com erro");
                    }

                    resolve();
                });
            }).catch((erro) =>
            {
                console.log(erro);
                reject("Erro na conexão com o banco de dados");
            });
        });
    }


    listagemInventario()
    {
        return new Promise((resolve, reject) =>
        {
            var sql = `
                SELECT
                    I.*,
                    C.*,
                    U.*
                FROM CARDGAME.INVENTARIO I
                INNER JOIN CARDGAME.CARTA C
                    ON I.IDCARTA = C.IDCARTA
                INNER JOIN CARDGAME.USUARIO U
                    ON I.IDUSUARIO = U.IDUSUARIO
                ORDER BY I.IDINVENTARIO
            `;

            console.log(sql);

            this._db.then((pool) =>
            {
                pool.request().query(sql, function(erro, resultados)
                {
                    if (erro)
                    {
                        console.log(erro);
                        return reject("Listagem do inventário falhou");
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


    insereInventario(inventario)
    {
        return new Promise((resolve, reject) =>
        {
            var sqlInsere =
                "INSERT INTO CARDGAME.INVENTARIO " +
                "(IDCARTA, IDUSUARIO) " +
                "VALUES (" +
                inventario.idCarta + "," +
                inventario.idUsuario +
                ")";

            console.log("INSERT na tabela inventario = " + sqlInsere);

            this._db.then((pool) =>
            {
                pool.request().query(sqlInsere, function(erro)
                {
                    if (erro)
                    {
                        console.log(erro);
                        return reject("Inclusão no inventário está com erro");
                    }

                    resolve();
                });
            }).catch((erro) =>
            {
                console.log(erro);
                reject("Erro na conexão com o banco de dados");
            });
        });
    }

}

module.exports = CartaCRUD;