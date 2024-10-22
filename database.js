const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { jwtDecode } = require('jwt-decode');
const rateLimitMiddleware = require("./rateLimiter");

// var moment = require('moment'); // require
// let momentOne = moment();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set ('trust proxy' , 1)

const swaggerUi = require ("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MyVMS API",
            version: "1.0.0",
        },
    },
    apis: ["./routes/*.js"],
};
const swaggerSpec = swaggerJsdoc (options);
app.use("/api-docs", swaggerUi.serve,swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
 })

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//const credentials = './X509-cert-6489261263702062411.pem'
const uri = "mongodb+srv://nicolas:12345@agrivoltaic.i47xp.mongodb.net/?retryWrites=true&w=majority&appName=Agrivoltaic";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//function for API
async function solarData (temp1, voltage1, temp2, voltage2){

    await client.db("solar_panel").collection("data").insertOne({
        solar1: {temp: temp1, voltage: voltage1},
        solar2: {temp: temp2, voltage: voltage2}
    })

    return "Data Inserted"
}

//API calls
app.post('/postData' , async (req, res) => {  //register visitor
    res.send(await solarData(req.body.temp1, req.body.voltage1, req.body.temp2, req.body.voltage2))
})
