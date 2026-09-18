// chamando a classe AlunoCRUD
const AlunoCRUD = require("../model/alunoCRUD");

// instanciar a classe de conexão com o BD
var db = require("../../config/database");

class AlunoController 
{

  // método do controller que chamará o método listagemAlunos()
  listarTodosAlunos() {
    return function (request, response) {
      const alunoCRUD = new AlunoCRUD(db);
      alunoCRUD
        .listagemAlunos()
        .then((resultados) => {
          console.log("DADOS (JSON) vindo da tabela ALUNO:");
          console.log(resultados.recordset);
          response.json(resultados.recordset);
        })
        .catch((erro) => {
          console.log(erro);
          response.status(500).json({
          erro: "Erro ao listar TODOS os ALUNOS!"
        });
      });
    };
  }


  // método do controller que chamará o método consultaAlunoPorId()
  consultarAlunoPorId() {
    return function (request, response) {
      const idDoAluno = request.params.id;
      console.log("ID do ALUNO = " + idDoAluno);
      const alunoCRUD = new AlunoCRUD(db);
      alunoCRUD
        .consultaAlunoPorId(idDoAluno)
        .then((resultados) => {
          console.log("DADOS (JSON) do ALUNO especificado:");
          console.log(resultados.recordset);
          response.json(resultados.recordset);
        })
        .catch((erro) => {
          console.log(erro);
          response.status(500).json({
          erro: "Erro ao listar ALUNO por ID!"
        });
      });
    };
  }


  // método do controller que chamará o método consultaAlunoPorRA()
  consultarAlunoPorRA() {
    return function (request, response) {
      const raDoAluno = request.params.ra;
      console.log("RA do ALUNO = " + raDoAluno);
      const alunoCRUD = new AlunoCRUD(db);
      alunoCRUD
        .consultaAlunoPorRA(raDoAluno)
        .then((resultados) => {
          console.log("DADOS (JSON) do ALUNO do RA " + raDoAluno);
          console.log(resultados.recordset);
          response.json(resultados.recordset);
        })
        .catch((erro) => {
          console.log(erro);
          response.status(500).json({
          erro: "Erro ao listar ALUNO por RA!"
        });
      });
    };
  }


  // método do controller que chamará o método insereAluno()
  inserirNovoAluno() {
    return function (request, response) {
      let dados = request.body;
      console.log("DADOS DO NOVO ALUNO = " + dados);
      const alunoCRUD = new AlunoCRUD(db);
      alunoCRUD
        .insereAluno(dados)
        .then(() => {
          console.log("ALUNO FOI INSERIDO NO BD COM SUCESSO");
          response.status(200).end();
        })
        .catch((erro) => {
          console.log(erro);
          response.status(500).json({
          erro: "Erro ao inserir novo ALUNO no BD!"
        });
      });
    };
  }


  // método do controller que chamará o método atualizaAluno()
  atualizarDadosAluno() {
    return function (request, response) {
      let dados = request.body;
      console.log("DADOS DO ALUNO A SEREM ATUALIZADOS = " + dados);
      let id = request.params.id;
      const alunoCRUD = new AlunoCRUD(db);
      alunoCRUD
        .atualizaAluno(id, dados)
        .then(() => {
          console.log("DADOS DO ALUNO FORAM ATUALIZADOS COM SUCESSO");
          response.status(200).end();
        })
        .catch((erro) => {
          console.log(erro);
          response.status(500).json({
          erro: "Erro ao atualizar dados do ALUNO no BD!"
        });
      });
    };
  }

  
  // método do controller que chamará o método removeAluno()
  excluirAluno() {
    return function (request, response) {
      const idDoAluno = request.params.id;
      const alunoCRUD = new AlunoCRUD(db);
      alunoCRUD
        .removeAluno(idDoAluno)
        .then(() => {
          console.log("ALUNO FOI EXCLUÍDO DO BD COM SUCESSO");
          response.status(200).end();
        })
        .catch((erro) => {
          console.log(erro);
          response.status(500).json({
          erro: "Erro ao excluir ALUNO no BD!"
        });
      });
    };
  }
  
} // end da classe

module.exports = AlunoController;
