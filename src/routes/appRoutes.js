const app = require('express')()
const cors = require('cors')
const { GetAllUser, UserRegister, UserLogin } = require("../controllers/users/user")
const bodyParser = require('body-parser')
const { tokenVerify } = require('../utils/tokenVerify')

app.use(cors({origin: '*'}))
app.use(bodyParser.json())

// GET

app.get('/', (req, res) => {
    return res.json('Server On')
})

app.get('/users', (req, res) => GetAllUser(req, res))


// POST

app.post('/register', (req, res) => UserRegister(req,res))

app.post('/login', (req, res) => UserLogin(req,res))


app.post('/verifyToken', (req, res) => {
    tokenVerify(req.body.token, (response)=>{
        res.json(response)
    })
})

module.exports.app = app
