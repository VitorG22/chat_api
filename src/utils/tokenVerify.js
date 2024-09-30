const { db } = require("../db");

async function tokenVerify(token, callBackFunction){
    const q = "Select `id`, `email`, `name`, `picture_url`,`token` from users Where `token` = ?"
    
    try {
        db.query(q, token, (err, res)=>{
            if(res.length > 0 ){
                callBackFunction({
                    validToken: true,
                    userData: res[0]
                })
            }else{
                callBackFunction({
                    validToken: false,
                    userData: []
                })
            }
        })
    } catch (error) {
        console.log(error)
        throw error
    }
}

module.exports = {
    tokenVerify
}