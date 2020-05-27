const mongoose = require('../../database')
const bcrypt = require('bcryptjs')

//Projeto
const ProjectSchema = new mongoose.Schema({
   //título do projeto
   title: {
      type: String,
      required: true
   },
   //descrição do projeto
   description: {
      type: String,
      required: true
   },
   //chave estrangeira do usuário
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   //chave estrangeira da tarefa
   tasks: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Tasks'
      }
   ],
   //data de criação do projeto
   createdAt: {
      type: Date,
      default: Date.now
   }
})

//exportar a tabela
const Project = mongoose.model('Project', ProjectSchema)

module.exports = Project