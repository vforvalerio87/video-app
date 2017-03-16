const express = require('express')
const path = require('path')

const app = express()

const publicPath = path.join(__dirname, '/public')

app.use('/static', express.static(path.join(publicPath, 'static')))
app.use('/api', express.static(path.join(publicPath, 'api')))
app.get('/', (_, res) => {
  res.sendFile(path.join(publicPath, 'index.html'))
})
app.get('*', (_, res) => {
  res.send('404')
})

app.listen(8080, () => {
  console.log('Running on 8080')
})
