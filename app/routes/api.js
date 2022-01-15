const express = require( 'express' )
const router = express.Router()

const { ensureAuth, adminAuth } = require( './middleware' )
const User = require( '../models/User' )


async function getUser( user_id, res ) {
  try {
    const user = await User.findOne( { _id: user_id } ).lean()

    console.log( "User", user )

    const today = new Date().toLocaleDateString()
    console.log( "Today : " + today )

    let obj = {
      id: user._id,
      pseudo: user.firstName,
      picture: user.image,
      createdAt: user.createdAt,
    }
    console.log( obj )
    res.send( obj )
  } catch( err ) {
    console.error( err )
    res.status( "500" ).send()
  }
}

function getBasicInfo( req, res ) {
  res.send( { id: req.user.id, pseudo: req.user.firstName, picture: req.user.image, createdAt: req.user.createdAt } )
}

router.get('/user', ensureAuth, async (req, res) => {
  console.log("Getting basic profile for ", req.user )
  getUser( req.user._id, res )
})

router.get('/user/:id', ensureAuth, async (req, res) => {
  console.log( "User " + req.user._id + " request data from " + req.params.id )
  getUser( req.params.id, res )
})


router.get('/user/register', ensureAuth, async (req, res) => {
  res.send({})
})

router.get('/:id', ensureAuth, async (req, res) => {
  try {
    console.log( "GET User with id " + req.params.id )
    let habit = await Habit.findOne( {_id: req.params.id} ).lean()

    if (!habit) {
      return res.render('error/404')
    }

    res.render('habits/show', { habit } )
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        let user = await User.findOne( { _id: req.user._id } ).lean()
        if( !user.admin ) return res.render('error/401')

        const habit = await Habit.findOne( { _id: req.params.id }).lean()
        if( !habit ) return res.render('error/404')

        console.log( habit )

        res.render('habits/edit', {habit} )
    } catch( err ) {
        console.error( err )
        return res.render('error/500')
    }
})

router.post('/', adminAuth, async (req, res) => {
  console.log( "POST REQUEST" )
    try {
        req.body.user = req.user._id
        await Habit.create(req.body)
        res.redirect('/habits')
    } catch( err ) {
        console.error(err)
        res.render('error/500')
    }
})



router.put('/:id', ensureAuth, async (req, res) => {
    let user = await User.findOne( { _id: req.user._id } ).lean()
    let upd_habit = await Habit.findOne( { _id: req.params.id } ).lean()

    if( !user || !upd_habit ) return res.render('error/404')

    console.log( upd_habit )
    console.log( req.body )

    if( upd_habit.user != req.user._id && !user.admin ) res.redirect('/habit')  //For the moment, can only update yourself
    else  {
        upd_habit.title = req.body.title
        upd_habit.status = req.body.status
        upd_habit.body = req.body.body

        await Habit.update( {_id: req.params.id}, upd_habit )
        res.redirect('/habits')
    }
})

module.exports = router
