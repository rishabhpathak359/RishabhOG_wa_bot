const fetch=require('node-fetch') 
async function fetchBuffData(text){
  console.log(text)
  const response=await fetch(`http://api.voicerss.org/?key=ad2e930414774a4c95486411e610baea&hl=en-us&f=16khz_16bit_stereo&v=Mary&src=${text}`);
  const videoBuffer = await response.buffer()
  if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
  }
  // const filename=`${id+Math.random()}.wav`
//     fs.writeFileSync(filename,voice)
//  console.log(videoBuffer.toString('base64'));
return videoBuffer.toString("base64")
}
module.exports = {fetchBuffData}


  