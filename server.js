// Have # of bud lights show up in DOM 
// Show all other beers in DOM
// Host on Heroku
require('dotenv').config()

const http = require('http')
const ip = require('ip')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const express = require('express')
const bcrypt = require('bcrypt')
const res = require('express/lib/response')
const passport = require('passport')
const flash = require('express-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const methodOverride = require('method-override')
const { userInfo } = require('os')
const app = express()
const port = 1111

let users = []

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    username => users.find(user => user.username === username), // getUserByEmail function
    id => users.find(user => user.id === id) // getUserById function
)

let budLights = 0
let totalAlcoholContent = 0
let errorMessage
let userEmail
const userArr = []
let userBeerCollection = []
let dbConnectionStr = process.env.DB_STRING
let sessionSecret = process.env.SESSION_SECRET
const oneDay = 24 * 1000 * 60 * 60

app.set('view engine', 'ejs')
app.use(express.json()) // Lets us look into request package
app.use(express.urlencoded({ extended: true })) // Lets us look into request package
app.use(express.static(__dirname + '/public')) // All files in public folder are being read
app.use(flash())
app.use(cookieParser())
app.use(session({
    secret: sessionSecret, //Should be set to random numbers to make more secret
    cookie: { maxAge: oneDay }, //Cookie expiry time
    saveUninitialized: true, //Do you want to save an empty value in the session if there is nothing saved
    resave: false //Should we resave session variables if nothing has changed? True may result in two parallel requests to server
}))
app.use(passport.initialize())//Sets up basics
app.use(passport.session()) //Save variables to be able to use through entire session
app.use(methodOverride('_method')) //Override form method - post -> delete


//======== DATABASE INTERACTION START ========//
MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log('connected to the database')
        app.listen(process.env.PORT || port, function () {
            console.log('Server is running')
        })
        const db = client.db('suds2buds') // which database will be be using? (name on MongoDB)
        const beerCollection = db.collection('beers') // Create collection on the database

        app.post('/beers', (req, res) => { // When a post request is made to the /beers endpoint on form submit, the following will happen

            // ==== Instatiates user object with email, beers, and ip address. ====//
            userEmail = {
                "username": req.body.fullName,
                "beers": 0,
                ip_address: ip.address()
            }
            console.log(userEmail.username)

            if (userArr.length === 0) {     // Edge case if first entry
                userArr.push(userEmail)
            } else {
                for (let i = 0; i < userArr.length; i++) { // Adds user if it does not exist
                    if (userArr[i].username === req.body.fullName) {
                        break  // Breaks for loop if found
                    }
                    if (i === userArr.length - 1) { // If for loop ends without finding an email, add user
                        userArr.push(userEmail)
                    }
                }
            }
            console.log('hello')

            // ==== VALIDATE ALL FORM INPUTS ==== //
            if (!req.body.beerName || !req.body.abv || !req.body.quantity) {
                errorMessage = 'You must fill out the whole form'
                res.redirect('/')
            } else if (req.body.abv < 0 || req.body.abv > 20) {
                errorMessage = 'Please enter a reasonable alcohol percentage'
                res.redirect('/')
            } else if (req.body.quantity < 0) {
                errorMessage = 'If you drank negative beers you are doing this wrong. Enter a positive # of beers'
                res.redirect('/')
            } else if (req.body.quantity > 30) {
                errorMessage = 'This calculator supports a maximum of one (1) Wade Boggs per entry. Enter how many beers you drank.'
                res.redirect('/')
            } else { // Form inputs correct -> do the following
                // Convert to bud lights

                // beerCollection.insertOne(req.body) // Insert the request into the database specified above (using .body from bodyparser)
                beerCollection.insertOne({
                    username: req.user.username,
                    beerName: req.body.beerName,
                    quantity: req.body.quantity,
                    abv: req.body.abv,
                    volume: req.body.volume
                })
                    .then(result => {
                        console.log('beercollectionstarted')
                        beerCollection.find({ username: req.user.username }).toArray() //Once added, we find all the database entries with that email
                            .then(result => {
                                userBeerCollection = result
                                console.log(userBeerCollection)
                                for (let i = 0; i < result.length; i++) { // Perform the calculation
                                    let selectedInput = result[i]
                                    totalAlcoholContent += Math.round(Number(selectedInput.abv) * parseInt(selectedInput.quantity) * parseInt(selectedInput.volume))
                                }
                                budLights = Math.round((totalAlcoholContent / (4.2 * 12)) * 100) / 100
                                totalAlcoholContent = 0
                                userEmail.beers = budLights

                            })
                        res.redirect('/')   //We don't need to do anything so we redirect it back to main page
                        errorMessage = ''
                    })
                    .catch(error => console.log(error)) //What if theres en error in accessing data from endpoint
            }
        })

        app.delete('/beers', (req, res) => {
            beerCollection.deleteMany({ fullName: userEmail.username }) // Delete all collections in the DB for that user
                .then(results => { // Manual reset of all variables
                    totalAlcoholContent = 0
                    budLights = 0
                    // userObj[userEmail] = 0
                    userBeerCollection = [] // EJS to read nothing 
                    userEmail = {}
                    errorMessage = ''
                    res.json("hello") // Sends response to client side JS so promise can be resolved.
                })
                .catch(error => console.log(error)) //What if theres en error in accessing data from endpoint

        })

        app.get('/', checkAuthenticated, (req, res) => { // If path = /, run the function
            console.log('Inside get / fn')
            beerCollection.find().toArray() // Insert the request into the database specified above (using .body from bodyparser)
                .then(result => {
                    // console.log(userEmail.keys(email))
                    let userBudLight // userEmail.beers
                    let userName
                    if (userEmail) {
                        userName = req.user.username
                        userBudLight = userEmail.beers
                    } else {
                        userName = ''
                        userBudLight = '0'
                    }
                    userName = req.user.name
                    res.render('index.ejs', { userBeerCollection, userBudLight, errorMessage, userName })
                })
                .catch(error => console.log(error)) //What if theres en error in accessing data from endpoint
        })

    })
    .catch(error => {
        console.log(`We have an error: ${error}`)
    })
//======== DATABASE INTERACTION END ========//

// Gets called by FailureRedirect
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

// Post on /login route called on form submit
app.post('/login', checkNotAuthenticated, passport.authenticate('local', { //Passport middleware to handle all redirects upon login
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true //Displays flash message to user (whatever is set in the error messages)
}))
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            username: req.body.username,
            password: hashedPassword,
            beers: 0
        })

        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users)
})

app.get('/beers', (req, res) => { //Make request to our own API
    res.json(beers)
})


app.delete('/logout', (req, res) => {
    req.logOut((err) => {
        if (err) { return next(err) }
    })
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) { //If you're not authenticated, you get redirected to login 
    if (req.isAuthenticated()) { //Returns T/F
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {//If you are authenticated, you can only access the login and register pages
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}
