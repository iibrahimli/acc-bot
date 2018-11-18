module.exports = {
  uploadMedia
}

function uploadMedia(filename){
  const {google} = require('googleapis');
  const fs = require('fs');
  const key = require('./bot-drive.json');

  const drive = google.drive('v3');
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/drive',
     'https://www.googleapis.com/auth/spreadsheets'],
    null
  );

  jwtClient.authorize((authErr) => {
    if (authErr) {
      console.log(authErr);
      return;
    }
    
    let extension = filename.slice(filename.lastIndexOf('.')+1);
    let mimeType = '';
    if(extension == 'jpg' || extension == 'png' || extension == 'gif'){
      mimeType = 'image/'+extension;
    }
    else if(extension == 'mp4'){
      
    }

    // everything uploaded to the '/data/media' folder
     const fileMetadata = {
       name: filename,
       parents: ['1sZxzf47tiIUL6683xy5s7HUU8PpYMd5t']
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filename)
    };

    drive.files.create({
      auth: jwtClient,
      resource: fileMetadata,
      media,
      fields: 'id'
    }, (err, file) => {

      if (err) {
        console.log(err);
        return;
      }
      // Log the id of the new file on Drive
      console.log('Uploaded File Id: ', file.data.id);
    });
  });
  
}