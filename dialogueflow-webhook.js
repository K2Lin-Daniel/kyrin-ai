const express = require("express");
require("actions-on-google")
// require('dotenv').config();
const axios = require('axios');
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express();
app.post("/dialogflow", express.json(), (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });
    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Default Fallback Intent", queryGPT);
    agent.handleRequest(intentMap);
  
    function welcome(agent) {
      agent.add('Hi! Kyrin chat AI Gen2 desu!');
  }
  
  async function queryGPT(agent) {
      // agent.add('Sorry! I am unable to understand this at the moment. I am still learning humans. You can pick any of the service that might help me.');
      const instance = axios.create({
        baseURL: 'https://api.openai.com/v1/',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      });
    
      const dialog = [
        `Hi! Kyrin chat AI Gen2 desu!`,
      ];
      let query = agent.query;
      console.log('querytext ', query)
      dialog.push(`User: ${query}`);
      dialog.push('AI:');
      // agent.add(`you said ${query}`)
    
      const completionParmas = {
        prompt: dialog.join('\n'),
        max_tokens: 60,
        temperature: 0.85,
        n: 1,
        stream: false,
        logprobs: null,
        echo: false,
        stop: '\n',
      };
    
      try {
        const result = await instance.post('/engines/davinci/completions', completionParmas);
        const botResponse = result.data.choices[0].text.trim();
        agent.add(botResponse);
      } catch (err) {
        console.log(err);
        agent.add('Sorry. Something went wrong. Can you say that again?');
      }
    
  }
});
const port = 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`))
