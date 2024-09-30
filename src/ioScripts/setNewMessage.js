const { db } = require("../db")

async function setNewMessage(data, socket, callback) {
    const q1 = `INSERT INTO message (message, author_id, remittee_id) VALUES (?)`
    const values = [
        data.message,
        socket.data.userId,
        data.sendToId
    ]
    try {
        db.query(q1, [values], (err, res) => {
            if (err) {
                console.log('Error: ', err)
                return
            }
            const q2 = 'SELECT author_id, message, remittee_id, date from message WHERE (remittee_id = ? and author_id = ?) or (remittee_id = ? and author_id = ?) ORDER BY date;'
            const values = [data.sendToId, socket.data.userId, socket.data.userId, data.sendToId]

            db.query(q2, values, (err, result) => {
                if(err){
                    return
                }
                callback(result)
            })
        })
    } catch (error) {
        console.log("Error: ", error)
        return
    }
}

module.exports = {
    setNewMessage
}