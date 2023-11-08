const openai = require("openai");

const key = "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";
const client = new openai.Client(key);
const mp3 = await client.audio.speech.create({
    input_text: "Hello, world!",
    voice: "en-US-Brian",
  });
  