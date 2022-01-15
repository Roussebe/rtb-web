const GoogleStrategy = require( 'passport-google-oauth20' ).Strategy
const User = require( '../models/User' )


module.exports = function(passport) {
    passport.use( new GoogleStrategy( {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log( "Passport - retrieve or create user" )

            console.log( "Looking for " + profile.id + " in database" )
            try {
                let user = await User.findOne( { googleId: profile.id } )
                if( ! user ) {
                    const newUser = {
                        googleId: profile.id,
                        displayName: profile.displayName,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        image: profile.photos[0].value,
                    }
                    user = await User.create( newUser )
                    console.log( "User created in DB", user )
                } else {
                    console.log( "User found in DB", user )
                }
                done( null, user )
            } catch( err ) {
                console.error( err )
            }
        }
    ))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    })

    passport.deserializeUser((id, done) => {
        User.findOne({ _id: id })
        .then( ( user ) => {
            if( user ) {
                done( null, user )
            }
        })
        .catch( console.error )
    })
}
