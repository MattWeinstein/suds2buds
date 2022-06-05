// Have # of bud lights show up in DOM 
// Show all other beers in DOM
// Host on Heroku

const fs = require('fs')
const http = require('http')
const bodyParser = require('body-parser')
const MongoClient =require('mongodb').MongoClient
const express = require('express')
const app = express()
const PORT = 1111

let alcoholVolume = 0
let budLights = 0

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

MongoClient.connect('mongodb+srv://mattw412:Weinstein88@suds2buds.pxon0ka.mongodb.net/?retryWrites=true&w=majority')
    .then(client => {
        console.log('connected to the database')
        const db = client.db('suds2buds') // which database will be be using? (name on MongoDB)
        const beerCollection = db.collection('beers') // Create collection on the database
       
        app.post('/beers',(req,res)=>{ // When a post request is made to the /beers endpoint, the following will happen
                console.log("get request heard")
                console.log(req.body)
                if(!req.body.beerName){
                    console.log('Please enter a name')
                    res.redirect('/') 
                }else if(req.body.abv<0 || req.body.abv>20){
                    console.log('Please enter a reasonable alcohol percentage')
                    res.redirect('/') 
                } else if(req.body.quanity<0){
                    console.log('If you drank negative beers you are doing this wrong. Enter a positive # of beers')
                    res.redirect('/') 
                } else if(req.body.quanity>30){
                    console.log('This calculator supports a maximum of one (1) Wade Boggs per entry. Enter how many beers you drank.')
                    res.redirect('/') 
                } else {
                alcoholVolume += Number(req.body.abv)*parseInt(req.body.quanity)*parseInt(req.body.volume)
                console.log(alcoholVolume)
                budLights = Math.round((alcoholVolume/(4.2*12))*100)/100
                console.log(Math.round((alcoholVolume/(4.2*12))*100))
                beerCollection.insertOne(req.body) // Insert the request into the database specified above (using .body from bodyparser)
                .then(result =>{  
                    console.log(budLights) //Do other stuff w data
                    res.redirect('/')   //We don't need to do anything so we redirec back to main page
                })
                .catch(error=>console.log(error)) //What if theres en error in accessing data from endpoint
                }

        })
        app.delete('/beers',(req,res)=>{
            beerCollection.find().toArray()
                .then(results =>{
                    for(let i =0;i<results.length;i++){
                        beerCollection.findOneAndDelete({})
                        console.log(results)
                    }
                    console.log(results.length)

                    alcoholVolume = 0
                    budLights = 0
                })

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


app.use(express.static(__dirname+'/public')) // All files in public fodler are being read

app.get('/',function(req,res){ // If path = /, run the function
    res.sendFile(__dirname +'/index.html') // The response of the function is to sendfile index.html
})

app.get('/beers',(req,res)=>{ //Make request to our own API
    res.json(beers)
})

app.listen(PORT,function(){
    console.log('Server is running')
})