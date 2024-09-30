const { createHash } = require("crypto")

function hashPassword(password){
    const hashedPassword = createHash('sha256').update(password).digest('hex')
    return(hashedPassword)
}

module.exports = { hashPassword }