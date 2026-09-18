// chamando e instanciando a classe de CONTROLLER do ALUNO
const AlunoController = require("../controller/alunoController");
const obj_AlunoController = new AlunoController();

// indicar que a aplicacao (express) vai usar esse arquivo de rotas
module.exports = (aplicacao) => {
  aplicacao.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    next();
  });

  /****************** ROTAS = ENDPOINTS ******************/

  // rota GET - listagem com todos os ALUNOS
  aplicacao.get("/Alunos", obj_AlunoController.listarTodosAlunos());

  // rota GET pegando dados do ALUNO por ID
  aplicacao.get(
    "/Alunos/:id",
    obj_AlunoController.consultarAlunoPorId()
  );

  // rota GET pegando dados do ALUNO por RA
  aplicacao.get(
    "/Alunos/ra/:ra",
    obj_AlunoController.consultarAlunoPorRA()
  );

  // rota DELETE para excluir um ALUNO especificado
  aplicacao.delete("/Alunos/:id", obj_AlunoController.excluirAluno());

  // rota POST para inclusão de novo ALUNO
  aplicacao.post("/Alunos", obj_AlunoController.inserirNovoAluno());

  // rota PUT para atualização dos dados do ALUNO
  aplicacao.put("/Alunos/:id", obj_AlunoController.atualizarDadosAluno());

}; // end do module.exports
