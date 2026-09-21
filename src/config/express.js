const express = require("express");

const aplicacao = express();

const bodyParser = require("body-parser");

aplicacao.use(
    bodyParser.urlencoded({
        extended: true
    })
);

aplicacao.use(express.json());

aplicacao.use((request, response, next) => {

    response.header("Access-Control-Allow-Origin", "*");
    response.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    response.header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (request.method === "OPTIONS")
    {
        return response.sendStatus(204);
    }

    next();

});

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