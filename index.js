const aplicacao = require("./src/config/express");

const PORTA = process.env.PORT || 8081;

aplicacao.listen(PORTA, () => {
  console.log(`Servidor NODEJS da API MVC no ar na porta ${PORTA}`);
  console.log(`API: http://localhost:${PORTA}`);
});