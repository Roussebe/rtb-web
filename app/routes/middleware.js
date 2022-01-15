const User = require( "../models/User")

function ensureAuth( req, res, next ) {
    if( req.user ) {
        return next()
    } else {
        console.log( "Not Auth - redirect to /" )
        res.redirect('/')
    }
}

function ensureGuest( req, res, next ) {
   if ( !req.user ) { //}.isAuthenticated()) {
        return next();
    } else {
        console.log( "Not a guest - redirect to /dashboard" )
        res.redirect('/dashboard');
    }
}

async function adminAuth ( req, res, next ) {
    if( req.user ) {
        let user = await User.findOne( { _id: req.user._id } ).lean()
        req.auth_user = user
        //console.log( user )
        if( user.admin ) {
            return next()
        } else {
            return res.render('error/401')
        }
    } else {
        console.log( "Not Auth - redirect to /" )
        res.redirect('/')
    }
}


module.exports = { ensureAuth, ensureGuest, adminAuth }
