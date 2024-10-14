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

    async function getTaskCalendarId(req, res, next){
            let responseData;
        const response = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=${req.cookies.accesstoken}`)
        .then((res) => {return res.json()})
        //filter for specific calendar  
        .then((data) => {return data.items.filter((calendars) => calendars.summary === "productify-tasks"); })
        .then((data) => {responseData = data[0].id; console.log(data[0].id)})
        return responseData;
    }


    //Creates A task Calendar to the Users Google Account

async function createTaskCalendar(req, res){

    console.log(req.cookies.accesstoken)
        const calendar = {
                    
            "summary":"productify-tasks",
            'timeZone': 'America/Los_Angeles'
          }
    fetch(`https://www.googleapis.com/calendar/v3/calendars?access_token=${req.cookies.accesstoken}`, {
                    method:"POST",
                    credentials:"omit",
                    headers: {
                        "Content-Type": "application/json",
                    
                            },
                  body:JSON.stringify(calendar)
                }).catch((err) => { console.log("calendar Creation: " + err)})
                .then((res) => {return res.json()})
                .then((data) => console.log("calendar Creation: " + JSON.stringify(data)))

}
//Checks for existence of task Calendar
async function checkForCalendar(req, res, next)  {
    let responseData = []
    const response = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=${req.cookies.accesstoken}`)
    
.then((res) => {return res.json()})

//filter for specific calendar  
.then((data) => {responseData = data.items.filter((calendars) => calendars.summary === "productify-tasks"); 
    console.log(responseData)
    if(responseData.length === 0) {
    createTaskCalendar(req, res, next).then(() => (next()))
}
else{
    next();
}


})

    
}
    router.use(checkForCalendar)

router.post("/", bodyParser.json(), checkForCalendar, async (req, res) => {
    const {taskBody} = req.body;
    console.log(req.cookies.accesstoken)
    
    

    res.sendStatus(200)
})
/*
create new task in productify-task Google Calendar.
*/ 
router.post("/insert", bodyParser.json(), checkForCalendar, async(req, res) => {
    const body = req.body;
    const at = req.cookies.accesstoken
        console.log(req.body.taskBody);
        
    const calendarId = await getTaskCalendarId(req, res)
    console.log("Calendar Id: " + calendarId)
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?access_token=${at}`, {
        method:"POST",
        credentials:"omit",
        headers: {
            "Content-Type": "application/json",

        },
        redirect: "follow",
        body: JSON.stringify(body.taskBody),
    }).catch((err) => { console.log("outputting GAPI Error: " + err)})
    .then((data) => {return(data.json())})
    .then((res) => {console.log(res)})

})
router.post('/testget', bodyParser.json(), (req, res) => {

    console.log(req.cookies)
    console.log(req.body)
    res.send(200)
})

module.exports = router;