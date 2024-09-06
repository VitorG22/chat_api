const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {cors:{origin: '*'}})

const PORT = process.env.PORT ?? 3001

io.on('connection', socket => {
    console.log('User Connect:', socket.id)
    socket.on('disconnect', reason => console.log('Usuario Desconectado: ', socket.id))
    
    socket.on('setUserName', (data) => {
        socket.data.userName = data.userName
    })

    socket.on('sendMessage', (data)=>{
        console.log(data)
        io.emit('receiveMessage', {
            authorName: socket.data.userName,
            message:  data.message,
            authorId: socket.id
        })
    })
})


app.get('/', (req,res)=>{
    return res.json('Server On')
})

server.listen(PORT, ()=> console.log('Server running in PORT: ', PORT))