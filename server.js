const fs = require('fs')
const http = require('http')
const bodyParser = require('body-parser')
const MongoClient =require('mongodb').MongoClient
const express = require('express')
const app = express()
const PORT = 1111

MongoClient.connect('mongodb+srv://mattw412:Weinstein88@suds2buds.pxon0ka.mongodb.net/?retryWrites=true&w=majority')
    .then(client => {
        console.log('connected to the database')
        const db = client.db('suds2buds') // which database will be be using? (name on MongoDB)
        const beerCollection = db.collection('beers') // Create collection on the database

        app.post('/beers',(req,res)=>{ // When a post request is made to the /beers endpoint, the following will happen
            beerCollection.insertOne(req.body) // Insert the request into the database specified above (using .body from bodyparser)
            .then(result =>{
                console.log(result) // What to do with result now?
            })
            .catch(error=>console.log(error)) //What if theres en error in accessing data from endpoint
        })
    })
    .catch(error=>{
        console.log(`We have an error: ${error}`)
    })


const beers ={
    'budLightPlatinum':{
    'name':'Bud Light Platiunum',
    'ABV' : '6'
    },
    'fiddleheadIPA':{
        'name':'Fiddlehead IPA',
        'ABV' : '6.2'
    },
    'budLight':{
        'name':'Bud Light',
        'ABV' : '4.2'
    }
}

app.use(express.static(__dirname+'/public'))

app.get('/',function(req,res){ // If path = /, run the function
    res.sendFile(__dirname +'/index.html') // The response of the function is to sendfile index.html
})

app.get('/beer',(req,res)=>{ //Make request to out own API
    res.json(beers)
})

app.listen(PORT,function(){
    console.log('Server is running')
    console.log(beers)
})