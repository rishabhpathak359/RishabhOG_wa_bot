const fetch=require('node-fetch') 
async function fetchBuffData(url){
  console.log(url)
  const response=await fetch(url);
  const videoBuffer = await response.buffer()
  if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
  }
  // const filename=`${id+Math.random()}.wav`
//     fs.writeFileSync(filename,voice)
//  console.log(videoBuffer.toString('base64'));
return videoBuffer
}
module.exports = {fetchBuffData}


  