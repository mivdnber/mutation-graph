const express = require('express');
const ws = require('express-ws');
const db = require('./db');

const expressWs = ws(express());
const app = expressWs.app;

app.use('/public', express.static('public'))
app.use('/qr', express.static('node_modules/qrcode-generator'))

app.ws('/feed', (ws, req) => {
  
});

const feedWss = expressWs.getWss('/feed');
const broadcast = message => {
  feedWss.clients.forEach(client => {
    client.send(JSON.stringify(message));
  });
};

app.get('/viz', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.get('/scan/:userId', (req, res) => {
  res.sendFile('scan.html', { root: 'public' });
});

app.post('/api/:userId/scan/:target', async (req, res) => {
  const link = await db.createLink(req.params.userId, req.params.target);
  broadcast(link);
  res.send(JSON.stringify(link));
});

app.get('/viz/data', async (req, res) => {
  const [nodes, links] = await Promise.all([
    db.getNodes(),
    db.getLinks(),
  ]);
  res.send(JSON.stringify({ nodes, links }));
});

app.listen(process.env.PORT || 3000)