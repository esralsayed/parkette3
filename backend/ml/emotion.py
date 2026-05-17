from flask import Flask, request, jsonify
from transformers import pipeline
import sys

app = Flask(__name__)

print("Loading emotion model...", flush=True)
classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None         # returns all emotion scores, not just the top one
)
print("Model ready.", flush=True)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({ "status": "ok" })

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = data.get("text", "").strip()

    if not text:
        return jsonify({ "error": "No text provided" }), 400

    if len(text) > 512:       # distilroberta token limit
        text = text[:512]

    results = classifier(text)
    return jsonify(results[0])  # [{ label, score }, ...]

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=False)