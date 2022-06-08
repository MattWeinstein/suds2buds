// Have # of bud lights show up in DOM 
// Show all other beers in DOM
// Host on Heroku

const fs = require('fs')
const http = require('http')
const bodyParser = require('body-parser')
const MongoClient =require('mongodb').MongoClient
const express = require('express')
const res = require('express/lib/response')
const app = express()
const PORT = 1111

let alcoholVolume = 0
let budLights = 0
let errorMessage

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

MongoClient.connect('mongodb+srv://mattw412:Weinstein88@suds2buds.pxon0ka.mongodb.net/?retryWrites=true&w=majority')
    .then(client => {
        console.log('connected to the database')
        const db = client.db('suds2buds') // which database will be be using? (name on MongoDB)
        const beerCollection = db.collection('beers') // Create collection on the database
       
        app.post('/beers',(req,res)=>{ // When a post request is made to the /beers endpoint, the following will happen
                if(!req.body.beerName|| !req.body.abv || !req.body.quantity){
                    errorMessage = 'You must fill out the whole form'
                    res.redirect('/') 
                } else if(req.body.abv<0 || req.body.abv>20){
                    errorMessage ='Please enter a reasonable alcohol percentage'
                    res.redirect('/') 
                } else if(req.body.quantity<0){
                    errorMessage = 'If you drank negative beers you are doing this wrong. Enter a positive # of beers'
                    res.redirect('/') 
                } else if(req.body.quantity>30){
                    errorMessage ='This calculator supports a maximum of one (1) Wade Boggs per entry. Enter how many beers you drank.'
                    res.redirect('/') 
                } else {
                    // Convert to bud lights
                    alcoholVolume += Number(req.body.abv)*parseInt(req.body.quantity)*parseInt(req.body.volume)
                    budLights = Math.round((alcoholVolume/(4.2*12))*100)/100
                    beerCollection.insertOne(req.body) // Insert the request into the database specified above (using .body from bodyparser)
                .then(result =>{  
                    res.redirect('/')   //We don't need to do anything so we redirec back to main page
                    errorMessage =''
                })
                .catch(error=>console.log(error)) //What if theres en error in accessing data from endpoint
                }

        })

        app.delete('/beers',(req,res)=>{
            beerCollection.find().toArray()
                .then(results =>{
                    for(let i =0;i<results.length;i++){
                        beerCollection.findOneAndDelete({})
                    }
                    alcoholVolume = 0
                    budLights = 0
                    console.log('hello')
                    res.json("hello")
                })
                .catch(error=>console.log(error)) //What if theres en error in accessing data from endpoint

            })

        app.get('/',function(req,res){ // If path = /, run the function
           console.log( beerCollection.find().toArray()) 
            beerCollection.find().toArray() // Insert the request into the database specified above (using .body from bodyparser)
            .then(result =>{  
                console.log(result)
                res.render('index.ejs',{beerCollection:result,budLights,errorMessage})  
            })
            .catch(error=>console.log(error)) //What if theres en error in accessing data from endpoint
        })

    })
    .catch(error=>{
        console.log(`We have an error: ${error}`)
    })

app.use(express.static(__dirname+'/public')) // All files in public fodler are being read


app.get('/beers',(req,res)=>{ //Make request to our own API
    res.json(beers)
})

app.listen(process.env.PORT || PORT,function(){
    console.log('Server is running')
})