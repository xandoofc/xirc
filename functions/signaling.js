const express = require("express");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();

app.use(express.json());

const signalingData = { peers: {} };

console.log("[INFO] Função de sinalização iniciada");

router.post("/register", (req, res) => {
  console.log("[INFO] Requisição POST /register recebida:", req.body);
  const { peerId, sdp, type } = req.body;
  if (!peerId || !sdp || !type) {
    console.log("[ERRO] Dados inválidos no registro:", { peerId, sdp, type });
    return res.status(400).json({ error: "peerId, sdp e type são obrigatórios" });
  }
  if (!signalingData.peers[peerId]) signalingData.peers[peerId] = {};
  if (type === "offer") signalingData.peers[peerId].offer = { sdp, type };
  else if (type === "answer") signalingData.peers[peerId].answer = { sdp, type };
  console.log(`[INFO] Peer ${peerId} registrado com ${type}`);
  res.json({ message: `Peer ${peerId} registrado com sucesso` });
});

router.get("/sdp/:peerId", (req, res) => {
  const { peerId } = req.params;
  const { type } = req.query;
  console.log(`[INFO] Requisição GET /sdp/${peerId}?type=${type}`);
  if (!signalingData.peers[peerId]) {
    console.log(`[ERRO] Peer ${peerId} não encontrado`);
    return res.status(404).json({ error: `Peer ${peerId} não encontrado` });
  }
  const sdpData = signalingData.peers[peerId][type];
  if (!sdpData) {
    console.log(`[ERRO] ${type} não disponível para peer ${peerId}`);
    return res.status(404).json({ error: `${type} não disponível para peer ${peerId}` });
  }
  res.json(sdpData);
});

router.get("/peers", (req, res) => {
  console.log("[INFO] Requisição GET /peers");
  const peerIds = Object.keys(signalingData.peers);
  res.json({ peers: peerIds });
});

app.use("/.netlify/functions/signaling", router);
module.exports.handler = serverless(app);
