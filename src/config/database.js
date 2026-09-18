// chamando o pacote do bd mssql
const mssql = require("mssql");

// Configuração da conexão com o SQL Server
const configuracao = {
  user: "000000",
  password: "000000",
  server: "regulus.cotuca.unicamp.br",
  database: "000000",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Fazendo a conexão com o SQL Server
mssql.connect(configuracao)
  .then(() => {
    console.log("CONEXÃO com o BD SQLSERVER realizada com SUCESSO!");
  })
  .catch((erro) => {
    console.error(
      "Erro na CONEXÃO com o BD SQLSERVER - BDMARCIA:",
      erro
    );
  });

// Exporta o objeto mssql para ser utilizado em outros arquivos
module.exports = mssql;

