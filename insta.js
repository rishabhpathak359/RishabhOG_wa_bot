const instagramDl = require("@sasmeee/igdl");
const { MessageMedia } = require('whatsapp-web.js');
async function getInstaData(message,client,validUrlPattern){
    const url = message?.body?.split(" ")[1];
    try {
        if(!url.startsWith("https://www.instagram.com/") && !url.startsWith("https://instagram.com/")){
            message.reply("Enter a valid instagram url!!") 
            return;
        }
         const processingMessage=await message.reply("Processing your request.....🔴");
         const dataList = await instagramDl(url);

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

async function getInstaVid(message,client){
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
module.exports={getInstaData,getInstaVid}