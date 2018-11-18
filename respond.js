module.exports = {
  getNameFromPSID,
  sendDailyHoroscopeToS,
  sendDailyHoroscopeT
}

const arequest = require('request');
const request = require('sync-request');
const textract = require('textract');
const iconv = require("iconv-lite");

const sendm = require('./sendmessage.js');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

function getNameFromPSID(user_psid){
  let person = {};
  
  //let res = request({
   // "uri": "https://graph.facebook.com/"+user_psid,
   // "qs": { "fields" : "first_name,last_name",
      //     "access_token": PAGE_ACCESS_TOKEN },
   // "method": "GET",
   // "json" : true
  //});
  
  let res = request('GET', "https://graph.facebook.com/"+user_psid, {
    qs:{
      fields:"first_name,last_name",
      access_token: PAGE_ACCESS_TOKEN
    }
  });
  let body = JSON.parse(res.getBody('utf-8'));
  return {
    first_name: body.first_name,
    last_name: body.last_name,
    psid: body.id
  };
}

function sendDailyHoroscopeToS(){
  
}

function sendDailyHoroscopeT(){


    
}
