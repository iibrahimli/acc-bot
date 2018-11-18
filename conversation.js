module.exports = {
  Conversation,
}


const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const request = require('request');

const sendm = require('./sendmessage.js');


const       MEMBER_FORM_LINK = "";
const ANIMAL_ADOPT_FORM_LINK = "";
const ANIMAL_OFFER_FORM_LINK = "";
const  ANIMAL_TUTORIALS_LINK = "";


/*
* the 'state' is used by the bot to remember where it left off and is a path in corpus
* 
*/

function Conversation(person){
  this.person = person;
  this.state = [];
  this.language = "en";
  this.messages_received = 0;
  this.done = false;
  
  this.continue = function(webhook_event){
    console.log(webhook_event);
    
    if(webhook_event.postback){
      if(webhook_event.postback.payload === "RESTART_FLOW"){
        this.state = [];
        this.messages_received = 0;
        sendm.sendMessage(this.person.psid, {text: "Restarted. Yenidən başlayaq. Начнём сначала."});
        return;
      }
      
      if(webhook_event.postback.payload === "TALK_TO_ADMIN"){
        this.state = [];
        this.messages_received = 0;
        passThreadToInbox(this.person.psid);
        sendm.sendMessage(this.person.psid, {text : corpus.qr[this.language].qr.info.qr.other.text});
        return;
      }
    }
    
    if(webhook_event.message){
    
      markSeen(this.person.psid);
      // markTyping(this.person.psid);

      // SORRY 
      if(this.messages_received !== 0 && !webhook_event.message.quick_reply){
        sendm.sendMessage(this.person.psid, 
          {
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"button",
                "text":corpus.qr[this.language].sorry,
                "buttons":[
                  {
                    "type":"postback",
                    "title":corpus.qr[this.language].admin_button,
                    "payload":"TALK_TO_ADMIN"
                  },
                  {
                    "type":"postback",
                    "title":corpus.qr[this.language].restart_button,
                    "payload":"RESTART_FLOW"
                  }
                ]
              }
            }
          });
        return;
      }

      let c = corpus;

      // first message from a stranger (flow hasnt started) - send welcome message & language selection
  //     if(webhook_event.message && this.messages_received === 0){

  //     }    
      // everything else lmao
      if(webhook_event.message.quick_reply){
        // console.log("RECEIVED PAYLOAD (STATE) = "+webhook_event.message.quick_reply.payload);

        this.state = JSON.parse(webhook_event.message.quick_reply.payload);
        
        if(this.state.length >= 2){
          this.language = this.state[1];
        }

        for (let st of this.state){
          c = c[st];
        }
      }

      let curstate = this.state;

      if(!c.qr){
        sendm.sendMessage(this.person.psid, {
          text : c.text,
        });
      }
      else {
        let qr = [];

        for(let reply in c.qr){
          // console.log("REPLY: ");
          // console.log(c.qr[reply]);
          
          if(c.qr[reply].image_url){
            qr.push({
              "content_type":"text",
              "title": c.qr[reply].title,
              "payload":JSON.stringify(curstate.concat(["qr",reply])),
              "image_url":c.qr[reply].image_url
            });
          }
          else{
            qr.push({
              "content_type":"text",
              "title": c.qr[reply].title,
              "payload":JSON.stringify(curstate.concat(["qr",reply]))
            });
          }
        }

        sendm.sendMessage(this.person.psid, {
          text : c.text,
          quick_replies : qr
        });
        
      }
      
      if(curstate[curstate.length-1] === "other" && curstate[curstate.length-3] === "info"){
        passThreadToInbox(this.person.psid);
      }

      //markTypingOff(this.person.psid);
    }
    
    this.messages_received++;
  }
}
  


const corpus = {
  text : "Hi, I'm a bot. Please select your language:",
  qr : {
    en : {
      title : "EN",
      image_url : "https://cdn.countryflags.com/thumbs/united-kingdom/flag-round-250.png",
      sorry : "Sorry, I don't understand you. You can:",
      admin_button : "Talk to admins",
      restart_button: "Restart",
      text : "You chose English. So, what can I help you with?",
      qr : {
        animal_help : {
          title : "Animal Help",
          text : "Choose what u want to do",
          qr : {
            rescue : {
              title : "Rescue",
              text : "RESCUE_TEXT",
            },
            adopt_offer : {
              title : "Adopt/offer",
              text : "Do u want to adopt or offer?",
              qr : {
                adopt : {
                  title : "Adopt an animal",
                  text : "ADOPT_TEXT",
                },
                offer : {
                  title : "Offer an animal",
                  text : "OFFER_TEXT",
                }
              }
            }
          }
        },
        membership : {
          title : "Become a member",
          text : "MEMBER_TEXT",
        },
        info : {
          title : "Information",
          text : "Regarding what?",
          qr : {
            about_us : {
              title : "About Us",
              text : "US_INFO",
            },
            tutorials : {
              title : "Tutorials",
              text : "You can follow this link to get access to tutorials on how to take care of an animal: "+ANIMAL_TUTORIALS_LINK+".\n Thanks for contacting us.",
            },
            other : {
              title : "Talk to admins",
              text : "The admins have been notified and will contact you shortly. Please leave your message here, I will deliver it to them.",
            }
          }
        }
      }
    },
    az : {
      title : "AZ",
      image_url : "https://cdn.countryflags.com/thumbs/azerbaijan/flag-round-250.png",
      sorry : "Bağışlayın, mən Sizi anlamıram. Siz düymələrə basaraq öz seçiminizi edə bilərsiniz:",
      admin_button : "Adminlərlə əlaqə",
      restart_button: "Yenidən başla",
      text : "Siz azərbaycan dilini seçdiniz. Mən Sizə necə yardım edə bilərəm?",
      qr : {
        animal_help : {
          title : "Heyvanlara yardım",
          text : "Seçiminizi edin:",
          qr : {
            rescue : {
              title : "Xilas etmək",
              text : "RESCUE_TEXT",
            },
            adopt_offer : {
              title : "Sahiblənmək/sahibləndirmək",
              text : "Siz heyvanı sahibləndirmək yoxsa yaxşı əllərə həvalə etmək istəyirsiniz?",
              qr : {
                adopt : {
                  title : "Sahiblənmək",
                  text : "ADOPT_TEXT",
                },
                offer : {
                  title : "Sahibləndirmək",
                  text : "OFFER_TEXT",
                }
              }
            }
          }
        },
        membership : {
          title : "Üzv olmaq",
          text : "MEMBER_TEXT",
        },
        info : {
          title : "Informasiya",
          text : "Nə haqqında öyrənmək istərdiniz?",
          qr : {
            about_us : {
              title : "Bizim haqqımızda",
              text : "US_INFO",
            },
            tutorials : {
              title : "Təlimatlar",
              text : "Bu link Sizi heyvanlara düzgün baxım haqqında olan video təlimlərimizə yönləndirəcək: "+ANIMAL_TUTORIALS_LINK+".\n Bizimlə əlaqə saxladığınız üçün təşəkkürlər.",
            },
            other : {
              title : "Bizimlə əlaqə saxla",
              text : "Administratorlar sizin xahişiniz haqqında məlumatlandırılacaqlar və yaxın zamanda  Sizinlə əlaqə saxlayacaqlar. Zəhmət olmasa mesajınızı yazın, Mən bunu onlara çatdıracam.",
            }
          }
        }
      }
    },
    ru : {
      title : "РУС",
      image_url : "https://cdn.countryflags.com/thumbs/russia/flag-round-250.png",
      sorry : "Извините, я Вас не понимаю. Вы можете нажать на кнопки, чтобы сделать свой выбор:",
      admin_button : "Связаться с админами",
      restart_button: "Начать сначала",
      text : "Вы выбрали русский. Чем Я могу Вам помочь?",
      qr : {
        animal_help : {
          title : "Помощь животным",
          text : "Выберите что Вы хотите:",
          qr : {
            rescue : {
              title : "Спасение животных",
              text : "СПАСЕНИЕ_ТЕКСТ",
            },
            adopt_offer : {
              title : "В добрые руки",
              text : "Хотите приютить животное или отдаете в добрые руки?",
              qr : {
                adopt : {
                  title : "Приютить животное",
                  text : "ADOPT_TEXT",
                },
                offer : {
                  title : "Ищет дом",
                  text : "OFFER_TEXT",
                }
              }
            }
          }
        },
        membership : {
          title : "Стать членом клуба",
          text : "MEMBER_TEXT",
        },
        info : {
          title : "Информация",
          text : "Про что Вы хотите знать?",
          qr : {
            about_us : {
              title : "О нас",
              text : "US_INFO",
            },
            tutorials : {
              title : "Обучение",
              text : "Перейдя по этой ссылке Вы сможете получить доступ к нашим обучающим видео материалам по уходу за животными: "+ANIMAL_TUTORIALS_LINK+".\n Спасибо за Ваше обращение.",
            },
            other : {
              title : "Связаться с админами",
              text : "Администраторы будут уведомлены о Вашей просьбе и скоро свяжутся с Вами. Пожалуйста, введите Ваше сообщение и Я это отправлю им.",
            }
          }
        }
      }
    },
    
  }
};

module.exports.corpus = corpus;


function welcome(psid, message1, message2){
  let request_body = { 
    "recipient" : { 
      "id" : psid
    },
    "message" : message1,
    "messaging_type" : "RESPONSE"
  }
  
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (err) {
      console.log(err);
    }
    else if(body.err){
      console.log(body.err);
    }
    else if(body.message_id){
      sendm.sendMessage(psid, message2);
    }
  });
  
  // markTypingOff(psid);
}

function markSeen(psid){
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": {
      "recipient":{
        "id":psid
      },
      "sender_action":"mark_seen"
    }
  }, (err, res, body) => {
    if (err) {
      console.log(err);
    }
    else if(body.err){
      console.log(body.err);
    }
  });
}

function markTyping(psid){
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": {
      "recipient":{
        "id":psid
      },
      "sender_action":"typing_on"
    }
  }, (err, res, body) => {
    if (err) {
      console.log(err);
    }
    else if(body.err){
      console.log(body.err);
    }
  });
}

function markTypingOff(psid){
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": {
      "recipient":{
        "id":psid
      },
      "sender_action":"typing_off"
    }
  }, (err, res, body) => {
    if (err) {
      console.log(err);
    }
    else if(body.err){
      console.log(body.err);
    }
  });

}

function passThreadToInbox(psid){
  request({
    "uri": "https://graph.facebook.com/v2.6/me/pass_thread_control",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": {
      "recipient":{ "id":psid },
      "target_app_id":,
    }
  }, (err, res, body) => {
    if (err) {
      console.log(err);
    }
    else if(body.err){
      console.log(body.err);
    }
  });
}
