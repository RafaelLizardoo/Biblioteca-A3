const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3003;

// Inicializando o banco de dados e criando tabelas
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');

  // Criação das tabelas
  db.run(`CREATE TABLE IF NOT EXISTS Bibliotecario (
            NomeBibliotecario TEXT,
            CPFBibliotecario TEXT PRIMARY KEY,
            Email TEXT,
            Usuario TEXT,
            Senha TEXT
        )`);
  db.run(`CREATE TABLE IF NOT EXISTS Livro (
            CodigoLivro INTEGER PRIMARY KEY,
            NomeLivro TEXT,
            Autor TEXT,
            Editora TEXT,
            Ano INTEGER,
            Categoria TEXT,
            ImagemLivro TEXT,
            DataReserva TEXT,
            DataDevolucao TEXT,
            Status TEXT,
            CPFAluno TEXT REFERENCES FichaAluno(CPFAluno)
        )`);
  db.run(`CREATE TABLE IF NOT EXISTS FichaAluno (
            NomeAluno TEXT,
            Email TEXT,
            Telefone TEXT,
            Matricula TEXT,
            CPFAluno TEXT PRIMARY KEY,
            CodigoLivro INTEGER REFERENCES Livro(CodigoLivro)
        )`, () => {
    // Verificar se as tabelas estão vazias antes de inserir os dados iniciais

    db.get('SELECT COUNT(*) AS count FROM Bibliotecario', (err, row) => {
      if (err) {
        console.error(err.message);
      } else if (row.count === 0) {
        // Inserindo um bibliotecário
        db.run(`INSERT INTO Bibliotecario (NomeBibliotecario, CPFBibliotecario, Email, Usuario, Senha) VALUES 
                ('João Silva', '12345678900', 'joao.silva@example.com', 'joaosilva', 'senha123')`, (err) => {
          if (err) {
            console.error(err.message);
          }
        });
      }
    });

    db.get('SELECT COUNT(*) AS count FROM FichaAluno', (err, row) => {
      if (err) {
        console.error(err.message);
      } else if (row.count === 0) {
        // Inserindo cinco alunos
        const alunos = [
          ['Ana Souza', 'ana.souza@example.com', '11987654321', '2023001', '11111111111', null],
          ['Bruno Lima', 'bruno.lima@example.com', '11987654322', '2023002', '22222222222', null],
          ['Carlos Pereira', 'carlos.pereira@example.com', '11987654323', '2023003', '33333333333', null],
          ['Daniela Alves', 'daniela.alves@example.com', '11987654324', '2023004', '44444444444', null],
          ['Eduardo Santos', 'eduardo.santos@example.com', '11987654325', '2023005', '55555555555', null]
        ];

        alunos.forEach(aluno => {
          db.run(`INSERT INTO FichaAluno (NomeAluno, Email, Telefone, Matricula, CPFAluno, CodigoLivro) VALUES (?, ?, ?, ?, ?, ?)`, aluno, (err) => {
            if (err) {
              console.error(err.message);
            }
          });
        });
      }
    });

    db.get('SELECT COUNT(*) AS count FROM Livro', (err, row) => {
      if (err) {
        console.error(err.message);
      } else if (row.count === 0) {
        // Inserindo dez livros
        const livros = [
          [1, 'Livro A', 'Autor A', 'Editora A', 2020, 'Ficção', null, null, null, 'Disponível', null],
          [2, 'Livro B', 'Autor B', 'Editora B', 2019, 'Drama', null, null, null, 'Disponível', null],
          [3, 'Livro C', 'Autor C', 'Editora C', 2021, 'Romance', null, null, null, 'Disponível', null],
          [4, 'Livro D', 'Autor D', 'Editora D', 2018, 'Aventura', null, null, null, 'Disponível', null],
          [5, 'Livro E', 'Autor E', 'Editora E', 2017, 'Terror', null, null, null, 'Disponível', null],
          [6, 'Livro F', 'Autor F', 'Editora F', 2016, 'Ficção Científica', null, null, null, 'Disponível', null],
          [7, 'Livro G', 'Autor G', 'Editora G', 2015, 'Biografia', null, null, null, 'Disponível', null],
          [8, 'Livro H', 'Autor H', 'Editora H', 2014, 'História', null, null, null, 'Disponível', null],
          [9, 'Livro I', 'Autor I', 'Editora I', 2013, 'Ficção', null, null, null, 'Disponível', null],
          [10, 'Livro J', 'Autor J', 'Editora J', 2012, 'Aventura', null, null, null, 'Disponível', null]
        ];

        livros.forEach(livro => {
          db.run(`INSERT INTO Livro (CodigoLivro, NomeLivro, Autor, Editora, Ano, Categoria, ImagemLivro, DataReserva, DataDevolucao, Status, CPFAluno) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, livro, (err) => {
            if (err) {
              console.error(err.message);
            }
          });
        });
      }
    });

    console.log('Dados iniciais inseridos com sucesso.');
  });
});

// Configurar o middleware body-parser
app.use(bodyParser.json());

app.use(cors());

// Rota para a raiz do servidor
app.get('/', (req, res) => {
  res.send('Bem-vindo ao sistema de gestão de livros e empréstimos!');
});

// Função para criar conta de bibliotecário
app.post('/bibliotecarios', (req, res) => {
  const { nome, cpf, email, usuario, senha } = req.body;
  db.run('INSERT INTO Bibliotecario (NomeBibliotecario, CPFBibliotecario, Email, Usuario, Senha) VALUES (?, ?, ?, ?, ?)', [nome, cpf, email, usuario, senha], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao criar conta de bibliotecário');
    } else {
      res.status(201).send('Conta de bibliotecário criada com sucesso');
    }
  });
});

// Função para fazer login de bibliotecário
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  console.log('Email recebido:', email); // Adicionar log para verificar o email recebido
  console.log('Senha recebida:', senha); // Adicionar log para verificar a senha recebida

  db.get('SELECT * FROM Bibliotecario WHERE Email = ? AND Senha = ?', [email, senha], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao fazer login');
    } else if (!row) {
      console.log('Credenciais inválidas para email:', email); // Adicionar log para verificar as credenciais inválidas
      res.status(401).send('Credenciais inválidas');
    } else {
      console.log('Login bem-sucedido para email:', email); // Adicionar log para verificar o login bem-sucedido
      res.status(200).json(row);
    }
  });
});

// Função para criar ficha de aluno
app.post('/alunos', (req, res) => {
  const { nome, email, telefone, matricula, cpf, codigoLivro } = req.body;
  db.run('INSERT INTO FichaAluno (NomeAluno, Email, Telefone, Matricula, CPFAluno, CodigoLivro) VALUES (?, ?, ?, ?, ?, ?)', [nome, email, telefone, matricula, cpf, codigoLivro], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao criar ficha de aluno');
    } else {
      res.status(201).send('Ficha de aluno criada com sucesso');
    }
  });
});

// Função para consultar aluno por CPF
app.get('/alunos/:cpf', (req, res) => {
  const { cpf } = req.params;
  db.get('SELECT * FROM FichaAluno WHERE CPFAluno = ?', [cpf], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao consultar aluno');
    } else if (!row) {
      res.status(404).send('Aluno não encontrado');
    } else {
      res.status(200).json(row);
    }
  });
});

// Função para consultar bibliotecário por CPF
app.get('/bibliotecarios/:cpf', (req, res) => {
  const { cpf } = req.params;
  db.get('SELECT * FROM Bibliotecario WHERE CPFBibliotecario = ?', [cpf], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao consultar bibliotecário');
    } else if (!row) {
      res.status(404).send('Bibliotecário não encontrado');
    } else {
      res.status(200).json(row);
    }
  });
});

// Função para cadastrar livro
app.post('/livros', (req, res) => {
  const { codigoLivro, nome, autor, editora, ano, categoria, imagemLivro, dataReserva, dataDevolucao, status, cpfAluno } = req.body;
  db.run('INSERT INTO Livro (CodigoLivro, NomeLivro, Autor, Editora, Ano, Categoria, ImagemLivro, DataReserva, DataDevolucao, Status, CPFAluno) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [codigoLivro, nome, autor, editora, ano, categoria, imagemLivro, dataReserva, dataDevolucao, status, cpfAluno], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao cadastrar livro');
    } else {
      res.status(201).send('Livro cadastrado com sucesso');
    }
  });
});

// Função retornar livros
app.get('/livros', (req, res) => {
  db.all('SELECT * FROM Livro', (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao pesquisar livro');
    } else if (!row) {
      res.status(404).send('Livro não encontrado');
    } else {
      res.status(200).json(row);
    }
  });
});

// Função para pesquisar livro pelo código
app.get('/livros/:codigo', (req, res) => {
  const { codigo } = req.params;
  db.get('SELECT * FROM Livro WHERE CodigoLivro = ?', [codigo], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao pesquisar livro');
    } else if (!row) {
      res.status(404).send('Livro não encontrado');
    } else {
      res.status(200).json(row);
    }
  });
});

// Função para atualizar cadastro de livro
app.put('/livros/atualizar/:codigo', (req, res) => {
  const { nome, autor, editora, ano, categoria, imagemLivro, dataReserva, dataDevolucao, status, cpfAluno } = req.body;
  const { codigo } = req.params;
  db.run('UPDATE Livro SET NomeLivro = ?, Autor = ?, Editora = ?, Ano = ?, Categoria = ?, ImagemLivro = ?, DataReserva = ?, DataDevolucao = ?, Status = ?, CPFAluno = ? WHERE CodigoLivro = ?', [nome, autor, editora, ano, categoria, imagemLivro, dataReserva, dataDevolucao, status, cpfAluno, codigo], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao atualizar cadastro de livro');
    } else {
      res.status(200).send('Cadastro de livro atualizado com sucesso');
    }
  });
});

// Função para apagar cadastro de livro
app.delete('/livros/delete/:codigo', (req, res) => {
  const { codigo } = req.params;
  db.run('DELETE FROM Livro WHERE CodigoLivro = ?', [codigo], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao apagar cadastro de livro');
    } else {
      res.status(200).send('Cadastro de livro apagado com sucesso');
    }
  });
});

// Função para consultar pendências de livros
app.get('/pendencias', (req, res) => {
  db.all('SELECT Livro.NomeLivro, Livro.CodigoLivro, FichaAluno.NomeAluno, FichaAluno.CPFAluno, FichaAluno.Telefone FROM Livro INNER JOIN FichaAluno ON Livro.CPFAluno = FichaAluno.CPFAluno', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao consultar pendências de livros');
    } else {
      res.status(200).json(rows);
    }
  });
});

// Função para registrar a devolução do livro
app.post('/devolver/:codigoLivro', (req, res) => {
  const { codigoLivro } = req.params;

  // Verificar se o livro está reservado
  db.get('SELECT * FROM Livro WHERE CodigoLivro = ?', [codigoLivro], (err, livro) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao verificar reserva do livro');
      return;
    }

    if (livro.Status !== 'Reservado') {
      res.status(400).send('Livro não está reservado');
      return;
    }

    // Limpar informações de reserva do livro
    db.run('UPDATE Livro SET Status = ?, CPFAluno = ? WHERE CodigoLivro = ?', ['Disponível', null, codigoLivro], (err) => {
      if (err) {
        console.error(err.message);
        res.status(500).send('Erro ao devolver livro');
      } else {
        res.status(200).send('Livro devolvido com sucesso');
      }
    });
  });
});

// Função para reservar um livro
app.post('/reservar/:codigoLivro/:cpfAluno', (req, res) => {
  const { codigoLivro, cpfAluno } = req.params;

  // Verificar se o livro já está reservado
  db.get('SELECT * FROM Livro WHERE CodigoLivro = ?', [codigoLivro], (err, livro) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao verificar reserva do livro');
      return;
    }

    if (livro.Status === 'Reservado') {
      res.status(400).send('Livro já está reservado');
      return;
    }

    // Atualizar status do livro para reservado e adicionar CPF do aluno
    db.run('UPDATE Livro SET Status = ?, CPFAluno = ? WHERE CodigoLivro = ?', ['Reservado', cpfAluno, codigoLivro], (err) => {
      if (err) {
        console.error(err.message);
        res.status(500).send('Erro ao reservar livro');
      } else {
        res.status(200).send('Livro reservado com sucesso');
      }
    });
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor está rodando em http://localhost:${port}`);
});
