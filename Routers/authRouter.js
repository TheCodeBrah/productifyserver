const express = require("express");
const session = require('express-session')
const cors = require('cors')
const User = require("../Schemas/userSchema")
const router = express.Router()
const passport = require("passport");
const dotenv = require('dotenv')
const bodyParser = require("body-parser");
dotenv.config()
const {OAuth2Client} = require('google-auth-library');
const cookieParser = require("cookie-parser");
router.use(cors({
    origin:'http://localhost:3000',
    credentials: true
}))
// router.use((req, res, next) => {
//     res.append('Access-Control-Allow-Origin', ['*']);
//     res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.append('Access-Control-Allow-Headers', 'Content-Type');
//     res.append('Access-Control-Allow-Credentials', true)
//     next();
// });
router.use(cookieParser())


async function authenticate(req, res, next){ 
    // const {at} = req.body
  
    console.log(req.cookies)
    // const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${at}`)  
    // const responseData = await response.json()
    // console.log(responseData)
    // console.log(req.body)
    // if (response.formData.error === "invalid_token"){
    //     const tokenRes = await fetch('https://oauth2.googleapis.com/token', 
    //         {
    //             method:"POST",
    //             headers: {
    //                 "Content-Type": "application/x-www-form-urlencoded"
    //             }
                
    //         }
    //     )
    // }
next()
// req.body ? next() : res.sendStatus(403)
}


router.post('/login', async function(req, res, next) {
const redirectUrl = 'http://localhost:5000/api/oauth'

const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    redirectUrl
)
const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type:'offline',
    scope:["https://www.googleapis.com/auth/userinfo.profile openid", "https://www.googleapis.com/auth/calendar"] ,
    prompt:'consent',
})
res.json({url:authorizeUrl})
})
router.post('/verify', authenticate, bodyParser.json() ,async (req, res) => {
    console.log("cookies: " + req.cookies.accesstoken)
    let at
    // console.log(req.body.sub)   
    if(req.cookies.accesstoken){
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${req.cookies.accesstoken}`)
        console.log("response: " + response.status)
        //if token is invalid and user is logged in, send a request to use 
        //stored refresh token to get new access token
        if (response.status === 200){
            res.send("verfied")
        }
        if (response.status === 400 && req.body.sub){
            const user = await User.findOne({sub: req.body.sub})
            console.log("getting user data")

            const response = await fetch(`https://oauth2.googleapis.com/token`, {
                method: "POST",
                
               
                    body:JSON.stringify({client_id:process.env.CLIENT_ID,
                    client_secret:process.env.CLIENT_SECRET,
                    refresh_token:user.refreshToken,
                    grant_type:"refresh_token",})
                

            }).catch((err) => {console.log(err)})
            
            const responseData = await response.json()
            console.log("Token Response: " + response)
            // console.log("response Body : " + responseData)
            // console.log("auth response: " + responseData.access_token)
            at = responseData.access_token
           
            
            // console.log("access token: " + responseData.access_token)

        }
      
       
    }
    if(!req.cookies.accesstoken && req.body.sub){
        // console.log(req.body.sub)
        console.log("no access Token")
        //if token is invalid and user is logged in, send a request to use 
        //stored refresh token to get new access token
       
            const user = await User.findOne({sub: req.body.sub})
            console.log("refresh token: " + user.refreshToken)

            const response = await fetch(`https://oauth2.googleapis.com/token`, {
                method: "POST",
                
               
                    body:JSON.stringify({client_id:process.env.CLIENT_ID,
                    client_secret:process.env.CLIENT_SECRET,
                    refresh_token:user.refreshToken,
                    grant_type:"refresh_token",})
                

            }).catch((err) => {console.log(err)})
           
            const responseData = await response.json()
            console.log("auth response: " + JSON.stringify(responseData))
            at = responseData.access_token
           
            
            // console.log("access token: " + responseData.access_token)

        
      
      
    } 
   
    if (at){
        res.cookie("accesstoken", at)
        res.send("verfied")
    }  else{
        console.log("hola")
        res.send(undefined)
    }
})
router.get('/userinfo', (req, res) => {
    console.log(req.cookies.userData)
    if (!req.cookies.userData){
        res.send(undefined)
        console.log("no userinfo")
    }else{
        res.send(req.cookies.userData)
    }
})
    







// router.get("/login", (req, res) => {
//     res.status(200).send('<a href="/api/auth/google"> Authenticate with Google </a>' )
//   })
//   router.get("/google", 
//     passport.authenticate('google', {scope: ['email', 'profile']})
  
  
//   )
//   router.get('/callback', 
//     passport.authenticate('google', {
//         successRedirect: '/api/auth/success',
//         failureRedirect: '/api/auth/failure'
//     })
//   )
  
  
//   router.get('/success', (req, res) => {res.redirect('http://localhost:3000')})
//   // app.get('/api/auth/success', (req, res) => {res.redirect('/api/auth/isloggedin')})
//   router.get('/failure', (req, res) => {res.status(401)})
//   router.get('/isloggedin', (req, res) => {
//     console.log(req.session)
//     res.send('boop')
//   })

  module.exports = router