const express = require("express");

const aplicacao = express();

const bodyParser = require("body-parser");

aplicacao.use(
    bodyParser.urlencoded({
        extended: true
    })
);

aplicacao.use(express.json());

const rotas = require("../app/routes/cartaRoutes");

rotas(aplicacao);

module.exports = aplicacao;