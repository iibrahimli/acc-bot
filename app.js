'use strict';

// Import dependencies and set up http server
const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server

const glitchup = require('glitchup');
glitchup('/webhook');

const respond = require('./respond');
const gdrive = require('./drive.js');
const convo = require('./conversation.js');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// ---------------- hscope stuff ----------------------
const schedule = require('node-schedule');
});
// var testjob = schedule.scheduleJob('* * * * *', function(){
//   sendMessage('1840614619349962', {
//     'text': "server time is "+Date()
//   });
// });
// -------------------------------------------------------


// an associative array storing current conversations ([psid] -> conversation)
let threads = [];


// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Get the webhook event. entry.messaging is an array, but 
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      //console.log(webhook_event);
      
      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      //console.log('OUTPUT: Sender PSID: ' + sender_psid);
      const person = respond.getNameFromPSID(sender_psid);
      // if (person){
      //   console.log("FIRST NAME: "+person.first_name);
      //   console.log("LAST NAME: "+person.last_name);
      //   console.log("ID: "+person.psid);
      // }
      if(!person) {
        person = {
          first_name: "unknown",
          last_name: "unknown",
          psid: "unknown"
        };
      }
      
      if(! threads[person.psid]){
        threads[person.psid] = new convo.Conversation(person);
      }
      
      let conv = threads[person.psid];
    
      conv.continue(webhook_event);
      
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
  
  /** VERIFY TOKEN **/
  const VERIFY_TOKEN = "";
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Check if a token and mode were sent
  if (mode && token) {
  
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});
