const express = require( 'express' )
const router = express.Router()
const { ensureAuth, adminAuth } = require( '../middleware' )

const Habit = require( '../../models/Habit' )
const User = require( '../../models/User' )
const Ritual = require( '../../models/Ritual' )


router.get('/', ensureAuth, async (req, res) => {
  console.log("Getting rituals for ", req.user )
  const rituals = await Ritual.find( { user: req.user._id } ).lean()
  res.send( { rituals } )
})

router.post('/upd_habit/:rid', ensureAuth, async (req, res) => {
    console.log( "Adding habit(s) to ritual " + req.params.rid )
    let user = await User.findOne( { _id: req.user._id } ).lean()
    let ritual = await Ritual.findOne( { _id: req.params.rid } ).lean()
    let habits = await Habit.find( {} ).lean()

    if( !user || !ritual || !habits )
        return res.status( 404 ).send() // res.render('error/404')

    if( ! ritual.user.equals( req.user._id ) ) return res.status( 401 ).send() //res.render( 'error/401' )

    console.log( req.body )

    if( !req.body.data ) return res.status( 400 ).send()

    let newSetting = req.body.data.map( (data) => {
      let habit = habits.find( h => h._id.equals( data._id ) )
      if( habit )
        return { _id: habit._id, title: habit.title }
    })

    console.log( "New habits: ", newSetting )

    ritual.habits = newSetting

    await Ritual.updateOne( { _id: ritual._id }, ritual )

    res.send( { ritual } )
})

router.post('/tick_habit', ensureAuth, async(req, res) => {
  console.log( "New today's habit ", req.body )
  try {
    const params = req.body.params
    if( !params ) return res.sendStatus( 404 )

    const today = new Date().toLocaleDateString()
    console.log( "Today : " + today )

    const user = await User.findOne( { _id: req.user._id }).lean()
    console.log( "User", user )
    if( !user ) return res.sendStatus( 404 ) //render('error/404')

    const ritual = await Ritual.findOne( { _id: params.ritual._id } ).lean()
    console.log( "Ritual", ritual )

    if( ! user._id.equals( ritual.user ) ) res.sendStatus( 401 ) // res.redirect('/users')

    if( !ritual.history ) {
      console.log( "Create ritual history" )

      ritual.history = {
        lastUpdateDate: today,
        habits: {}
      }
    } else {
      const hist_len = 10
      let allow_date = []
      let today = new Date()

      for( let i = 0; i < hist_len ; i++ ) {
        allow_date.push( today.toLocaleDateString() )
        today.setDate( today.getDate() - 1 )
      }

      console.log( "Allow: " , allow_date )
      for( key of Object.keys(ritual.history.habits ) ) {
        if( ! allow_date.find( (ad) => ad == key ) ) {
          console.log( "Remove " + key )
          delete ritual.history.habits[ key ]
        }
      }
    }

    console.log( "Ritual history", ritual.history )
    let achievements = ritual.history.habits[ today ]
    if( !achievements ) {
      achievements = [ ]
    }

    if( ! achievements.find( (a) => { return a.habit == params.habit._id })) {
      achievements.push( { habit: params.habit._id } )
      ritual.history.habits[ today ] = achievements
      ritual.history.lastUpdateDate = today
      console.log( "New ritual ", ritual )
      console.log( "Ritual history", ritual.history.habits )
      await Ritual.updateOne( {_id: ritual._id }, ritual )
    } else {
      console.log( "Don't add habit for today... TODO: avoid double click on UI :-)")
    }

    res.send( { ritual } )
  } catch( err ) {
    console.error( err )
    return res.sendStatus( 500 )
  }
})


module.exports = router
