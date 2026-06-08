"""
Parkette – Emotion Monitoring Pipeline Evaluator
Tests the distilroberta emotion classifier + severity assessment logic
against labeled diary entries.

Usage:
    pip install transformers torch requests
    python test_emotion.py

    If your Flask sidecar is running on port 5001, set:
    USE_SIDECAR=true python test_emotion.py
"""

import os, json, csv
from transformers import pipeline

USE_SIDECAR = os.environ.get("USE_SIDECAR", "false").lower() == "true"
SIDECAR_URL = "http://127.0.0.1:5001"

ALERT_EMOTIONS    = {"fear", "sadness", "anger", "disgust"}
SEVERITY_THRESHOLD = 0.65

# ── Dataset ────────────────────────────────────────────────────────────────────
# Format: (diary_entry, expected_severity)
# severity: "low" | "medium" | "high"
# "high"   → shouldAlert=True  (top emotion is ALERT + score >= 0.65)
# "medium" → top emotion is ALERT but score < 0.65
# "low"    → top emotion is NOT in ALERT set

DATASET = [
    # ── LOW (happy / neutral) ──────────────────────────────────────────────────
    ("Today was the best day ever! I played with my friends and we laughed so much.", "low"),
    ("I learned how to stay safe near the road today. I feel proud.", "low"),
    ("My pet fish is funny. He blows bubbles at me.", "low"),
    ("I like drawing rainbows in my diary. Today I drew a big one.", "low"),
    ("I got three stars in the game! Mama said she is proud of me.", "low"),
    ("We had pizza for dinner and I ate two slices hehe.", "low"),
    ("Today was okay. I read a book about animals.", "low"),
    ("I am excited for my birthday next week!", "low"),
    ("School was boring but then we had art class which was fun.", "low"),
    ("I made a new friend today. Her name is Sara.", "low"),

    # ── MEDIUM (concerning but below high-confidence threshold) ────────────────
    ("I feel a little scared sometimes when I walk home alone.", "medium"),
    ("I am a bit sad because my friend didn't talk to me today.", "medium"),
    ("I don't really like it when people are mean to me.", "medium"),
    ("Sometimes I feel like nobody wants to play with me.", "medium"),
    ("I am a little worried about the test tomorrow.", "medium"),
    ("I felt angry today but I didn't know why.", "medium"),
    ("My tummy hurts when I think about going to school.", "medium"),
    ("I feel sad when daddy shouts. I don't know what I did wrong.", "medium"),
    ("I am scared of the dark but I don't tell anyone.", "medium"),
    ("Things feel strange and I don't feel like playing.", "medium"),

    # ── HIGH (clear distress signals — should alert parent) ───────────────────
    ("I hate myself. I don't want to exist anymore.", "high"),
    ("Nobody loves me. I wish I could disappear.", "high"),
    ("I am so scared. Someone follows me after school every day.", "high"),
    ("I can't stop crying and I don't know why. Everything hurts.", "high"),
    ("I want to hurt myself because everything is too much.", "high"),
    ("I feel like I am going to die. I am very very scared.", "high"),
    ("Someone touched me and I don't want to say who. I am scared.", "high"),
    ("I don't feel safe at home. Please help me.", "high"),
    ("I hate everything. I smashed my things. I am so angry I can't breathe.", "high"),
    ("Nobody cares if I am here or not. I am so sad all the time.", "high"),
]

# ── Model / Sidecar ────────────────────────────────────────────────────────────
if not USE_SIDECAR:
    print("Loading emotion model locally (first run may download weights)...")
    _classifier = pipeline(
        "text-classification",
        model="j-hartmann/emotion-english-distilroberta-base",
        top_k=None,
    )
    def classify_emotion(text: str):
        results = _classifier(text[:512])
        return results[0]   # [{ label, score }, ...]
else:
    import requests
    def classify_emotion(text: str):
        r = requests.post(
            f"{SIDECAR_URL}/analyze",
            json={"text": text},
            timeout=10,
        )
        r.raise_for_status()
        return r.json()

# ── Severity logic (mirrors your emotionAnalyzer.js) ─────────────────────────
def assess_severity(emotions: list) -> dict:
    sorted_e = sorted(emotions, key=lambda x: x["score"], reverse=True)
    top = sorted_e[0]
    is_concerning    = top["label"].lower() in ALERT_EMOTIONS
    is_high_conf     = top["score"] >= SEVERITY_THRESHOLD
    if is_concerning and is_high_conf:
        severity = "high"
    elif is_concerning:
        severity = "medium"
    else:
        severity = "low"
    return {
        "severity":    severity,
        "shouldAlert": severity == "high",
        "topEmotion":  top["label"],
        "confidence":  top["score"],
    }

# ── Runner ─────────────────────────────────────────────────────────────────────
def run():
    results = []
    correct = 0

    print(f"\n{'─'*60}")
    print(f"  Parkette Emotion Monitoring — {len(DATASET)} diary entries")
    mode = "sidecar" if USE_SIDECAR else "local model"
    print(f"  Mode: {mode}")
    print(f"{'─'*60}\n")

    for i, (entry, expected) in enumerate(DATASET, 1):
        print(f"[{i:02d}/{len(DATASET)}] {entry[:55]!r}...")
        emotions = classify_emotion(entry)
        assessment = assess_severity(emotions)
        pred = assessment["severity"]
        ok   = pred == expected
        if ok:
            correct += 1
        status = "✓" if ok else f"✗  (predicted: {pred})"
        print(f"       expected={expected:<8}  top={assessment['topEmotion']:<10} conf={assessment['confidence']:.2f}  {status}")
        results.append({
            "entry":       entry[:80],
            "expected":    expected,
            "predicted":   pred,
            "correct":     ok,
            "topEmotion":  assessment["topEmotion"],
            "confidence":  round(assessment["confidence"], 4),
            "shouldAlert": assessment["shouldAlert"],
        })

    # ── Metrics ────────────────────────────────────────────────────────────────
    accuracy = correct / len(DATASET) * 100
    levels = ["low", "medium", "high"]

    print(f"\n{'─'*60}")
    print(f"  Overall Accuracy: {correct}/{len(DATASET)}  ({accuracy:.1f}%)")
    print(f"{'─'*60}")

    for level in levels:
        tp = sum(1 for r in results if r["expected"] == level and r["predicted"] == level)
        fp = sum(1 for r in results if r["expected"] != level and r["predicted"] == level)
        fn = sum(1 for r in results if r["expected"] == level and r["predicted"] != level)
        precision = tp / (tp + fp) if (tp + fp) else 0
        recall    = tp / (tp + fn) if (tp + fn) else 0
        f1        = 2 * precision * recall / (precision + recall) if (precision + recall) else 0
        print(f"  {level:<8}  P={precision:.2f}  R={recall:.2f}  F1={f1:.2f}")

    # ── Special: false-negative rate for HIGH (missed alerts) ─────────────────
    high_cases = [r for r in results if r["expected"] == "high"]
    missed     = [r for r in high_cases if not r["correct"]]
    print(f"\n  ⚠ Missed high-severity alerts: {len(missed)}/{len(high_cases)}")
    for r in missed:
        print(f"    → predicted '{r['predicted']}': {r['entry'][:60]!r}")

    # ── Save CSV ───────────────────────────────────────────────────────────────
    out = "emotion_results.csv"
    with open(out, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["entry","expected","predicted","correct","topEmotion","confidence","shouldAlert"])
        w.writeheader()
        w.writerows(results)
    print(f"\n  Detailed results saved → {out}\n")

if __name__ == "__main__":
    run()
