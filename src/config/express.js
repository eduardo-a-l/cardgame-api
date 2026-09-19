const express = require("express");

const aplicacao = express();

const bodyParser = require("body-parser");

aplicacao.use(
    bodyParser.urlencoded({
        extended: true
    })
);

aplicacao.use(express.json());

aplicacao.use("/uploads", express.static("uploads"));

const rotasCarta = require("../app/routes/cartaRoutes");
const rotasUsuario = require("../app/routes/usuarioRoutes");
const rotasLoja = require("../app/routes/lojaRoutes");
const rotasBaralho = require("../app/routes/baralhoRoutes");

rotasCarta(aplicacao);
rotasUsuario(aplicacao);
rotasLoja(aplicacao);
rotasBaralho(aplicacao);

module.exports = aplicacao;