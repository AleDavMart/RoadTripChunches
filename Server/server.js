//imports
// require('dotenv').config()
const dotenv = require("dotenv"); //why is this better?
const express = require ('express');
const hbs = require ('Express-Handlebars'); 
const PORT = process.env.PORT || 3001; //if no env variable is set then default to 3001
const cors = require ('cors');
const path = require ('path');
const morgan = require ('morgan');
const {uuid} = require ("uuidv4");// for uniqure identifiers
const { Client, Config, CheckoutAPI} = require ("@adyen/api-library");
const { get, request } = require("http");
const app = express();

//middleware 
app.use(cors());

//setting up morgan for request logging
app.use(morgan("dev"));

//Parsing JSON bodies
app.use(express.json());

//Parsing URL encoded bodies 
app.use(express.urlencoded({extended: true})); 

//Serve client from build folder
app.use(express.static(path.join(__dirname, "/client")));

//Enabling environment variables by parsing the .env file
dotenv.config({
    path: './.env'
});

const config = new Config(); //new instance of config object 
config.apiKey= process.env.API_KEY; // passing our API Key to config object
const client = new Client ({config});
client.setEnvironment("TEST"); //setting the environment to TEST
const checkout = new CheckoutAPI(client); //creating a new instance of checkout and passing in our client




app.engine(
    "handlebars",
    hbs({
        defaultLayout: "main",
        layoutsDir: __dirname + "/views/layouts",
        partialsDir: __dirname + "views/partials"
    })
)

app.set("view engine", "handlebars"); 

//temporary storage before moving this data to a database!!!!
const paymentDataStore = {}; 

//Getting Payment Methods 
app.get('/', async (req,res) =>{
    try {
        const response = await checkout.paymentMethods({
            channel: "Web",
            merchantAccount: process.env.MERCHANT_ACCOUNT //passing in our merchant account
        });
        res.render("payment", {
            clientKey: proces.env.CLIENT_KEY,  //passing in our client key
            response: JSON.stringify(response)
        });
    } catch (error) {
       console.error(error); 
    }
})





//set up app to listen on set PORT
app.listen( PORT, () => {
    console.log(`Your server is now listening to port ${PORT}`)
})