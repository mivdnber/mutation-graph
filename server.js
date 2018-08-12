const express = require('express');
const ws = require('express-ws');

const expressWs = ws(express());
const app = expressWs.app;

app.use(express.static('public'))

app.ws('/feed', (ws, req) => {
  
});

const feedWss = expressWs.getWss('/feed');
const broadcast = message => {
  feedWss.clients.forEach(client => {
    client.send(JSON.stringify(message));
  });
}

app.get('/', (req, res) => {
  res.sendFile('public/index.html');
})

app.post('/api/:userId/scan/:target', (req, res) => {
  broadcast({ source: req.params.userId, target: req.params.target });
  res.send('ok');
})

// setInterval(() => {
//   broadcast('hello');
// }, 5000);

app.listen(3000)