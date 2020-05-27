const mongoose = require('../../database')
const bcrypt = require('bcryptjs')

//Tarefa
const TasksSchema = new mongoose.Schema({
   //título da tarefa
   title: {
      type: String,
      required: true
   },
   //chave estrangeira do projeto
   project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
   },
   //chave estrangeira para quem foi atribuída a tarefa
   assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   //tarefa completa ou incompleta
   completed: {
      type: Boolean,
      required: true,
      default: false
   },
   //data de criação da tarefa
   createdAt: {
      type: Date,
      default: Date.now
   }
})

//exportar a tabela
const Tasks = mongoose.model('Tasks', TasksSchema)

module.exports = Tasks