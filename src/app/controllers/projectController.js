const express = require('express')
const authMiddleware = require('../middlewares/auth')

const Project = require('../models/Project')
const Tasks = require('../models/Tasks')

const router = express.Router()

router.use(authMiddleware)

//listar todos os projetos
router.get('/', async (req, res) => {
   try {
      //populate colocará todas as informações do usuário e das tarefas
      const project = await Project.find().populate(['user', 'tasks'])
      return res.send({ project })
   } catch (error) {
      return res.status(400).send({ error: 'Erro ao carregar projetos' })
   }
})

//listar um único projeto
router.get('/:projectId', async (req, res) => {
   try {
      //pegará de acordo com o ID do projeto
      //populate colocará todas as informações do usuário e das tarefas
      const project = await Project.findById(req.params.projectId).populate(['user', 'tasks'])

      if (!project) {
         return res.status(400).send({ error: 'ID incorreto ou inexistente' })
      }
      return res.send({ project })
   } catch (error) {
      return res.status(400).send({ error: 'Erro ao carregar o projeto' })
   }
})

//criar um projeto
router.post('/', async (req, res) => {
   try {
      //pegar o título, descrição e as tarefas
      const { title, description, tasks } = req.body
      const project = await Project.create({ title, description, user: req.userId })

      //aguardará todo o map acontecer para salvar e atualizar
      await Promise.all(tasks.map(async task => {
         const projectTask = new Tasks({ ...task, project: project._id })
         //enviar as tarefas para a tabela tarefas
         await projectTask.save()
         project.tasks.push(projectTask)
      }))

      //atualizar as tarefas no banco
      await project.save()

      return res.send({ project })
   } catch (error) {
      // console.log(error)
      return res.status(400).send({ error: 'Erro ao criar um novo projeto' })
   }
})

//atualizar um projeto
router.put('/:projectId', async (req, res) => {
   try {
      //pegar o título, descrição e as tarefas
      const { title, description, tasks } = req.body
      //new: true retornará atualizado
      const project = await Project.findByIdAndUpdate(req.params.projectId, { title, description }, { new: true })

      //deletar as tarefas associadas antes de criá-las novamente
      project.tasks = []
      await Tasks.deleteOne({ project: project._id })

      //aguardará todo o map acontecer para salvar e atualizar
      await Promise.all(tasks.map(async task => {
         const projectTask = new Tasks({ ...task, project: project._id })
         //enviar as tarefas para a tabela tarefas
         await projectTask.save()
         project.tasks.push(projectTask)
      }))

      //atualizar as tarefas no banco
      await project.save()

      return res.send({ project })
   } catch (error) {
      // console.log(error)
      return res.status(400).send({ error: 'Erro ao atualizar o projeto' })
   }
})

//deletar um projeto
router.delete('/:projectId', async (req, res) => {
   try {
      //pegará de acordo com o ID do projeto
      await Project.findByIdAndRemove(req.params.projectId)
      return res.send()
   } catch (error) {
      return res.status(400).send({ error: 'Erro ao deletar o projeto' })
   }
})


module.exports = app => app.use('/projects', router)