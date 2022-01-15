const express = require( 'express' )
const router = express.Router()
const { ensureAuth, adminAuth } = require( '../middleware' )

const User = require( '../../models/User' )

router.get('/:id', ensureAuth, async (req, res) => {
  console.log("Getting Self User Profile for ", req.user )
  res.send( { _id: req.user._id, pseudo: req.user.firstName, picture: req.user.image, createdAt: req.user.createdAt } )
})


module.exports = router
