const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const mime = require('mime-types');
const fetch=require('node-fetch')
const ytdl = require('ytdl-core');
const {fetchBuffData} = require("./test")
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const instagramDl = require("@sasmeee/igdl");
// myKey="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"
myKey = "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"
const validUrlPattern = /^https?:\/\/.+/i;
let start=false;
const imageReferences={};
// const client = new Client({
//     authStrategy: new LocalAuth(), 
//     puppeteer: {
//      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
//     }
// }); 
const getChromePath = () => {
    // Modify this function to dynamically determine the path of Chrome based on your deployment environment.
    // For example, on Render, you might use an environment variable or a configuration file to store the path.
    // Replace 'YOUR_CHROME_PATH' with the actual logic to determine the Chrome path.
    return process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
};

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: getChromePath(),
    },
});
fs.removeSync('./stickers')
fs.mkdirpSync('./stickers')
client.on('qr', (qr) => {
    // Generate and display the QR code for authentication
    qrcode.generate(qr, { small: true });
    console.log('QR received, please scan it with your phone.');
});

client.on('ready', () => {
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
async function fetchBufferData(url){
    console.log(url)
    const response=await fetch(url);
    const videoBuffer = await response.buffer()
    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }
    return videoBuffer;
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

if (message.hasMedia  ) {
    // Store the image reference when an image is received
    imageReferences[message.from] = message;
  } 
    console.log(message.body);
    if(message.body=="/gpt"){
              start=true;
              client.sendMessage(message.from,"ChatGpt is activated now,you can start asking your questions!!🟢")
    }
    else if(message.body=="/close"){
        start=false;
        message.reply("ChatGpt is now closed!!🔴")
    }
    if(start){
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
        console.log(data);
        buffer=await MessageMedia.fromUrl(data.url,{unsafeMime:true});
        console.log(buffer)
        buffer.mimeType="image/jpeg"
        await message.reply(buffer);
        processingMessage.edit("Your image has been generated successfully!!🟢")

        }catch(err){
            console.log(err);
            message.reply("An error occured while generating your image ☹️.Please try again later")
        }
    }
   else if (message.body === "/video" && !start) {
        // Replace with the actual path to your file
        const internalMediaPath = 'internal.jpeg';
        const fileMimeType = mime.lookup(internalMediaPath);
        console.log(fileMimeType);
        const media = MessageMedia.fromFilePath('internal.jpeg');
        console.log(media);
        client.sendMessage(message.from,media,{sendMediaAsSticker:true});

        //Downloading media
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
      else if(message.body==".img"  || message.body==".vid" && message.hasQuotedMsg && !start){
        const referencedImage=imageReferences[message.from];
       const typeofmedia=await  getquotedmsg(message)
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
          const sticker = new Sticker(media?.data, {
            pack: 'My Pack', // The pack name
            author: 'Me', // The author name
            type: StickerTypes.FULL, // The sticker type
            categories: ['🤩', '🎉'], // The sticker category
            id: '12345', // The sticker id
            quality: 50, // The quality of the output file
            background: '#000000' // The sticker background color (only for full stickers)
        })
          await client.sendMessage(message.from, new MessageMedia(media?.mimetype, sticker.data.toString('base64'), media?.mimetype), {
            sendMediaAsSticker: true, // Send the referenced image as a sticker
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


   else if (message.body.startsWith('https://www.youtube.com') || message.body.startsWith('https://youtu.be') && !start) { 
        try {
            const url = message.body;
            const videoId = ytdl.getURLVideoID(url);
            const waitingMessage=await message.reply("Processing your request please wait....🔴")
            const videoInfo = await ytdl.getInfo(videoId);
            // const format360p = videoInfo.formats.find(f => f.qualityLabel === '360p' && f.hasAudio && f.hasVideo);
            const videoReadableStream = ytdl(url)   
            let videoBuffer = Buffer.alloc(0); 
            videoReadableStream.on('data', (chunk) => {
                videoBuffer = Buffer.concat([videoBuffer, chunk]);
            }); 

            videoReadableStream.on('finish', async () => {
                const media = new MessageMedia('video/mp4', videoBuffer.toString('base64'), null);
                await message.reply(media,message.from);
                await waitingMessage.edit("Your request has been completed!!🟢")
            });
        } catch (error) {
            console.error('Error processing the video:', error);
            await message.reply('An error occurred while processing your video.');
        }
    }


    

//   ######################################  YOUTUBE-MP4 ##########################################

    else if(message.body.startsWith(".mp4") && !start) {
        try {
            const s = message.body.split(' ');
            const finalpath = s[1].split("/")[3].split("?")[0];
            const url = "https://api.megah.tk/ytmp4?q=https://www.youtube.com/watch?v=" + finalpath;
            console.log(url);
            const processingMessage=await message.reply("Processing your request,please wait...🔴" )
            const data = await fetchData(url);
            await processingMessage.edit("Getting data from the server for the video : " + data[0].titulo)
            // Assuming the data contains a direct link to the video file
            const videoUrl = data[0].url; 
            console.log(videoUrl);
            const mimeType = 'video/mp4'; // Set the MIME type manually if you know what type of file to expect
            // Fetch the video data using node-fetch
            // const vidData=await fetch(videoUrl);
            // const videoBuffer=await vidData.buffer(); 
            const videoBuffer = await fetchBufferData(videoUrl)
    
            // Create a MessageMedia object with the correct MIME type
            const media = new MessageMedia(mimeType, videoBuffer.toString('base64'), null);
            await message.reply(media,message.from,{caption:data[0].titulo});
            await processingMessage.edit("Your request has been completed successfully...🟢");
        } catch (error) {
            console.error("Failed to process the video:", error);
            await message.reply("There was an issue while fetching your url..")
        }
    }

    
//  #################################### YOUTUBE MP3 ########################################


else if(message.body.startsWith(".mp3") && !start){
    try {
        const s = message.body.split(' ');
        const finalpath = s[1].split("/")[3].split("?")[0];
        const url = "https://api.megah.tk/ytmp3?q=https://www.youtube.com/watch?v=" + finalpath;
        console.log(url);
        const processingMessage=await message.reply("Processing your request,please wait...🔴")
        const data = await fetchData(url);
       
        const audiourl = data[0].url; 
        message.reply("If the audio doesn't download, you can download it from link here : " + audiourl)
        console.log(audiourl);
     
        buffer = await MessageMedia.fromUrl(audiourl,{unsafeMime:true});
        console.log(buffer);
        buffer.filename =  data[0].titulo+".mp3"
        buffer.mimetype =  "audio/mpeg"
        console.log("New buffer",buffer);
        await client.sendMessage(message.from, buffer,{sendMediaAsDocument:true})
        await processingMessage.edit("Your request has been completed successfully...🟢");
    } catch (error) {
        console.error("Failed to process the audio:", error);
        await message.reply("There was an issue while fetching your url..")
    }
}
  
//  ################################################   INSTAGRAM  VIDEOFILE########################################

else if (message.body.startsWith(".insta") && !start) {
    try {
        const url = message.body.split(" ")[1];
        if(!url.startsWith("https://www.instagram.com/") && !url.startsWith("https://instagram.com/")){
            message.reply("Enter a valid instagram url!!")
            return;
        }
         const processingMessage=await message.reply("Processing your request.....🔴");
         const dataList = await instagramDl(url);
        dataList.map(async (data)=>{
            if (dataList) {
            const thumbBuffer = await MessageMedia.fromUrl(data.download_link, { unsafeMime: true });
                 thumbBuffer.mimeType = 'video/mp4';
                 thumbBuffer.filename = `thumbnail${Math.floor(Math.random() * 8500)}`;
                 await client.sendMessage(message.from, thumbBuffer);
            
            } else {
                await message.reply("Invalid or unsupported Instagram link.");
            }
        });
        await processingMessage.edit("Your request has been completed successfully!!🟢");
       
    } catch (error) {
        console.error("Error processing Instagram link:", error);
        await message.reply("An error occurred while processing the Instagram link.Try using the command .link<space>Your_Link");
    }
}


//########################        FOR INSTA  LINKS         ################################

else if(message.body.startsWith(".link") && !start){
    try {
        const url = message?.body?.split(" ")[1];
        if(!url.startsWith("https://www.instagram.com/") && !url.startsWith("https://instagram.com/")){
            message.reply("Enter a valid instagram url!!") 
            return;
        }
         const processingMessage=await message.reply("Processing your request.....🔴");
         const dataList = await instagramDl(url);
         console.log(dataList)

         await Promise.all(dataList.map(async (data) => {
             const thumblink = data.thumbnail_link;
             if (validUrlPattern.test(thumblink)) {
                 const thumbBuffer = await MessageMedia.fromUrl(thumblink, { unsafeMime: true });
                 thumbBuffer.mimeType = 'image/jpeg';
                 thumbBuffer.filename = `thumbnail${Math.floor(Math.random() * 8500)}`;
                 await client.sendMessage(message.from, thumbBuffer, { caption: data.download_link });
             } 
             
             else {

                 client.sendMessage(message.from, "No thumbnail available fo this file " + data.download_link);
             }
         }));
       
         await processingMessage.edit("Your request has been completed successfully!!🟢");
    } catch (error) {
        console.error("Error processing Instagram link:", error);
        await message.reply("An error occurred while processing the Instagram link.Try using the command .insta<space>Your_Link");
    }
}

else if(message.body.startsWith(".tts")){
    const text=message.body.slice(4);
    const media=await fetchBuffData(text);
    client.sendMessage(message.from,new MessageMedia("audio/webp",media, `${text}.mp3`),{sendMediaAsDocument:true,quotedMessageId:mId})

}
});

client.initialize();

 
 