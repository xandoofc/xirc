const express = require("express");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();

app.use(express.json());

const signalingData = { peers: {} };

router.post("/register", (req, res) => {
  const { peerId, sdp, type } = req.body;
  if (!peerId || !sdp || !type) {
    return res.status(400).json({ error: "peerId, sdp e type são obrigatórios" });
  }
  if (!signalingData.peers[peerId]) signalingData.peers[peerId] = {};
  if (type === "offer") signalingData.peers[peerId].offer = { sdp, type };
  else if (type === "answer") signalingData.peers[peerId].answer = { sdp, type };
  res.json({ message: `Peer ${peerId} registrado com sucesso` });
});

router.get("/sdp/:peerId", (req, res) => {
  const { peerId } = req.params;
  const { type } = req.query;
  if (!signalingData.peers[peerId]) {
    return res.status(404).json({ error: `Peer ${peerId} não encontrado` });
  }
  const sdpData = signalingData.peers[peerId][type];
  if (!sdpData) {
    return res.status(404).json({ error: `${type} não disponível para peer ${peerId}` });
  }
  res.json(sdpData);
});

router.get("/peers", (req, res) => {
  const peerIds = Object.keys(signalingData.peers);
  res.json({ peers: peerIds });
});

app.use("/.netlify/functions/signaling", router);
module.exports.handler = serverless(app);
