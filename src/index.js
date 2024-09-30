const { app } = require('./routes/appRoutes')
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: '*' } })
const { db } = require("./db")
const { setNewMessage } = require('./ioScripts/setNewMessage')

const PORT = process.env.PORT ?? 3001

io.on('connection', socket => {
    // socket.on('disconnect')

    socket.on('setUserData', (data) => {
        socket.data.userName = data.UserName
        socket.data.userId = data.UserId
        socket.data.userToken = data.UserToken

        getUserContacts(socket.data.userId, (response) =>{
            io.emit(`setContacts_${socket.data.userId}`, response)
        })
        setInitialMessageList(socket, (response) => io.emit(`setInitialMessageList_${socket.data.userId}`, response))
    })

    socket.on('sendMessage', async (data) => {
        setNewMessage(data, socket, (response) => {

            let IdsInChatList = []
            response.forEach(element => {
                let isAuthorIdInList = IdsInChatList.findIndex((id) => id == element.author_id)
                if (isAuthorIdInList == -1) IdsInChatList.push(element.author_id)

                let isRemitteeIdInList = IdsInChatList.findIndex((id) => id == element.author_id)
                if (isRemitteeIdInList == -1) IdsInChatList.push(element.remittee_id)
            });

            const q = "SELECT name as contact_name, id contact_id, picture_url as contact_img from users WHERE id in (?);"
            db.query(q, [IdsInChatList], async (err, res) => {
                if (err) return
                // emit para o usuario que enviou a mensagem
                io.emit(`receiveMessage_${socket.data.userId}`, {
                    chatId: data.sendToId,
                    contactsInChat: res,
                    data: response
                })
                // emit para os demais usuarios do chat
                io.emit(`receiveMessage_${data.sendToId}`, {
                    chatId: socket.data.userId,
                    contactsInChat: res,
                    data: response
                })
            })
        }
        )
    })

    socket.on('addNewContact', async (data) => {
        addNewContact(socket.data.userId, data.contactId)
        addNewContact(data.contactId, socket.data.userId)
    })

})


server.listen(PORT, () => console.log('Server running in PORT: ', PORT))

function setInitialMessageList(socket, callback) {
    const q = 'SELECT message, author_id, remittee_id, date FROM message WHERE author_id = ? or remittee_id = ? ORDER BY date;'
    const values = [socket.data.userId, socket.data.userId]
    db.query(q, values, async (err, res) => {
        if (err) return
        let messagesList = []

        res.forEach(element => {
            let messageFromChatWithId = -1

            if (element.author_id == socket.data.userId) {
                messageFromChatWithId = element.remittee_id
            } else {
                messageFromChatWithId = element.author_id
            }

            let chatIndex = messagesList.findIndex(item => item.chatId == messageFromChatWithId)
            if (chatIndex == -1) {
                messagesList.push({
                    chatId: messageFromChatWithId,
                    contactsInChat: [],
                    data: [element]
                })
            } else {
                let newData = Array.from(messagesList[chatIndex].data)
                newData.push(element)
                messagesList.splice(chatIndex, 1, {
                    ...messagesList[chatIndex],
                    data: newData
                })
            }
        })

        messagesList.forEach((element, index) => {
            let IdsInChatList = []
            element.data.forEach(item => {
                let isAuthorIdInList = IdsInChatList.findIndex((id) => id == item.author_id)
                if (isAuthorIdInList == -1) IdsInChatList.push(item.author_id)

                let isRemitteeIdInList = IdsInChatList.findIndex((id) => id == item.remittee_id)
                if (isRemitteeIdInList == -1) IdsInChatList.push(item.remittee_id)
            });

            const q = "SELECT name as contact_name, id contact_id, picture_url as contact_img from users WHERE id in (?);"
            db.query(q, [IdsInChatList], async (err, res) => {
                if (err) return
                messagesList[index].contactsInChat = res

                if (index === messagesList.length - 1) { callback(messagesList) }
            })
        })

    })

}

function getUserContacts(userId, callback) {
    const q = 'select user_contact.contact_id, users_b.name as contact_name, users_b.picture_url as contact_img from users as users_a join user_contact on users_a.id = user_contact.user_id join users as users_b  on user_contact.contact_id = users_b.id where users_a.id = ?;'
    try {

        db.query(q, userId, (err, data) => {
            if (err) return
            callback(data)
        })
    } catch (error) {
        return
    }
}

function addNewContact(id_1, id_2) {
    const q1 = 'INSERT INTO user_contact (id, user_id, contact_id) VALUES (?)'
    const id = `${id_1}_${id_2}`
    const values = [id, id_1, id_2]
    db.query(q1, [values], (err, res) => {
        if (err) {
            console.log(err)
            return
        }
        getUserContacts(id_1, (response) => {
            io.emit(`setContacts_${id_1}`, response)
        })
    })
}