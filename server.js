const express = require('express')
const app = express()

const publicPath = __dirname + '/public'

app.use('/static', express.static(publicPath + '/static'))
app.use('/api', express.static(publicPath + '/api'))
app.use('/', (_, res) => {
  res.sendFile(publicPath + '/index.html')
})
app.use('*', (_, res) => {
  res.send('404')
})

app.listen(8080)
