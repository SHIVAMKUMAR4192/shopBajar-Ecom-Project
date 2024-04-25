const app = require('./app')
 const mongoose = require('mongoose');

// const dotenv = require('dotenv');
require('dotenv').config();


const PORT = process.env.PORT || 8001;
const mode = process.env.NODE_ENV || 'development';
const DB_LOCAL_URI='mongodb://localhost:27017/shopbajar'

mongoose.connect(DB_LOCAL_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useFindAndModify:false,
        // useCreateIndex:true
    })
    .then(() => {
        console.log("DB Connected");
    })
    .catch((err) => {
        console.log("OH NO ERROR!!!");
        console.log(err);
    });


//  dotenv.config({path: 'backend/config/config.env'})
const server = app.listen(PORT, () =>{
    console.log(`server started on PORT : ${PORT} in ${mode} mode.`)
})

//Handled Unhandled Promise rejection
process.on('unhandledRejection', err =>{
    console.log(`ERROR: ${err.message}`);
    console.log(`Shutting down the server due to unhandled rejection`);
    server.close();
    process.exit(1);
})
