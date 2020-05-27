const mongoose = require('../../database')
const bcrypt = require('bcryptjs')

//Usuário
const UserSchema = new mongoose.Schema({
   //nome do usuário
   nome: {
      type: String,
      required: true
   },
   //e-mail do usuário
   email: {
      type: String,
      required: true,
      unique: true, //chave única
      lowercase: true //letras minúsculas
   },
   //senha do usuário
   password: {
      type: String,
      required: true,
      select: false //indica que o campo não apareça
   },
   //token para resetar a senha
   passwordResetToken: {
      type: String,
      select: false
   },
   //quando o token expira
   passwordResetExpires: {
      type: Date,
      select: false
   },
   //data de criação do usuário
   createdAt: {
      type: Date,
      default: Date.now
   }
})

//função que acontecerá antes de alguma ação
UserSchema.pre('save', async function (next) {
   //encriptar senha
   const hash = await bcrypt.hash(this.password, 10)
   this.password = hash
   next()
})

//exportar a tabela
const User = mongoose.model('User', UserSchema)

module.exports = User