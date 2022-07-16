const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')


function initialize (passport,getUserByEmail){

    const authenticateUser = async (email,password,done) => {
        const user = getUserByEmail(email) //Find us a user by email or return null
        if(user === null){
            return done(null,false,{message: 'No user with that email'})
        } 
        try{
            if (await bcrypt.compare(password,user.password)){
                console.log('sucess')
                return done(null, user)
            }else{
                console.log('wrong')

                return done(null,false,{message: 'Password incorrect'})
            }
        } catch(e){
            return done(e)
        }
    }

    passport.use(new localStrategy({usernameField: 'email'},authenticateUser))
    passport.serializeUser((user,done) => {  })
    passport.deserializeUser((id,done) => {  })
}

module.exports = initialize //Lets other files use the initialize function