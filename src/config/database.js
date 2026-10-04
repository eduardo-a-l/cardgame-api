require("dotenv").config();
const mssql = require("mssql");

const configuracao = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

const pool = new mssql.ConnectionPool(configuracao);

const conexao = pool
    .connect()
    .then((poolConectado) => {
        console.log("Conexão com o BD SQLServer realizada com sucesso");
        return poolConectado;
    })
    .catch((erro) => {
        console.error("Erro na conexão com o BD SQLServer:", erro);
        throw erro;
    });

module.exports = conexao;