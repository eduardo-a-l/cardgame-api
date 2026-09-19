const aplicacao = require("./src/config/express");

// inicilização do servidor NODEJS
aplicacao.listen(8081, () => {
  console.log("Servidor NODEJS da API MVC no ar na porta 8081");
  console.log("API: http://localhost:8081");
});