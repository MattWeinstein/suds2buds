// Have # of bud lights show up in DOM 
// Show all other beers in DOM
// Host on Heroku

const fs = require('fs')
const http = require('http')
const ip =require('ip')
const bodyParser = require('body-parser')
const MongoClient =require('mongodb').MongoClient
const express = require('express')
const res = require('express/lib/response')
const { userInfo } = require('os')
const app = express()
const port = 1111
require('dotenv').config()
console.log(process.env.DB_STRING)


let budLights = 0
let totalAlcoholContent = 0
let errorMessage
let userEmail
const userArr =[]
let userBeerCollection=[]
let userIndex
let dbConnectionStr = process.env.DB_STRING


app.set('view engine', 'ejs')
 
app.use(express.json()) // Lets us look into request package
app.use(express.urlencoded({ extended: true })) // Lets us look into request package

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log('connected to the database')
        const db = client.db('suds2buds') // which database will be be using? (name on MongoDB)
        const beerCollection = db.collection('beers') // Create collection on the database
       
        app.post('/beers',(req,res)=>{ // When a post request is made to the /beers endpoint on form submit, the following will happen
                
            console.log(userEmail)

                // ==== Instatiates user object with email, beers, and ip address. ====//
                userEmail = {
                    "username":req.body.fullName,
                    "beers":0,
                    ip_address:ip.address()
                }
                console.log(userEmail.username)

                if(userArr.length===0){     // Edge case if first entry
                    userArr.push(userEmail)
                }else{
                for(let i=0;i<userArr.length;i++){ // Adds user if it does not exist
                    if(userArr[i].username===req.body.fullName){
                       break  // Breaks for loop if found
                    }
                    if(i===userArr.length-1){ // If for loop ends without finding an email, add user
                        userArr.push(userEmail)
                    }
                }}
                console.log('hello')

                // ==== VALIDATE ALL FORM INPUTS ==== //
                if(!req.body.beerName|| !req.body.abv || !req.body.quantity || !req.body.fullName){
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
                } else { // Form inputs correct -> do the following
                    // Convert to bud lights
                    
                beerCollection.insertOne(req.body) // Insert the request into the database specified above (using .body from bodyparser)
                .then(result =>{  
                    console.log('beercollectionstarted')
                    beerCollection.find({fullName:`${userEmail.username}`}).toArray() //Once added, we find all the database entries with that email
                        .then(result =>{  
                            userBeerCollection=result
                            console.log(userBeerCollection)
                            for(let i =0;i<result.length;i++){ // Perform the calculation
                                let selectedInput = result[i]
                                totalAlcoholContent += Math.round(Number(selectedInput.abv)*parseInt(selectedInput.quantity)*parseInt(selectedInput.volume))
                            }
                            budLights = Math.round((totalAlcoholContent/(4.2*12))*100)/100
                            totalAlcoholContent=0
                            userEmail.beers=budLights

                        })
                    res.redirect('/')   //We don't need to do anything so we redirect it back to main page
                    errorMessage =''
                })
                .catch(error=>console.log(error)) //What if theres en error in accessing data from endpoint
                }
        })

        app.delete('/beers',(req,res)=>{
            beerCollection.deleteMany({fullName:userEmail.username}) // Delete all collections in the DB for that user
               .then(results =>{ // Manual reset of all variables
                    totalAlcoholContent = 0 
                    budLights = 0
                    // userObj[userEmail] = 0
                    userBeerCollection =[] // EJS to read nothing 
                    userEmail={}
                    console.log('hello')
                    res.json("hello") // Sends response to client side JS so promise can be resolved.
                })
                .catch(error=>console.log(error)) //What if theres en error in accessing data from endpoint

            })

        app.get('/',function(req,res){ // If path = /, run the function
            beerCollection.find().toArray() // Insert the request into the database specified above (using .body from bodyparser)
            .then(result =>{  
                // console.log(userEmail.keys(email))
                let userBudLight // userEmail.beers
                let userName
                if(userEmail){
                    userName=userEmail.username
                    userBudLight=userEmail.beers
                }else{
                    userName=''
                    userBudLight='0' 
                }
                res.render('index.ejs',{userBeerCollection,userBudLight,errorMessage,userName})  
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

app.listen(process.env.PORT || port,function(){
    console.log('Server is running')
})