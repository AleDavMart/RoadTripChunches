//imports
// require('dotenv').config()
const dotenv = require("dotenv"); //why is this better?
const express = require ('express');
// const hbs = require ("express-handlebars"); 
const PORT = process.env.PORT || 8080; //if no env variable is set then default to 3001
const cors = require ('cors');
const pool = require("./db");//using pool allows for queries in postgress
const path = require ('path');
const morgan = require ('morgan');
const {uuid} = require ("uuidv4");// for uniqure identifiers
const { Client, Config, CheckoutAPI} = require ("@adyen/api-library");
const { get, request } = require("http");
const { response } = require("express");
const { CashHandlingDevice } = require("@adyen/api-library/lib/src/typings/terminal/cashHandlingDevice");
const { rmSync } = require("fs");
const { SuspendAccountHolderResponse } = require("@adyen/api-library/lib/src/typings/platformsAccount/suspendAccountHolderResponse");
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




// app.engine(
//     "handlebars",
//     hbs({
//         defaultLayout: "main",
//         layoutsDir: __dirname + "/views/layouts",
//         partialsDir: __dirname + "views/partials"
//     })
// )

// app.set("view engine", "handlebars"); 

//temporary storage before moving this data to a database!!!!
const paymentDataStore = {}; 

// -------------------------------- ADYEN PAYMENT API ROUTES ---------------------------------//
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

//Initiating a payment
app.post('/api/initiatePayment', async function (req, res){
    try {
        const orderRef = uuid(); //generating a unique order reference 

        const response = await checkout.payments ({
            amount: { currency: "EUR", value: 10000},
            reference: orderRef,
            merchantAccount: process.env.MERCHANT_ACCOUNT,
            channel: "Web",
            additionalData:{
                allow3DS2: true
            },
            returnUrl:`http://localhost:3001/api/handleShopperRedirect?orderRef=${orderRef}`,
            browserInfo: req.body.browserInfo,
            paymentMethod: req.body.paymentMethod 
        })

        let resultCode = response.resultCode;
        let action = null; //some payments do not require additional action

        if ( response.action){ //if there is an action needed this will be reflected back to the client here 
            action = response.action;
            paymentDataStore[orderRef]= action.paymentData;
        }

        res.json({resultCode, action}); //sending back JSON to client

    } catch (error) {
        console.error(error);
    }
})

//Handle Shopper Redirect 
app.all('/api/handlesho', async (req,res)=>{
    const payload = {};
    payload["details"] = req.method === "GET" ? req.query : req.body; // creating a payload to submit payment details

    const orderRef = req.query.orderRef;
    payload["paymentData"] = paymentDataStore[orderRef]; //retrieved the payment data from our store
    delete paymentDataStore[orderRef]; 

    try {
        const response = await checkout.paymentsDetails(payload);

        switch (response.resultCode) {
            case "Authorised":
                res.redirect("/success");
                break;
            case "Pending":
            case "Received":
                res.redirect("/pending");
                break;  
            case "Refused":
                res.redirect("/failed");
                break;   
            default:
                res.redirect("/error");
                break;
        }
       
    } catch (error) {
        console.error(error);
    }

})
 
app.get('/success', (req,res)=>{
    res.render("success");
})

app.get('/pending', (req,res)=>{
    res.render("pending");
})

app.get('/error', (req,res)=>{
    res.render("error");
})

app.get('/failed', (req,res)=>{
    res.render("failed");
})

//Handle submitting addtional details 
app.post('/api/submitAdditionalDetails', async (req, res) =>{
  const payload = {};

  payload["details"] = req.body.details;
  payload["paymentData"] = req.body.paymentData;

  try {
     const response = await checkout.paymentsDetails(payload);

     let resultCode = response.resultCode;
     let action = response.action || null;
     
     res.json({ action, resultCode});
    
  } catch (error) {
      console.error(error);
  }
})

//-------------- DATABASE API ROUTES --------// 

//GET ALL PRODUCTS
app.get('/products', async(res, req) =>{
    try {
        const allProducts = await pool.query("SELECT * FROM products"); 
        res.json({
            status: 'success',
            data: {
            
            }
        });

    } catch (error) {
        console.error(error);
    }
});

//GET A SPECIFIC PRODUCT
app.get('/products/id', async(req,res)=>{
    try {
        const {id} = req.params; // using the PK id to select a specific product
        const product = await pool.query("SELECT * FROM products WHERE product_id = $1", [id]); //$1 can be anything since its dynamic and we are specifying in []

        res.json(product.rows[0]); //getting only the first row
    } catch (error) {
        console.error(error); 
    }
})

//set up app to listen on set PORT
app.listen( PORT, () => {
    console.log(`Your server is now listening to port ${PORT}`)
})