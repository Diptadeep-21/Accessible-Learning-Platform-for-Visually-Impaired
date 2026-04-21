const express = require("express");
const router = express.Router();
const { processAI } = require("../controllers/aiController");

router.post("/process", processAI);

module.exports = router;