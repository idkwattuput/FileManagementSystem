const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()

dotenv.config()
const port = process.env.PORT

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser())

app.use('/user', require('./routes/UserRoute'))
app.use('/auth', require('./routes/AuthRoute'))
app.use('/file', require('./routes/FileRoute'))
app.use('/folder', require('./routes/FolderRoute'))

app.listen(port, () => {
    console.log(`Server is on http://localhost:${port}`)
})