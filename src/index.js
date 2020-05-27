const express = require('express')
const bodyParser = require('body-parser')

const app = express()

//enviar requisições para a api em JSON
app.use(bodyParser.json())
//conseguir decodar parâmetros a partir de URLs
app.use(bodyParser.urlencoded({ extended: false }))

//passar as rotas, e repassar o app para repassar o express
require('./app/controllers/index')(app)

//utilizar na porta 3001
app.listen(3001)