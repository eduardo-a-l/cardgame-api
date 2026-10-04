const express = require("express");
const cors = require("cors");

const rotasBaralho = require("../app/routes/baralhoRoutes");
const rotasCarta = require("../app/routes/cartaRoutes");
const rotasLoja = require("../app/routes/lojaRoutes");
const rotasUsuario = require("../app/routes/usuarioRoutes");

const aplicacao = express();

aplicacao.use(cors());
aplicacao.use(express.json());
aplicacao.use(express.urlencoded({ extended: true }));

aplicacao.use("/uploads", express.static("uploads"));

aplicacao.use(rotasBaralho);
aplicacao.use(rotasCarta);
aplicacao.use(rotasLoja);
aplicacao.use(rotasUsuario);

module.exports = aplicacao;