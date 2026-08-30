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
const jwt = require('jsonwebtoken');
const Document = require('./model/Document');
const UserData = require('./model/userData');

const server= http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:5173' } });
const documentPresence = {};

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors(corsOptions));
app.use('/api', router);


app.get('/', (req, res)=>{
    res.send('Hello World');
});
io.use((socket,next) =>{
    const token = socket.handshake.auth.token;
    try{
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        socket.data.userId =decoded.id;
        next();

    }
    catch(err){
        next(new Error("Authentication failed"));
    }
})
io.on('connection',(socket)=>{
    socket.on('join_document' , async (data)=>{
        
        const check = await Document.findById(data.id);
        if(check.owner.toString() !== socket.data.userId){
            console.log("wrong owner asking for doc");
            socket.emit("error", {
            message: "Wrong owner"
        });
            return;
        }
        socket.data.currentDocId = data.id;
        socket.join(data.id);
        console.log(`socket ${socket.id} joined document ${data.id}`);
        const number = io.sockets.adapter.rooms.get(data.id)
        console.log(`${number?.size} people`);
        const result = await UserData.findById(socket.data.userId);
        
        if (!documentPresence[data.id]) {
 documentPresence[data.id] = {};
}


    documentPresence[data.id][socket.id] = result.username;
    socket.data.username = result.username;
        socket.to(data.id).emit('user_joined', { username: result.username });
        socket.emit('current_viewers', {usernames : Object.values(documentPresence[data.id])});


        })
        socket.on('typing', (data) => {
    if (!socket.rooms.has(data.id)) {
        return;
    }

    socket.to(data.id).emit('typing', {
        username: socket.data.username
    });
});


    socket.on('send_changes' ,(data)=>{
        console.log('changes received');
        if (!socket.rooms.has(data.id)) {
        socket.emit("error", {
            message: "You have not joined this document"
        });
        return;
    }
        
        socket.to(data.id).emit('receive_messages',data.content);
    }); 
    socket.on('disconnect', () => {
    const docId = socket.data.currentDocId;

    if (docId && documentPresence[docId]) {
        const username = documentPresence[docId][socket.id];

        delete documentPresence[docId][socket.id];

        socket.to(docId).emit('user_left', {
            username: username
        });
    }
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