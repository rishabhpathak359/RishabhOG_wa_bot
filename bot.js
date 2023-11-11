const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fetch=require('node-fetch');
process.env.YTDL_NO_UPDATE = true;
const ytdl = require('ytdl-core');
const {fetchBuffData} = require("./buffData")
const fs=require('fs-extra')
const express=require('express');
const { getInstaData, getInstaVid } = require('./insta');
const app=express();

app.get("/",(req,res)=>{
    res.send("hello")
})
app.listen(3000,()=>{
    console.log("server running on port no. 3000")
})
// myKey="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"
myKey = "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"
const validUrlPattern = /^https?:\/\/.+/i;
let start=false;
me="918468054031@c.us"
const imageReferences={};
const getChromePath = () => {
    return process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
};

  

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "Rishabh", dataPath: "./keys"}),
  puppeteer: { 
    executablePath: getChromePath(),
},
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('QR received, please scan it with your phone.');
});

client.on('authenticated', (session) => {
  // Save the session when authenticated
  console.log("Session" , session)
});

client.on('ready', () => {
    client.sendMessage(me, "Bot On")
    console.log('Client is ready!');
});

async function fetchData(url){
    const response=await fetch(url);
    const data=await response.json();
    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }
    return data;
}
async function getquotedmsg(message){
  if (message.hasQuotedMsg)
  {
     const mssg=await  message.getQuotedMessage();
     return mssg._data.type
    }
}

client.on('message', async message => {
    jid = message.from; // Store the sender's JID
   mId = message.id._serialized; // Store the message ID
   console.log(message.body);
   if(message.body==".ping"){
    message.reply("Pong!")
   }

   else if (message.hasMedia) {
    // Store the image reference when an image is received
    imageReferences[message.from] = message;
  } 

    else if(message.body=="/gpt"){
              start=true;
              client.sendMessage(message.from,"ChatGpt is activated now,you can start asking your questions!!🟢")
    }

    else if(message.body=="/close"){
        start=false;
        message.reply("ChatGpt is now closed!!🔴")
    }

    else if(start){
        try{
        const url="https://hercai.onrender.com/v3-beta/hercai?question=" + message.body
        const data=await fetchData(url);
        message.reply(data.reply);
        }catch(err){
            console.log(err);
            message.reply("An error occured while creating a resposne for your request ☹️.Please try again later")
        }
    } 
    else if(message.body.startsWith("/generate") && !start){
        try{
        const url="https://hercai.onrender.com/lexica/text2image?prompt=" + message.body.slice(10)
        const processingMessage=await message.reply("Generating your image,please wait...🔴")
        const data=await fetchData(url);
        buffer=await MessageMedia.fromUrl(data.url,{unsafeMime:true});
        buffer.mimeType="image/jpeg"
        await message.reply(buffer);
        processingMessage.edit("Your image has been generated successfully!!🟢")

        }catch(err){
            console.log(err);
            message.reply("An error occured while generating your image ☹️.Please try again later")
        }
    }
    // else if (message.hasMedia && !start) {
    //     const media = await message.downloadMedia();
    //     if (typeof media.data === 'string') {
    //         const mediaPath = `./stickers/image.${media.mimetype.split('/')[1]}`                                   //${media.mimetype.split('/')[1]}`;
    //         const data = Buffer.from(media.data, 'base64');
    //         fs.writeFile(mediaPath, data, err => {
    //             if (err) { 
    //                 console.error("Failed to save file:", err);
    //             } else {
    //                 console.log("Received media file saved successfully.");
    //             }
    //         });      
   
    //     } 
    //     else {
    //         console.error('Received media data is not a string:', media.data);
    //     } 
    // }


    ///  ############################         OPEN VIEW ONCE MESSAGE ###########################################3333
      else if(message.body==".view"  && message.hasQuotedMsg && !start){
        const referencedImage=imageReferences[message.from];
        if(referencedImage){
            const media = await referencedImage.downloadMedia(); 
            client.sendMessage(message.from, new MessageMedia(media.mimetype, media.data, media.mimetype), {
                quotedMessageId:mId
              }).then(() => {
                console.log('Sticker sent successfully');
              }).catch((error) => {
                    message.reply("There was an error while completing your request☹️")
              });
        }
      }

//    #####################################  IMAGE TO STICKER ###################################################

      else if (message.body === '.s' && message.hasQuotedMsg && !start) {
        const typeofmedia=await getquotedmsg(message);
        // Handle the '.s' command here
        const referencedImage = imageReferences[message.from];
        
        if (referencedImage && typeofmedia=="image") {
          const media = await referencedImage?.downloadMedia(); // Download the referenced image media
          await client.sendMessage(message.from, new MessageMedia(media?.mimetype, media?.data, media?.mimetype), {
            sendMediaAsSticker: true,
            stickerAuthor: "Rish",
            stickerName: "Mommy" ,// Send the referenced image as a sticker
            quotedMessageId:mId
          }).then(() => {
            console.log('Sticker sent successfully');
          }).catch((error) => {
            console.error('Error occurred while sending sticker:', error);
          });
        } else {
          // If there is no referenced image, send a message to the user
          client.sendMessage(message.from, 'No referenced image found. Please send an image and try again.');
        }
      }


    else if(message.body=="/e"){
        
       message.react("🥲");
    }


//  #################################  YOUTUBE-MP4-YTDL ########################################

else if(message.body.startsWith(".mp4") && !start){
    const url = message.body.split(' ')[1];
    if (url.startsWith('https://www.youtube.com') || url.startsWith('https://youtu.be') && !start) { 
        try {
            const waitingMessage=await message.reply("Processing your request please wait....🔴")
            const videoReadableStream = ytdl(url);

            const videoFilePath = process.env.VIDEO_FILE_PATH || './videos/';
            
            const videoWriteStream = fs.createWriteStream(videoFilePath + 'video.mp4');
            
            // Pipe the video stream to the write stream
            videoReadableStream.pipe(videoWriteStream);
            
            // Wait for the write stream to finish
            videoWriteStream.on('finish', async () => {
                const media = new MessageMedia('video/mp4', fs.readFileSync(videoFilePath + 'video.mp4').toString('base64'), null);
                await message.reply(media, message.from);
                await waitingMessage.edit('Your request has been completed!!🟢');
                fs.unlinkSync(videoFilePath + 'video.mp4');
            });
        } catch (error) {
            console.error('Error processing the video:', error);
            await message.reply('An error occurred while processing your video.');
        }
    }
}


//   ######################################  YTDL MP-3 ##########################################
else if(message.body.startsWith(".mp3") && !start){
      const url = message.body.split(' ')[1];
    if (url.startsWith('https://www.youtube.com') || url.startsWith('https://youtu.be') && !start) { 
    try {
        const videoId = ytdl.getURLVideoID(url);
        const waitingMessage = await message.reply("Processing your request please wait....🔴");

        // Download video info to get audio format
        const videoInfo = await ytdl.getInfo(url);
        const videoTitle = videoInfo.videoDetails.title.replace(/[^a-zA-Z0-9]/g, ''); // Remove special characters from the title
        const audioFormat = ytdl.chooseFormat(videoInfo.formats, { filter: 'audioonly' });

        if (audioFormat) {
            const audioUrl = audioFormat.url;
            const audioFilePath = process.env.AUDIO_FILE_PATH || './audio/';

            // Download audio stream
            const audioReadableStream = ytdl(url, { quality: 'highestaudio' });
            const audioWriteStream = fs.createWriteStream(audioFilePath + 'audio.mp3');
            audioReadableStream.pipe(audioWriteStream);
            audioWriteStream.on('finish', async () => {

                const media = new MessageMedia('audio/mp3', fs.readFileSync(audioFilePath + 'audio.mp3').toString('base64'), videoTitle);
                await message.reply(media, message.from,{sendMediaAsDocument:true});
                await waitingMessage.edit('Your request has been completed!!🟢');
                fs.unlinkSync(audioFilePath+'audio.mp3')
            });
        } else {
            await message.reply('No audio format found. Please try another video.');
        }
    } catch (error) {
        console.error('Error processing the video:', error);
        await message.reply('An error occurred while processing your video.');
    }
}
}
    

// //   ######################################  YOUTUBE-MP4 ##########################################

//     else if(message.body.startsWith(".mp4") && !start) {
//         try {
//             const s = message.body.split(' ');
//             const finalpath = s[1].split("/")[3].split("?")[0];
//             const url = "https://api.megah.tk/ytmp4?q=https://www.youtube.com/watch?v=" + finalpath;
//             const processingMessage=await message.reply("Processing your request,please wait...🔴" )
//             const data = await fetchData(url);
//             await processingMessage.edit("Getting data from the server for the video : " + data[0].titulo)
//             // Assuming the data contains a direct link to the video file
//             const videoUrl = data[0].url; 
//             const mimeType = 'video/mp4'; 
//             const videoBuffer = await fetchBuffData(videoUrl)
//             const media = new MessageMedia(mimeType, videoBuffer.toString('base64'), null);
//             await message.reply(media,message.from,{caption:data[0].titulo});
//             await processingMessage.edit("Your request has been completed successfully...🟢");
//         } catch (error) {
//             console.error("Failed to process the video:", error);
//             await message.reply("There was an issue while fetching your url..")
//         }
//     }

    
// //  #################################### YOUTUBE MP3 ########################################


// else if(message.body.startsWith(".mp3") && !start){
//     try {
//         const s = message.body.split(' ');
//         const finalpath = s[1].split("/")[3].split("?")[0];
//         const url = "https://api.megah.tk/ytmp3?q=https://www.youtube.com/watch?v=" + finalpath;
//         const processingMessage=await message.reply("Processing your request,please wait...🔴")
//         const data = await fetchData(url);
       
//         const audiourl = data[0].url; 
//         message.reply("If the audio doesn't download, you can download it from link here : " + audiourl)
//         buffer = await MessageMedia.fromUrl(audiourl,{unsafeMime:true});
//         buffer.filename =  data[0].titulo+".wav"
//         buffer.mimetype =  "audio/wav"
//         await client.sendMessage(message.from, buffer,{sendMediaAsDocument:true})
//         await processingMessage.edit("Your request has been completed successfully...🟢");
//     } catch (error) {
//         console.error("Failed to process the audio:", error);
//         await message.reply("There was an issue while fetching your url..")
//     }
// }
  
//  ################################################   INSTAGRAM  VIDEOFILE########################################

else if (message.body.startsWith(".insta") && !start) {
    await getInstaVid(message,client)
}


//########################        FOR INSTA  LINKS         ################################

else if(message.body.startsWith(".link") && !start){
    await getInstaData(message,client,validUrlPattern);
}
  

// ################################  For text-to-speech #########################################

else if(message.body.startsWith(".tts")){
    const text=message.body.slice(4);
    const media=await fetchBuffData(`http://api.voicerss.org/?key=ad2e930414774a4c95486411e610baea&hl=en-us&f=16khz_16bit_stereo&v=Mary&src=${text}`);
    client.sendMessage(message.from,new MessageMedia("audio/webp",media.toString("base64"), `${text}.mp3`),{sendMediaAsDocument:true,quotedMessageId:mId})

}
});

client.initialize();

 
 