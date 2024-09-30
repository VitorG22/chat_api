const { db } = require("../../db")


function GenerateToken(userData, TokenCharacterCount, res) {
    const characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '-', '_', '@', '#', '$', '!', '%', '&']
    let accessToken = ''

    for (i = 0; i < TokenCharacterCount; i++) {
        var randomCharacter = characters[Math.floor(Math.random() * characters.length)]
        accessToken += randomCharacter
    }

    QueryTokenAwareExist(userData, accessToken, res)

}


function QueryTokenAwareExist(userData, accessToken, res) {
    const q = "SELECT `id` FROM users WHERE token=?;"

    db.query(q, [accessToken], async (err, data) => {
        if (err) return console.error(err)

        let queryReturn = data
        if (queryReturn.length <= 0) {
            updateUser(userData, accessToken, res)

        } else {
            GenerateToken(userData, 255, res)
        }

    })
}

function updateUser(userData, accessToken, res) {
    const q = 'UPDATE users SET `token` = ?, `token_expire` = ? WHERE (`id` = ?);'
    let date = new Date()
    date.setDate(date.getDate() + 3);

    const values = [
        accessToken,
        date,
        userData.id
    ]

    try {
        db.query(q, values, (err, result) => {
            if (err) return res.status(400)

            return res.status(200).json({
                ...userData,
                token: accessToken,
                expire: date 
            })
        })
    } catch (error) {
        res.status(400)
        return
    }
}

module.exports = {
    GenerateToken
}