const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')


function initialize(passport, getUserByUsername, getUserById) {

    const authenticateUser = async (username, password, done) => {

        const user = await getUserByUsername(username) //Find us a user by email

        if (user == null) { //User will be undefined if cannot find, thus same value (triple equal will not work)
            return done(null, false, { message: 'No user with that username' })
        }
        try {
            // await bcrypt.compare(password, user.password)
            if (await bcrypt.compare(password, user.password)) { // Compares password entered to password on the user object(found above)
                return done(null, user)
            } else {
                return done(null, false, { message: 'Password incorrect' })
            }
        } catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy(authenticateUser))
    // Local Strategy has builtin username, password. Will get from form and "name" attribute must match
    passport.serializeUser((user, done) => {
        return done(null, user.id)
    })  //Null for error
    passport.deserializeUser(async (id, done) => {
        return done(null, await getUserById(id))
    })
}

module.exports = initialize //Lets other files use the initialize function
