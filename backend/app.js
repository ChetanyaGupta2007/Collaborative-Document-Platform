require('dotenv').config();
const cors = require('cors')
const http = require('http');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const connectDB = require('./db/connect');
const corsOptions = require('./config/corsOptions');
const router = require('./router/routes');

const server= http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors(corsOptions));
app.use('/api', router);


app.get('/', (req, res)=>{
    res.send('Hello World');
});
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