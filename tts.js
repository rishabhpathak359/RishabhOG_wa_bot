const googleTTS = require('google-tts-api');
const {  MessageMedia } = require('whatsapp-web.js');
async function tts(message,client){
const language=message.body.split(" ")[1]
const quote=await message.getQuotedMessage();
  const text=quote?._data?.body
  googleTTS
  .getAudioBase64(text, {
    lang: language,
    slow: false,
    host: 'https://translate.google.com',
    timeout: 10000,
  })
  .then((res)=>{
    client.sendMessage(message.from,
      new MessageMedia("audio/webp",res, `${text}.mp3`),
      {sendMediaAsDocument:true,quotedMessageId:mId})
  }) // base64 text
  .catch((err)=>{
    console.log(err)
    message.reply("Error-Moye Moye🥲")
  });
}
module.exports={tts};