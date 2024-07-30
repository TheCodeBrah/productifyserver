const express = require("express");
const session = require('express-session')
const cors = require('cors')
const router = express.Router()
const passport = require("passport");
const dotenv = require('dotenv')
dotenv.config()
const {OAuth2Client} = require('google-auth-library');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
router.use(cors({
    origin:'http://localhost:3000',
    credentials: true
}))
router.use(cookieParser())
router.use(bodyParser.json())

    async function authenticate(req, res, next){ 
        // const {at} = req.body
      
        console.log(req.cookies)
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${at}`)  
        const responseData = await response.json()
        console.log(responseData)
        console.log(req.body)
        if (response.formData.error === "invalid_token"){
            const tokenRes = await fetch('https://oauth2.googleapis.com/token', 
                {
                    method:"POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                    
                }
            )
        }
   next()
    // req.body ? next() : res.sendStatus(403)
}


router.post('/',  bodyParser.json(),  async (req, res) => {
    const { at, month, year, days} = req.body
  
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=${at}&timeMin=${year}-${month}-01T00:00:00Z&timeMax=${year}-${month}-${days}T00:00:00Z`)
   console.log(response)
    // const calendar = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`)
    const calendarEvents = await response.json()
 
    if (response.status === 200){
    res.status(200).send(calendarEvents)}
    else{
        res.status(401).send('Failed to connect to google api')
    }
    if (calendarEvents.error?.code === 401){

    }
})
router.post('/insert', bodyParser.json(), async(req, res) => {
   const { body, at } = req.body
   console.log(body)
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=${at}`, {
        method:"POST",
        credentials:"omit",
        headers: {
            "Content-Type": "application/json",

        },
        redirect: "follow",
        body: JSON.stringify(body),
    }).catch((err) => { console.log(err)})
    const information = await response.json()
    console.log()
    res.sendStatus(200)

})
router.post('/delete', bodyParser.json(), async (req, res) => {
    const { id, at } = req.body
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${id}?access_token=${at}`)
    const responsejson = await response.json()
    console.log(responsejson)
    if(response.status === 200){
    const calendarResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${id}?access_token=${at}`, {
        method:'DELETE',
        mode:"cors"
    })
}
})
module.exports = router