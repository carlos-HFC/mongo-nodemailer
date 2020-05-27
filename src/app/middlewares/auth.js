const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')

module.exports = (req, res, next) => {
   const authHeader = req.headers.authorization

   //se não houver token, erro de autorização
   if (!authHeader) {
      return res.status(401).send({ error: 'Token não informado' })
   }

   const parts = authHeader.split(' ')

   //se token tem duas partes (Bearer token)
   if (!parts.length === 2) {
      return res.status(401).send({ error: 'Erro no token' })
   }

   const [scheme, token] = parts

   //token não formatado da forma correta
   if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).send({ error: 'Token não formatado' })
   }

   jwt.verify(token, authConfig.secret, (err, decoded) => {
      if (err) {
         return res.status(401).send({ error: 'Token inválido' })
      }

      //pegar o id do token
      req.userId = decoded.id
      //pode passar
      return next()
   })
}