require('dotenv').config();
const cors = require('cors')
const http = require('http');
const {Server} = require('socket.io')
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const connectDB = require('./db/connect');
const corsOptions = require('./config/corsOptions');
const router = require('./router/routes');

const server= http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:5173' } });

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors(corsOptions));
app.use('/api', router);


app.get('/', (req, res)=>{
    res.send('Hello World');
});
io.on('connection',(socket)=>{
    socket.on('join_document' , (data)=>{
        socket.join(data.id);
        console.log(`socket ${socket.id} joined document ${data.id}`);
        const number = io.sockets.adapter.rooms.get(data.id)
        console.log(`${number?.size} people`);
        })
    socket.on('send_changes' ,(data)=>{
        console.log('changes received');
        
        socket.to(data.id).emit('receive_messages',data.content);
    });   
    socket.on('leave_document', (data) => {
        socket.leave(data.id);
        console.log(`socket ${socket.id} left document ${data.id}`);
        const number = io.sockets.adapter.rooms.get(data.id)
        console.log(`${number?.size} people`);
    });    
})


const start = async () => {
        try{        
                await connectDB(process.env.URL)
                console.log('Connected to MongoDB');
                server.listen(4000, ()=>{ 
                    console.log('Servers is running on port 4000');
    })
    }
catch (err){
    console.log(err);
}
}
start();