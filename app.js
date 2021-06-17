// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
const uuid = require("uuid");
const venom = require("venom-bot");
const dialogflow = require("./dialogflow");

const sessionIds = new Map();

venom
  .create()
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
  client.onMessage(async (message) => {
    setSessionAndUser(message.from);
    let session = sessionIds.get(message.from);
    let payload = await dialogflow.sendToDialogFlow(message.body, session);
    let responses = payload.fulfillmentMessages;
    for (const response of responses) {
      await sendMessageToWhatsapp(client, message, response);
    }
  });
}
function sendMessageToWhatsapp(client, message, response) {
  return new Promise((resolve, reject) => {
    client
      .sendText(message.from, response.text.text[0])
      .then((result) => {
        console.log("Result: ", result); //return object success
        resolve(result);
      })
      .catch((erro) => {
        console.error("Error when sending: ", erro);
        reject(erro);
      });
  });
}

async function setSessionAndUser(senderId) {
  try {
    if (!sessionIds.has(senderId)) {
      sessionIds.set(senderId, uuid.v1());
    }
  } catch (error) {
    throw error;
  }
}
