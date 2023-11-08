const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const mime = require('mime-types');
const fetch=require('node-fetch')
const ytdl = require('ytdl-core');
const instagramDl = require("@sasmeee/igdl");

 const mykey="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"
 const validUrlPattern = /^https?:\/\/.+/i;

const client = new Client({
    authStrategy: new LocalAuth(), 
    puppeteer: {
     executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    }
});

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
    const response=await fetch(url);
    const videoBuffer = await response.buffer()
    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }
    return videoBuffer;
}


client.on('message', async message => {
    console.log(message.body);
    if (message.body === "/video") {
        // Replace with the actual path to your file
        const internalMediaPath = 'internal.jpeg';
        const fileMimeType = mime.lookup(internalMediaPath);
        console.log(fileMimeType);
        const media = MessageMedia.fromFilePath('internal.jpeg');
        console.log(media);
        client.sendMessage(message.from,media,{sendMediaAsSticker:true});

        //Downloading media
    } else if (message.hasMedia) {
        const media = await message.downloadMedia();
        if (typeof media.data === 'string') {
            const mediaPath = `image.${media.mimetype.split('/')[1]}`;
            const data = Buffer.from(media.data, 'base64');
            fs.writeFile(mediaPath, data, err => {
                if (err) { 
                    console.error("Failed to save file:", err);
                } else {
                    console.log("Received media file saved successfully.");
                }
            });
            client.sendMessage(message.from,media,{sendMediaAsSticker:true});
        } 
        else {
            console.error('Received media data is not a string:', media.data);
        }
    }

    
    else if (message.body === "/s") {
        message.delete(true).then(() => {
            console.log("Message deleted for everyone.");
        }).catch(err => {
            console.error("Failed to delete message:", err);
        });
    }
    else if(message.body=="/e"){
        
       message.react("🥲");
    }


//  #################################  YOUTUBE-MP4-YTDL ########################################


   else if (message.body.startsWith('https://www.youtube.com') || message.body.startsWith('https://youtu.be')) { 
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

    else if(message.body.startsWith(".mp4")) {
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


else if(message.body.startsWith(".mp3")){
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

else if (message.body.startsWith(".insta")) {
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

else if(message.body.startsWith(".link")){
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
});

client.initialize();


 