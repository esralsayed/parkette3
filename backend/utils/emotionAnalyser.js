// utils/emotionAnalyzer.js

const ALERT_EMOTIONS = ["fear", "sadness", "anger", "disgust"];
const SEVERITY_THRESHOLD = 0.65;
const ML_SIDECAR_URL = "http://127.0.0.1:5001";

export async function classifyEmotion(text) {
  const response = await fetch(`${ML_SIDECAR_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ML sidecar error: ${err}`);
  }

  return await response.json(); // [{ label, score }, ...]
}

export function extractText(content) {
  if (!content) return "";
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((block) => block.text || block.content || block.value || "")
      .join(" ")
      .trim();
  }
  if (typeof content === "object") {
    return (content.text || content.body || content.content || "").trim();
  }
  return "";
}

export function assessSeverity(emotions) {
  const sorted = [...emotions].sort((a, b) => b.score - a.score);
  const top = sorted[0];

  const isConcerning = ALERT_EMOTIONS.includes(top.label.toLowerCase());
  const isHighConfidence = top.score >= SEVERITY_THRESHOLD;

  let severity = "low";
  if (isConcerning && isHighConfidence) severity = "high";
  else if (isConcerning) severity = "medium";

  return {
    severity,
    shouldAlert: severity === "high",
    topEmotion: top.label,
    confidence: top.score,
    allEmotions: sorted,
  };
}

export async function checkSidecarHealth() {
  try {
    const res = await fetch(`${ML_SIDECAR_URL}/health`);
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}