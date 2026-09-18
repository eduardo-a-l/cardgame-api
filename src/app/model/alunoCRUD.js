class AlunoCRUD
{

    constructor(db){
        this._db = db;
    }

    // método de SELECT que trará somente um aluno pesquisando pelo ID
    consultaAlunoPorId(id) 
    {
      return new Promise((resolve, reject) => 
         {
            var sql = "SELECT * FROM NODEJS.ALUNO WHERE ID = " + id;
            console.log(sql);
            this._db.query(sql,function(erro,recordset) 
            {
               if (erro) 
               {
                 console.log(erro);
                 return reject("Listagem com os dados do ALUNO em ESPECÍFICO " + id + " FALHOU!");
               }
               resolve(recordset);
            });
         });
    }
    

    // método de SELECT que trará somente um aluno pesquisando pelo RA
    consultaAlunoPorRA(ra) 
    {
      return new Promise((resolve, reject) => 
         {
            var sql = "SELECT * FROM NODEJS.ALUNO WHERE RA = " + ra;
            console.log(sql);
            this._db.query(sql,function(erro,recordset) 
            {
               if (erro) 
               {
                 console.log(erro);
                 return reject("Listagem com os dados do ALUNO do RA " + ra + " FALHOU!");
               }
               resolve(recordset);
            });
         });
    }



    // método de SELECT que trará TODOS os alunos existentes no BD ordenados pelo NOME do aluno 
    listagemAlunos() 
    {
      return new Promise((resolve, reject) => 
         {
            var sql = 'SELECT * FROM NODEJS.ALUNO ORDER BY ID';
            this._db.query(sql,function(erro,recordset) 
            {
               if (erro) 
               {
                 console.log(erro);
                 return reject("Listagem com TODOS os ALUNOS FALHOU!");
               }
               resolve(recordset);
            });
         });
    }
   
    // método de inclusão de registros na tabela ALUNO
    insereAluno(aluno) 
    {
      return new Promise((resolve,reject) => {
        var sqlInsere = "INSERT INTO NODEJS.ALUNO (RA, nome, datanascimento, email, celular, idcurso ) VALUES ('" + aluno.ra;
        sqlInsere += "','" + aluno.nome + "','" + aluno.datanascimento;
        sqlInsere += "','"  + aluno.email + "','" + aluno.celular;
        sqlInsere += "'," + aluno.idcurso + ")";
        console.log("INSERT na tabela ALUNO = " + sqlInsere);
        this._db.query(sqlInsere,
           function(erro) {
            if (erro) {
               console.log(erro);
               return reject('Inclusão de novo ALUNO está com ERRO!');
            }
            resolve();
           }
        ) 
      });
    }

    // método que atualiza um registro da tabela ALUNO
    atualizaAluno(id, aluno)
    {
      return new Promise((resolve,reject) => {
        var sqlAtualiza= "UPDATE NODEJS.ALUNO set RA= '" + aluno.ra + "',";
        sqlAtualiza += "nome='" + aluno.nome + "',";
        sqlAtualiza += "datanascimento='" + aluno.datanascimento + "',";
        sqlAtualiza += "email='" + aluno.email + "',";
        sqlAtualiza += "celular='" + aluno.celular + "',";
        sqlAtualiza += "idcurso=" + aluno.idcurso + " WHERE ID = " + id;
        console.log("UPDATE na tabela ALUNO = " + sqlAtualiza);
        this._db.query(sqlAtualiza,
           function(erro) {
            if (erro) {
               console.log(erro);
               return reject('Atualização dos dados do ALUNO está com ERRO!');
            }
            resolve();
           }
        ) 
      });
    }

    // método que exclui um registro da tabela ALUNO
    removeAluno(id)
    {
      return new Promise((resolve,reject) => {
        var sqlDelete = "DELETE FROM NODEJS.ALUNO WHERE ID= " + id;
        console.log("DELETE na tabela ALUNO = " + sqlDelete);
        this._db.query(sqlDelete,
           function(erro) {
            if (erro) {
               console.log(erro);
               return reject('Exclusão de um ALUNO está com ERRO!');
            }
            resolve();
           }
        ) 
      });

    }

}  // end da class

module.exports = AlunoCRUD;