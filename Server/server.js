//imports
// require('dotenv').config()
const dotenv = require("dotenv"); //why is this better?
const express = require ('express');
const hbs = require ('express-handlebars'); 
const PORT = process.env.PORT || 3001; //if no env variable is set then default to 3001
const cors = require ('cors');
const path = require ('path');
const morgan = require ('morgan');
const {uuid} = require ('uuidv4');
const app = express();

//setting up morgan for request logging
app.use(morgan("dev"));

//Parsing JSON bodies
app.use(exppress.json());

//Parsing URL encoded bodies 
app.use(express.urlencoded({extended: true})); 

//Serve client from build folder
app.use(express.static(path.join(__dirname, "/client")));

//Enabling environment variables by parsing the .env file
dotenv.config({
    path: './.env'
});



//middleware 
app.use(cors());


//set up app to listen on set PORT
app.listen( PORT, () => {
    console.log(`Your server is now listening to port ${PORT}`)
})