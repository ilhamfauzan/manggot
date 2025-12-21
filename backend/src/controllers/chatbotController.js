import { GoogleGenerativeAI } from "@google/generative-ai";

export const chatWithGemini = async (req, res) => {
  try {
    // Android sends "question", not "message"
    const { question, history } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, message: "Pertanyaan tidak boleh kosong" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: "API Key Gemini belum dikonfigurasi" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = `
      Kamu adalah "WeBot", asisten AI ahli budidaya maggot (larva lalat tentara hitam) untuk aplikasi "WeGot".
      
      Tugasmu:
      1. Menjawab pertanyaan seputar budidaya maggot: penetasan telur, pembesaran larva, panen, pengolahan sampah organik, dan masalah umum.
      2. Memberikan solusi praktis, hemat biaya, dan mudah diterapkan.
      
      Gaya Komunikasi:
      - Ramah, menyemangati, dan profesional.
      - Gunakan Bahasa Indonesia yang baik, santai, dan mudah dipahami.
      - Jawaban ringkas dan to the point (maksimal 3-4 kalimat per poin).
      - JANGAN gunakan format markdown atau simbol khusus (*, **, #, - dll).
      - Gunakan angka (1. 2. 3.) untuk list, bukan bullet points.
      - Jangan sebut istilah teknis seperti "BSF" tanpa penjelasan.
    `;

    // Construct chat history
    let chatHistory = [];
    if (history && Array.isArray(history)) {
        chatHistory = history.map(msg => ({
            role: msg.isUser ? "user" : "model",
            parts: [{ text: msg.text }]
        }));
    }

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "model", parts: [{ text: "Siap! Saya WeBot, ahli budidaya Maggot BSF." }] },
        ...chatHistory
      ],
    });

    const result = await chat.sendMessage(question);
    const response = await result.response;
    let text = response.text();

    // ✅ Clean markdown formatting for Android display
    text = text
      .replace(/\*\*\*/g, '')      // Remove bold+italic ***
      .replace(/\*\*/g, '')        // Remove bold **
      .replace(/\*/g, '')          // Remove italic *
      .replace(/___/g, '')         // Remove bold+italic ___
      .replace(/__/g, '')          // Remove bold __
      .replace(/_/g, '')           // Remove italic _
      .replace(/~~(.+?)~~/g, '$1') // Remove strikethrough ~~
      .replace(/`([^`]+)`/g, '$1') // Remove inline code `
      .replace(/^#{1,6}\s+/gm, '') // Remove headers #
      .replace(/^\s*[-*+]\s+/gm, '')  // Remove bullet points - * +
      .replace(/^\s*\d+\.\s+/gm, (match) => match.replace(/^\s*/, '')) // Keep numbers but remove extra spaces
      .trim();

    // Match Android Response format (ChatbotResponse.kt)
    res.json({
      answer: text,
      question: question,
      sources: [],     // Mock empty sources
      tokens_used: 0,  // Mock
      model: "gemini-2.5-flash",
      num_sources: 0
    });

  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ 
      answer: "Maaf, WeBot sedang istirahat sebentar. Coba lagi nanti ya!",
      error: error.message 
    });
  }
};
