const { db } = require("../../db")
const { tokenVerify } = require("../../utils/tokenVerify")
const { hashPassword } = require("./hashPassword")
const { GenerateToken } = require("./setUserToken")



async function UserRegister(req, res) {
    const { userName, userPassword, userEmail } = req.body

    const passwordHash = hashPassword(userPassword)

    const q1 = 'INSERT INTO users (`name`, `email`, `password`) VALUES(?)'
    const values = [
        userName,
        userEmail,
        passwordHash
    ]
    db.query(q1, [values], (err, result) => {
        if (err) {
            if (err?.errno === 1062) {
                return res.status(400).json('Email. already registered')
            }
            console.log(err)
            return res.json(err)
        }



        // faz o login do usuario automaticamento apos o registro
        const q2 = 'SELECT id, email, name FROM users WHERE email= ? and password= ?;'
        db.query(q2, [userEmail, passwordHash], (err, response) => {
            if (err) res.status(400)

            GenerateToken(response[0], 255, res)
        })

    })

}

async function UserLogin(req, res) {
    const q = 'SELECT id, email, name FROM users WHERE email= ? and password= ?;'
    const { email, password } = req.body
    const passwordHash = hashPassword(password)

    try {

        db.query(q, [email, passwordHash], (err, response) => {
            if (err) res.status(402)

            if (response.length <= 0) {
                res.status(400).json('Invalid Email or Password')
                return
            } else {
                GenerateToken(response[0], 255, res)
            }
        })
    } catch (error) {
        console.log(error)
    }
}

const GetAllUser = async (req, res) => {
    const q = 'SELECT id, name FROM users;'

    db.query(q, (err, data) => {
        if (err) return res.json(err)

        return res.status(200).json(data)
    })
}


module.exports = {
    UserRegister,
    UserLogin,
    GetAllUser
}
