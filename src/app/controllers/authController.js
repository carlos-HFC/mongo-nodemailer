const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const authConfig = require('../../config/auth.json')
const User = require('../models/User')
const mailer = require('../../modules/mailer')

const router = express.Router()

function generateToken(params = {}) {
   //token expira em 1 dia
   return jwt.sign(params, authConfig.secret, {
      expiresIn: 86400
   })
}

//registrar usuário
router.post('/register', async (req, res) => {
   const { email } = req.body
   try {
      //verifica dado único e faz validação se já existe
      if (await User.findOne({ email })) {
         return res.status(400).send({ error: 'Email já existe' })
      }
      //cria o usuário
      const user = await User.create(req.body)
      //impedir que a senha apareça
      user.password = undefined
      //mostra os dados cadastrados
      return res.send({ user, token: generateToken({ id: user.id }) })
   } catch (error) {
      //erro no registro
      return res.status(400).send({ error: 'Registro falhou' })
   }
})

//autenticação
router.post('/authenticate', async (req, res) => {
   const { email, password } = req.body

   //pega o email e a senha
   const user = await User.findOne({ email }).select('+password')

   //se usuário não existe
   if (!user) {
      return res.status(400).send({ error: 'Usuário não encontrado' })
   }

   //se a senha hash for diferente da senha cadastrada
   if (!await bcrypt.compare(password, user.password)) {
      return res.status(400).send({ error: 'Senha inválida' })
   }

   user.password = undefined

   res.send({ user, token: generateToken({ id: user.id }) })
})

//esqueceu a senha
router.post('/forgotPassword', async (req, res) => {
   const { email } = req.body

   try {
      const user = await User.findOne({ email })

      if (!user) {
         return res.status(400).send({ error: 'Usuário não encontrado' })
      }

      //randomBytes -> tamanho em bytes e converter em hexadecimal (alfanumérico)
      const token = crypto.randomBytes(20).toString('hex')

      const now = new Date()
      now.setHours(now.getHours() + 1)

      await User.findByIdAndUpdate(user.id, {
         '$set': {
            passwordResetToken: token,
            passwordResetExpires: now
         }
      })

      //enviar email para resetar senha
      mailer.sendMail({
         to: email,
         from: 'chfcchfc96@gmail.com',
         template: 'auth/forgot',
         context: { token }
      }, (err) => {
         if (err) {
            return res.status(400).send({ error: 'Não foi possível enviar o e-mail para recuperação de senha' })
         }
         return res.send()
      })
   } catch (error) {
      res.status(400).send({ error: 'Erro, tente novamente' })
   }
})

//resetar senha
router.post('/resetPassword', async (req, res) => {
   const { email, token, password } = req.body

   try {
      const user = await User.findOne({ email })
         .select('+passwordResetToken passwordResetExpires')

      if (!user) {
         return res.status(400).send({ error: 'Usuário não encontrado' })
      }

      if (token !== user.passwordResetToken) {
         return res.status(400).send({ error: 'Token inválido' })
      }

      const now = new Date()

      if (now > user.passwordResetExpires) {
         return res.status(400).send({ error: 'Token expirou. Gere um novo' })
      }
      user.password = password

      await user.save()

      res.send()
   } catch (error) {
      res.status(400).send({ error: 'Não foi possível resetar a senha' })
   }
})

//repassar o router para app com a rota auth
module.exports = app => app.use('/auth', router)