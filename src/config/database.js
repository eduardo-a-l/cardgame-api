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

const conexao = mssql.connect(configuracao);

conexao
    .then(() => {
        console.log("Conexão com o BD SQLServer realizada com sucesso");
    })
    .catch((erro) => {
        console.error(
            "Erro na conexão com o BD SQLServer:",
            erro
        );
    });

module.exports = conexao;