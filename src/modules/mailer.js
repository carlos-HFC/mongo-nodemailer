const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')

const { host, port, user, pass } = require('../config/mail.json')

const transport = nodemailer.createTransport({
   host,
   port,
   auth: { user, pass }
})

const handleOptions = {
   viewEngine: {
      extName: '.html',
      partialsDir: path.resolve('./resources/mail'),
      layoutsDir: path.resolve('./resources/mail'),
      defaultLayout: '',
   },
   viewPath: path.resolve('./src/resources/mail'),
   extName: '.html'
}

transport.use('compile', hbs(handleOptions))

module.exports = transport