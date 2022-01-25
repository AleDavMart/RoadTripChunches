//imports
require('dotenv').config()
const express = require ('express');
const app = express();
const PORT = process.env.PORT || 3001; //if no env variable is set then default to 3001
const cors = require ('cors');

//middleware 
app.use(cors());


//set up app to listen on set PORT
app.listen( PORT, () => {
    console.log(`Your server is now listening to port ${PORT}`)
})