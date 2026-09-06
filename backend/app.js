require('dotenv').config();
const cors = require('cors')
const http = require('http');
const { initIO } = require('./socket/io');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const connectDB = require('./db/connect');
const corsOptions = require('./config/corsOptions');
const router = require('./router/routes');
const jwt = require('jsonwebtoken');
const Document = require('./model/Document');
const UserData = require('./model/userData');
const {HasDocumentAccess}= require('./auth/DocumentAccess');
const PORT = process.env.PORT || 4000;


const server= http.createServer(app);
const io = initIO(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors(corsOptions));
app.use('/api', router);


app.get('/', (req, res)=>{
    res.send('Hello World');
});

const {createAdapter} = require('@socket.io/redis-adapter');
const { createClient}= require('redis');
const pubClient = createClient({url: "redis://localhost:6379"});
const subClient = pubClient.duplicate();
const redisClient = pubClient.duplicate();
pubClient.on('error', (err) => {
  console.error('Redis Pub Client Error:', err);
});

subClient.on('error', (err) => {
  console.error('Redis Sub Client Error:', err);
});
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});
async function connectRedis() {
  try {
    await Promise.all([
      pubClient.connect(),
      subClient.connect(),
      redisClient.connect()

    ]);
    console.log('Connected to Redis server');
    io.adapter(createAdapter(pubClient, subClient));
  } catch (err) {
    console.error('Error connecting to Redis server:', err);
    throw err;
  }
}

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
        
        
    const allowed = await HasDocumentAccess(
        socket.data.userId,
        data.id,
        "viewer"
    );

    if (!allowed) {
        socket.emit("error", {
            message: "You don't have access to this document"
        });
        return;
    }
        socket.data.currentDocId = data.id;
        socket.join(data.id);
        console.log(`socket ${socket.id} joined document ${data.id}`);
        const number = io.sockets.adapter.rooms.get(data.id)
        console.log(`${number?.size} people`);
        const result = await UserData.findById(socket.data.userId);
        const users = await redisClient.hGetAll(`documentPresence:${data.id}`);
        
        

    await redisClient.hSet(
    `documentPresence:${data.id}`,
    socket.id,
    result.username
);
   
        socket.to(data.id).emit('user_joined', { username: result.username });
        socket.emit('current_viewers', {usernames : Object.values(users)});
        })
        socket.on('typing', (data) => {
    if (!socket.rooms.has(data.id)) {
        return;
    }

    socket.to(data.id).emit('typing', {
        username: socket.data.username
    });
});


    socket.on('send_changes' ,async (data)=>{
        console.log('changes received');
        const allowed = await HasDocumentAccess(
        socket.data.userId,
        data.id,
        "editor"
    );

    if (!allowed) {
        socket.emit("error", {
            message: "You need editor permission"
        });
        return;}
        if (!socket.rooms.has(data.id)) {
        socket.emit("error", {
            message: "You have not joined this document"
        });
        return;
    }
        
        socket.to(data.id).emit('receive_messages',data.content);
    }); 
    
    socket.on('disconnect', async () => {
    const docId = socket.data.currentDocId;
        const users = await redisClient.hGetAll(`documentPresence:${docId}`);

    if (docId && users[socket.id]) {
        const username = await redisClient.hGet(
    `documentPresence:${docId}`,
    socket.id
);
        
    await redisClient.hDel(
        `documentPresence:${docId}`,
        socket.id
    );

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
                await connectRedis();
                server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
    }
catch (err){
    console.log(err);
}
}
start();