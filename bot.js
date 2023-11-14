const { Client, LocalAuth, MessageMedia , Mentioned, ChatTypes } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fetch=require('node-fetch');
process.env.YTDL_NO_UPDATE = true;
const ytdl = require('@distube/ytdl-core');
const {fetchBuffData} = require("./buffData")
const fs=require('fs-extra')
const express=require('express');
const { getInstaData, getInstaVid } = require('./insta');
const { tts } = require('./tts');
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
    client.setStatus(`Welcome! try typing \`.help\` to get started with the usage of the bot`)
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
   const gettingChat=await message.getChat();
   if(message.body==".ping"){
    message.reply("Pong!")
   }

   else if (message.hasMedia) {
    // Store the image reference when an image is received
    imageReferences[message.from] = message;
  } 

    else if(message.body=="/gpt"){
              start=true;
              client.sendMessage(message.from,"AIChat is activated now,you can start asking your questions!!🟢")
    }

    else if(message.body=="/close"){
        start=false;
        message.reply("AIChat is now closed!!🔴")
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

else if (message.body.startsWith(".mp4") && !start) {

  const args = message.body.split(' ');
    
  // Check if the command has a valid YouTube URL
  if (args.length !== 2 || !args[1].startsWith('https://www.youtube.com') && !args[1].startsWith('https://youtu.be')) {
      // Throw an error if the URL is missing or invalid
      await message.reply('Ara-ara please provide a valid YouTube URL after the .mp4 command.🫡');
      return;
  }

  const url = args[1];

  const videoId = ytdl?.getURLVideoID(url);
  
  if (url.startsWith('https://www.youtube.com') || url.startsWith('https://youtu.be') && !start) { 
      const processingMessage = await message.reply("Processing your request please wait....🔴");

      try {
          const videoInfo = await ytdl?.getInfo(url);

          if (!videoInfo?.formats?.some(format => format?.hasVideo)) {
              throw new Error('The video does not contain playable video formats.');
          }

          const videoTitle = videoInfo?.videoDetails?.title?.replace(/[^a-zA-Z0-9]/g, '-'); 
          const waitingMessage = await processingMessage.edit(`🟡Getting data from the server for ${videoTitle}`);

          // Generate a unique filename using uuid
          const fileName = `${videoId}_${Math.random()*8500}_${videoTitle}.mp4`;
          const videoReadableStream = ytdl(url ,{quality:`highest`});
          const videoWriteStream = fs.createWriteStream(fileName);

          // Pipe the video stream to the write stream
          videoReadableStream.pipe(videoWriteStream);

          // Wait for the write stream to finish
          videoWriteStream.on('finish', async () => {
              const media = MessageMedia.fromFilePath(fileName, { unsafeMime: true });
              media.mimeType = 'video/mp4';
              await message.reply(media, message.from, {sendMediaAsDocument:true});
              await waitingMessage.edit('Your request has been completed!!🟢');
              fs.unlinkSync(fileName);
          });
      } catch (error) {
          console.error('Error processing the video:', error);
          await message.reply('An error occurred while processing your video.☹️');
      }
  }
}



//   ######################################  YTDL MP-3 ##########################################
else if (message.body.startsWith(".mp3") && !start) {
 
  const args = message.body.split(' ');
    
  // Check if the command has a valid YouTube URL
  if (args.length !== 2 || !args[1].startsWith('https://www.youtube.com') && !args[1].startsWith('https://youtu.be')) {
      // Throw an error if the URL is missing or invalid
      await message.reply('Ara-ara please provide a valid YouTube URL after the .mp4 command.🫡');
      return;
  }

  const url = args[1];
  if (url.startsWith('https://www.youtube.com') || url.startsWith('https://youtu.be')) {
      try {
          const waitingMessage = await message.reply("Processing your request please wait....🔴");

          // Download video info to get audio format
          const videoInfo = await ytdl?.getInfo(url);

          if (!videoInfo?.formats?.some(format => format?.hasAudio)) {
              throw new Error('The video does not contain audio.');
          }

          const videoTitle = videoInfo?.videoDetails?.title?.replace(/[^a-zA-Z0-9]/g, '-'); // Remove special characters from the title
          const editedWaitingMessage = await waitingMessage.edit(`🟡Getting data from the server for ${videoTitle}`);

          // Download audio stream
          const audioReadableStream = ytdl(url, { filter: 'audioonly',quality:`${'lowestaudio' ? `lowestaudio` : `highestaudio`}` });
          const fileName = `${videoTitle}.mp3`;
          const audioWriteStream = fs.createWriteStream(fileName);
          audioReadableStream.pipe(audioWriteStream);

          audioWriteStream.on('finish', async () => {
              const media = MessageMedia.fromFilePath(fileName, { unsafeMime: true });
              media.mimeType = 'audio/mpeg';
              await message.reply(media, message.from, { sendMediaAsDocument: true });
              await editedWaitingMessage.edit('Your request has been completed!!🟢');
              fs.unlinkSync(fileName);
          });
      } catch (error) {
          console.error('Error processing the audio:', error);
          await message.reply('An error occurred while processing your audio.☹️');
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

else if(message.body.startsWith(".tts") && message.hasQuotedMsg){

    tts(message,client);

}

//   #######################################       Tag all participants with a message  #######################################33


else if(message.body === '.everyone' && message.hasQuotedMsg && gettingChat.isGroup) {
  const quote=await message.getQuotedMessage();
  let text = "";
  let mentions = [];
  let displaytext=`${quote?._data?.body} `

  for(let participant of gettingChat?.participants) {
      const contact = await client.getContactById(participant?.id?._serialized);
      
      mentions.push(contact);
      text += `@${participant?.id?.user} `;
  }
 
  await gettingChat.sendMessage(displaytext, { mentions });
}

// ###########################################  Tag all participants without any message ##############################################

else if(message.body==".tagall" && gettingChat.isGroup){
  try{
  let text = "";
  let mentions = [];

  for(let participant of gettingChat?.participants) {
      const contact = await client.getContactById(participant?.id?._serialized);
      
      mentions.push(contact);
      text += `@${participant?.id?.user} `;
  }
 
  const sentmsg=await message.reply(null,message.from, { mentions });
  await sentmsg.edit("Done")
}catch(err){
  console.log("Error",err);
  message.reply("There was an error mentioning all the participants")
}

}
else if (message.body === '.help') {
  const helpText = `
👋 **Welcome to RishabhOG_BOT!**

🤖 **Bot Introduction:**

   - Bot Name: *RishabhOG_BOT*
   - Created By: *Rishabh Pathak*

🟢 **Status:**
   - Online

🚀 **Bot Commands:**
1.  *.ping*
   - Check if the bot is responsive.
   - Usage: \`.ping\`

2.  */gpt*
   - Activate ChatGpt for answering questions.
   - Usage: \`/gpt\`

3.  */close*
   - Deactivate ChatGpt.
   - Usage: \`/close\`

4.  */generate <prompt>*
   - Generate an image based on the given prompt.
   - Usage: \`/generate <prompt>\`

5.  *.view*
   - View the last referenced image.
   - Usage: \`.view\`

6.  *.s*
   - Convert a referenced image to a sticker.
   - Usage: \`.s\`

7.  *.mp4 <YouTube URL>*
   - Download and send a video from YouTube.
   - Usage: \`.mp4 <YouTube URL>\`

8.  *.mp3 <YouTube URL>*
   - Download and send the audio from a YouTube video.
   - Usage: \`.mp3 <YouTube URL>\`

9.  *.insta <Instagram URL>*
   - Download and send a video from Instagram.
   - Usage: \`.insta <Instagram URL>\`

10.  *.link <URL>*
    - Get link to download an Instagram media.
    - Usage: \`.link <URL>\`

11.  *.tts*
    - Converts the referenced text to speech and send as an audio file.
    - Usage: \`.tts \`  (replying to the text you want the speech for)

    *optional* 
    - You can also add a particular language in which you want your speech(Don't expect that the text will be translated)
    - *.tts* *language*
    -*Example* - *.tts en* or *.tts hi* or *.tts ja* etc.

12.  *.tagall*
    - Mention all participants in the group.
    - Usage: \`.tagall\`

13.  *.everyone*
    - Mention all participants in the group with a message.
    - Usage: \`.everyone\` (replying to a message that you want to display mentioning all the participants)

🌟 **Feel free to explore and enjoy the bot's features!**

🚀 **Future Updates:**
   Stay tuned! More cool features will be added in future updates. Your bot experience is about to get even better! 🌟
`;

  // Send the enhanced help text to the user
  await message.reply(helpText);
}


});


client.initialize();

 
 