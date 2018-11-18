module.exports = {
  sendMessage,
}

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

const request = require('request');

function sendMessage(sender_psid, response) {
  
  console.log(response);
  
  let request_body = { 
    "recipient" : { 
      "id" : sender_psid
    },
    "message" : response,
    "messaging_type" : "RESPONSE"
  }
  
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log(body);
      console.log(body.message_id);
      console.log('Message sent');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
  
}