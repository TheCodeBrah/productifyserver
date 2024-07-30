const express = require("express");
const session = require('express-session')
const mongoose = require("mongoose");
const cors = require('cors')
const router = express.Router()
const User = require("../Schemas/userSchema.js");
const passport = require("passport");
const dotenv = require('dotenv')
dotenv.config()
const {OAuth2Client} = require('google-auth-library')
router.use(cors({
    origin:'http://localhost:3000',
    credentials: true
}))
// /api/oauth
async function getUserData(access_token, refresh_token){
    
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`)
    const data = await response.json()
    console.log('data', data)
   return (User.findOne({sub:data.sub}).then(async (user) => {
        if (!user){
            const newUser = await User.create( {sub:data.sub, name:data.name, refreshToken:refresh_token });
            newUser.save();
            return(data)
        }else{
            console.log("this is a user:" + user)
          
                const updatedUser = await User.updateOne({sub:data.sub}, {refreshToken:refresh_token})
                console.log("updated User: " + updatedUser)
                User.findOneAndReplace({sub:data.sub}, updatedUser)
       
            return(user)
        }
   }))
}
router.get('/', async function(req, res, next) {
    let user
    let newUser
    const code = req.query.code;
    console.log(code)
    try{
        const redirectUrl = 'http://localhost:5000/api/oauth'
        const oAuth2Client = new OAuth2Client(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            redirectUrl
        )
        const res = await oAuth2Client.getToken(code)
        await oAuth2Client.setCredentials(res.tokens);
        console.log("tokens acquired")
        user = oAuth2Client.credentials
        console.log('credentials', user)
        await getUserData(user.access_token, user.refresh_token).then((data) => {
            console.log(data)
            newUser = data
        })
        console.log(getUserData)
        
        console.log(user.data)
       
    }catch(err) {
        console.log(`Error Signing in with google`)
        console.log(err)
    }
    console.log(newUser)
    res.cookie('userData', {name: newUser.name, sub:newUser.sub})
    .cookie('accesstoken', user.access_token)
    .redirect(303, 'http://localhost:3000/')
    

    
} )

router.get('/dt', async (req, res) => {
    // const newUser = await User.create( {email:"test", name:"test", refreshToken:"test" });
    // newUser.save();
  User.findOne({sub:103220215867360770000}, ).then((users) => {
        res.status(200).send(users);
        console.log(users
        )
    }

    )
    
})
module.exports = router