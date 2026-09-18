// chamando o pacote express
const express = require("express");

// associando a minha aplicacao ao pacote express = aplicacao web
const aplicacao = express();

// chamando o pacote body-parser
const bodyParser = require("body-parser");

//const alunoRoutes = require("./routes/alunoRoutes");

// permitindo que o nodejs consiga pegar os dados vindo do BODY
aplicacao.use(
    bodyParser.urlencoded({
        extended: true
    })
);

// indicando que estarei usando JSON
aplicacao.use(express.json());

// chamando o arquivo de rotas de ALUNO
const rotas = require("../app/routes/alunoRoutes");
rotas(aplicacao);

// sem isso não será possível usar as configurações da aplicacao
module.exports = aplicacao;





