require("dotenv").config();
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const app = express();

app.use(cors())
app.use(express.json());
// app.use(cookieParser());

// NL9CDFitG6LTvPKc


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process}@cluster0.tui29.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(res,req)=>{
    res.send('this is task management website');
});

app.listen(port,(req,res)=>{
    console.log(`this site is running from : ${port}`);
});