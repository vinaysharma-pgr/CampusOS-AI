import fs from "node:fs";

const path = "src/features/ai-assistant/components/AIChatDrawer.jsx";
let c = fs.readFileSync(path, "utf8");

const NEW_SEND = `  const send = async (text) => {
    const t = (text ?? input).trim();
    if (!t || thinking) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: t }]);
    setThinking(true);

    console.log("Calling Gemini:", t);

    try {
      const res = await chatWithAI(t);
      console.log("Gemini reply:", res);
      setMessages((prev) => [...prev, { role: "assistant", text: res.text, actions: res.actions || [] }]);
    } catch (err) {
      console.error("Gemini failed, falling back:", err.response?.status, err.response?.data?.message || err.message);
      const fallback = getAIResponse(t);
      setMessages((prev) => [...prev, { role: "assistant", text: fallback.text, actions: fallback.actions }]);
    } finally {
      setThinking(false);
    }
  };`;

// Match the send function — from `const send = async (text) => {` to the closing `};`
const re = /const send = async \(text\) => \{[\s\S]*?\n  \};/;

if (!c.includes("Calling Gemini")) {
  c = c.replace(re, NEW_SEND);
  fs.writeFileSync(path, c, "utf8");
  console.log("REPLACED");
} else {
  console.log("Already patched");
}