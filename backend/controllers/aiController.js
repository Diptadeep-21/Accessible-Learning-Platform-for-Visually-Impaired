const { generateAIResponse } = require("../services/aiService");

const processAI = async (req, res) => {
  try {

    const { content, action } = req.body;

    if (!content || !action) {
      return res.status(400).json({
        success: false,
        message: "Content and action are required"
      });
    }

    let prompt = "";

    if (action === "summarize") {
      prompt = `Summarize this module in short spoken sentences:\n${content}`;
    }

    else if (action === "simple") {
      prompt = `Explain this in very simple terms for a beginner:\n${content}`;
    }

    else if (action === "example") {
      prompt = `Give a real-world example for this concept:\n${content}`;
    }

    const aiResponse = await generateAIResponse(prompt);

    res.json({
      success: true,
      data: aiResponse
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { processAI };