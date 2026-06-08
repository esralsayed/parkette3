"""
Parkette – Recommendation Engine Evaluator (v2 — dynamic similarity)
Tests the full recommendation pipeline end-to-end:
  1. Computes similarityToCompleted dynamically per test case
     using the exact same function as your backend (computeSimilarityScore)
  2. Passes computed candidates to Groq llama-3.3-70b-versatile
  3. Validates the pick against expected output

This version tests the FULL pipeline, not just Groq rule-following.

Usage:
    GROQ_API_KEY=gsk-... python test_recommendation.py
"""

import os, json, csv, time
import requests
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.environ["GROQ_API_KEY"]
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"

# ── Real candidate pool (from Atlas) ──────────────────────────────────────────
# similarityToCompleted is NOT set here — computed dynamically per test case
# using compute_similarity() which mirrors your backend computeSimilarityScore()

LEVEL_POOL = [
    {
        "id": "69de77366b79e2798e6ea7ff",
        "title": "Stranger in the park",
        "skills": ["stranger safety","trusted adult","decision making","boundary awareness"],
        "difficulty": "medium", "difficultyScore": 2,
        "environment": "park", "emotionalTheme": "trust",
        "ageRange": ["7-10"], "orderNumber": 2,
        "onCooldown": False,
    },
    {
        "id": "69de7edeb72020c93f2995a2",
        "title": "Equipment safety",
        "skills": ["decision making","hazard identification","peer safety"],
        "difficulty": "easy", "difficultyScore": 1,
        "environment": "park", "emotionalTheme": "attentive, focus",
        "ageRange": ["7-10"], "orderNumber": 1,
        "onCooldown": False,
    },
    {
        "id": "69fde0eaf6b5e57336dca3b3",
        "title": "Opening the door",
        "skills": ["stranger safety","trusted adult","home safety","decision making"],
        "difficulty": "medium", "difficultyScore": 2,
        "environment": "home", "emotionalTheme": "fear, trust",
        "ageRange": ["5-10"], "orderNumber": 1,
        "onCooldown": False,
    },
    {
        "id": "69fde5d5f6b5e57336dca3b4",
        "title": "Fire in the Kitchen!",
        "skills": ["fire safety","emergency response","decision making","evacuation"],
        "difficulty": "hard", "difficultyScore": 3,
        "environment": "home", "emotionalTheme": "fear, courage, calm",
        "ageRange": ["8-10"], "orderNumber": 2,
        "onCooldown": False,
    },
    {
        "id": "69fde888f6b5e57336dca3b5",
        "title": "Stay Away from Sockets!",
        "skills": ["electrical safety","hazard identification","home safety"],
        "difficulty": "hard", "difficultyScore": 3,
        "environment": "home", "emotionalTheme": "caution",
        "ageRange": ["5-10"], "orderNumber": 3,
        "onCooldown": False,
    },
    {
        "id": "6a10942f61d9d38caea760ef",
        "title": "Fire Safety at School",
        "skills": ["fire safety","following instructions","emergency response"],
        "difficulty": "medium", "difficultyScore": 2,
        "environment": "school", "emotionalTheme": "calmness",
        "ageRange": ["5-7"], "orderNumber": 3,
        "onCooldown": False,  # set per test case
    },
    {
        "id": "69fdeaabf6b5e57336dca3b8",
        "title": "Walking in the Hallway",
        "skills": ["following rules","safe movement","listening"],
        "difficulty": "easy", "difficultyScore": 1,
        "environment": "school", "emotionalTheme": "awareness",
        "ageRange": ["5-7"], "orderNumber": 1,
        "onCooldown": False,
    },
    {
        "id": "6a10946661d9d38caea760f0",
        "title": "Crossing the Road After School",
        "skills": ["road safety","awareness","decision making"],
        "difficulty": "easy", "difficultyScore": 1,
        "environment": "school", "emotionalTheme": "confidence",
        "ageRange": ["5-7"], "orderNumber": 2,
        "onCooldown": False,
    },
]

VALID_IDS    = {l["id"] for l in LEVEL_POOL}
COOLDOWN_IDS = {l["id"] for l in LEVEL_POOL if l["onCooldown"]}

# ── Similarity function — exact port of your backend computeSimilarityScore ───
def compute_similarity(completed, candidate):
    """
    Mirrors computeSimilarityScore() in your backend exactly:
      skill overlap  → up to 70 pts  (dominant signal)
      environment    → up to  5 pts
      emotional theme→ up to  5 pts
      age range      → up to 10 pts
    Max possible: 90 pts
    """
    score = 0

    completed_skills  = completed.get("skills", [])
    candidate_skills  = candidate.get("skills", [])

    # Skill overlap — 70 pts
    shared       = [s for s in completed_skills if s in candidate_skills]
    overlap_ratio = len(shared) / max(len(completed_skills), 1)
    score += overlap_ratio * 70

    # Environment — 5 pts
    if completed.get("environment") == candidate.get("environment"):
        score += 5

    # Emotional theme — 5 pts
    if completed.get("emotionalTheme") == candidate.get("emotionalTheme"):
        score += 5

    # Age range — 10 pts
    completed_ages = completed.get("ageRange", [])
    candidate_ages = candidate.get("ageRange", [])
    if any(a in candidate_ages for a in completed_ages):
        score += 10

    return round(score)

# ── Build candidate list for a given completed level ─────────────────────────
def build_candidates(completed_level_id, completed_level,
                     cooldown_ids=None, routing_type="next",
                     completed_difficulty_score=2,
                     completed_chapter_env=None,
                     completed_order=None):
    cooldown_ids = cooldown_ids or set()
    candidates = []
    for level in LEVEL_POOL:
        if level["id"] == completed_level_id:
            continue
        if level["id"] in cooldown_ids:
            continue
        if routing_type == "challenge":
            if level["difficultyScore"] <= completed_difficulty_score:
                continue
        sim = compute_similarity(completed_level, level)
        candidates.append({**level, "similarityToCompleted": sim})

    # For next routing: prioritise same environment + higher order
    if routing_type == "next" and completed_chapter_env:
        same_chapter = [c for c in candidates
                        if c["environment"] == completed_chapter_env
                        and c["orderNumber"] > (completed_order or 0)]
        if same_chapter:
            # Sort by order within chapter
            same_chapter.sort(key=lambda x: x["orderNumber"])
            return same_chapter[:3]

    candidates.sort(key=lambda x: x["similarityToCompleted"], reverse=True)
    return candidates

# ── Test cases ────────────────────────────────────────────────────────────────
# completed_level_id: the level the child just finished (excluded from candidates)
# completed_level: its tags (used to compute similarity against all others)
# expected_id: what the full pipeline SHOULD recommend

# why still scores are written not derived ? 
# expected reasoning is derived from running compute_similarity() manually

DATASET = [
    {
        "id": "case_01",
        "description": "Weak decision making after Equipment Safety → retry → "
                       "Stranger in park scores highest (shared: decision making)",
        "completed_level_id": "69de7edeb72020c93f2995a2",
        "completed_level": {
            "skills": ["decision making","hazard identification","peer safety"],
            "difficulty": "medium", "difficultyScore": 2,
            "environment": "park", "emotionalTheme": "attentive, focus",
            "ageRange": ["7-10"],
        },
        "weak_skills": [("decision making", 0.18), ("hazard identification", 0.30)],
        "routing_type": "retry",
        "cooldown_ids": set(),  # no recent levels on cooldown
        # Stranger in park shares decision making, same env (park), same age range → highest sim
        "expected_id": "69de77366b79e2798e6ea7ff",
    },
    {
        "id": "case_02",
        "description": "Strong child after Stay Away from Sockets → challenge → "
                       "Fire in Kitchen is only hard level not on cooldown",
        "completed_level_id": "69fde888f6b5e57336dca3b5",
        "completed_level": {
            "skills": ["electrical safety","hazard identification","home safety"],
            "difficulty": "easy", "difficultyScore": 1,
            "environment": "home", "emotionalTheme": "caution",
            "ageRange": ["5-10"],
        },
        "weak_skills": [],
        "routing_type": "challenge",
        "cooldown_ids": set(),
        # Fire in Kitchen: only difficultyScore=3, not on cooldown
        "expected_id": "69fde5d5f6b5e57336dca3b4",
    },
    {
        "id": "case_03",
        "description": "Normal progression after Walking in Hallway → next → "
                       "Crossing Road is next orderNumber in school chapter",
        "completed_level_id": "69fdeaabf6b5e57336dca3b8",
        "completed_level": {
            "skills": ["following rules","safe movement","listening"],
            "difficulty": "easy", "difficultyScore": 1,
            "environment": "school", "emotionalTheme": "awareness",
            "ageRange": ["5-7"],
        },
        "completed_order": 1,
        "weak_skills": [("following rules", 0.40)],
        "routing_type": "next",
        "cooldown_ids": set(),
        # Crossing Road: same chapter (school), orderNumber 2, not on cooldown
        "expected_id": "6a10946661d9d38caea760f0",
    },
    {
        "id": "case_04",
        "description": "Cooldown avoidance — Fire Safety at School recently played → "
                       "retry after Fire in Kitchen → must not pick Fire Safety at School",
        "completed_level_id": "69fde5d5f6b5e57336dca3b4",
        "completed_level": {
            "skills": ["fire safety","emergency response","decision making","evacuation"],
            "difficulty": "hard", "difficultyScore": 3,
            "environment": "home", "emotionalTheme": "fear, courage, calm",
            "ageRange": ["8-10"],
        },
        "weak_skills": [("fire safety", 0.15), ("emergency response", 0.20)],
        "routing_type": "retry",
        # Child recently played Fire Safety at School → it is on cooldown for this session
        # Fire Safety at School shares fire safety + emergency response BUT on cooldown
        # Opening the door: shares decision making + home environment → next best not on cooldown
        "cooldown_ids": {"6a10942f61d9d38caea760ef"},
        "expected_id": "69fde0eaf6b5e57336dca3b3",
    },
    {
        "id": "case_05",
        "description": "Weak stranger safety after Opening the Door → retry → "
                       "Stranger in park shares stranger safety + trusted adult",
        "cooldown_ids": set(),
        "completed_level_id": "69fde0eaf6b5e57336dca3b3",
        "completed_level": {
            "skills": ["stranger safety","trusted adult","home safety","decision making"],
            "difficulty": "medium", "difficultyScore": 2,
            "environment": "home", "emotionalTheme": "fear, trust",
            "ageRange": ["5-10"],
        },
        "weak_skills": [("stranger safety", 0.12), ("trusted adult", 0.25)],
        "routing_type": "retry",
        # Stranger in park shares stranger safety + trusted adult + decision making → highest sim
        "expected_id": "69de77366b79e2798e6ea7ff",
    },
    {
        "id": "case_06",
        "description": "Challenge after Stranger in park → only hard level available "
                       "is Fire in Kitchen",
        "cooldown_ids": set(),
        "completed_level_id": "69de77366b79e2798e6ea7ff",
        "completed_level": {
            "skills": ["stranger safety","trusted adult","decision making","boundary awareness"],
            "difficulty": "medium", "difficultyScore": 2,
            "environment": "park", "emotionalTheme": "trust",
            "ageRange": ["7-10"],
        },
        "weak_skills": [],
        "routing_type": "challenge",
        # Fire in Kitchen: only difficultyScore=3 available, not on cooldown
        "expected_id": "69fde5d5f6b5e57336dca3b4",
    },
    {
        "id": "case_07",
        "description": "Next after Crossing Road → Fire Safety at School recently played → "
                       "on cooldown → must fall back to next available",
        "cooldown_ids": {"6a10942f61d9d38caea760ef"},  # Fire Safety at School recently played
        "completed_level_id": "6a10946661d9d38caea760f0",
        "completed_order": 2,
        "completed_level": {
            "skills": ["road safety","awareness","decision making"],
            "difficulty": "easy", "difficultyScore": 1,
            "environment": "school", "emotionalTheme": "confidence",
            "ageRange": ["5-7"],
        },
        "weak_skills": [("awareness", 0.35)],
        "routing_type": "next",
        # Fire Safety at School is next (orderNumber 3) but on cooldown
        # Walking in Hallway is orderNumber 1, already completed — fallback to highest sim
        # Equipment safety shares decision making, available
        "expected_id": "69de7edeb72020c93f2995a2",
    },
    {
        "id": "case_08",
        "description": "Weak hazard identification after Stay Away from Sockets → retry → "
                       "Equipment safety shares hazard identification",
        "completed_level_id": "69fde888f6b5e57336dca3b5",
        "completed_level": {
            "skills": ["electrical safety","hazard identification","home safety"],
            "difficulty": "easy", "difficultyScore": 1,
            "environment": "home", "emotionalTheme": "caution",
            "ageRange": ["5-10"],
        },
        "weak_skills": [("hazard identification", 0.10)],
        "routing_type": "retry",
        "cooldown_ids": set(),
        # Opening the door has highest similarity (38pt, shares home safety + age range)
        # Equipment safety is lower sim (23pt) but directly covers hazard identification
        # This is an intentional ambiguous case — tests whether Groq prioritises
        # skill coverage over raw similarity for retry routing
        # Both are acceptable; we mark Opening the door as expected (highest sim)
        # but note Equipment safety as also valid
        "expected_id": "69fde0eaf6b5e57336dca3b3",
    },
    {
    "id": "case_09",
    "description": "Challenge after Fire Safety at School → two hard levels available "
                   "→ Fire in Kitchen scores higher similarity than Stay Away from Sockets",
    "completed_level_id": "6a10942f61d9d38caea760ef",
    "completed_level": {
        "skills": ["fire safety","following instructions","emergency response"],
        "difficulty": "medium", "difficultyScore": 2,
        "environment": "school", "emotionalTheme": "calmness",
        "ageRange": ["5-7"],
    },
    "weak_skills": [],
    "routing_type": "challenge",
    "cooldown_ids": set(),
    # Two hard levels available: Fire in Kitchen and Stay Away from Sockets
    # Fire in Kitchen shares fire safety + emergency response → higher similarity
    # Stay Away from Sockets shares nothing with fire safety skills → lower similarity
    # Expected: Fire in Kitchen as highest similarity hard level
    "expected_id": "69fde5d5f6b5e57336dca3b4",
},
]

# ── Groq call ──────────────────────────────────────────────────────────────────
GROQ_SYSTEM = "You are an educational routing AI. Return only valid JSON. No markdown. No extra text."

def call_groq(weak_skills, completed_level, candidates, routing_type):
    prompt = f"""
You are a children's educational AI advisor.
Routing type already decided: {routing_type.upper()}
CHILD'S WEAK SKILLS: {', '.join(f"{k} ({v:.2f})" for k,v in weak_skills) or 'none'}
LEVEL JUST COMPLETED:
{json.dumps(completed_level, indent=2)}
CANDIDATES (pick from this list only, ranked by similarity):
{json.dumps(candidates, indent=2)}
Rules:
- Pick the candidate with the highest similarityToCompleted
- For retry: prefer levels that cover the child's weak skills
- For challenge: prefer harder levels (higher difficultyScore)
- For next: prefer higher orderNumber in same environment; if none available pick highest similarity
- Never pick a level where onCooldown is true
Respond with ONLY this JSON, no markdown:
{{
  "recommendedLevelId": "<id from candidates only>",
  "type": "{routing_type}",
  "reason": "<one sentence, child-friendly explanation for the parent>"
}}
""".strip()

    try:
        resp = requests.post(
            GROQ_URL,
            headers={"Content-Type":"application/json","Authorization":f"Bearer {GROQ_API_KEY}"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role":"system","content":GROQ_SYSTEM},
                    {"role":"user","content":prompt},
                ],
                "temperature": 0.2,
                "max_tokens": 150,
            },
            timeout=30,
        )
        resp.raise_for_status()
        raw     = resp.json()["choices"][0]["message"]["content"]
        cleaned = raw.replace("```json","").replace("```","").strip()
        return json.loads(cleaned)
    except Exception as e:
        print(f"  [Groq error] {e}")
        return None

# ── Runner ─────────────────────────────────────────────────────────────────────
def run():
    results  = []
    correct = no_halluc = no_cooldown = 0

    print(f"\n{'─'*65}")
    print(f"  Parkette Recommendation Engine v2 — {len(DATASET)} profiles")
    print(f"  Similarity computed dynamically per test case")
    print(f"{'─'*65}\n")

    for i, case in enumerate(DATASET, 1):
        print(f"[{i:02d}/{len(DATASET)}] {case['id']} — {case['routing_type'].upper()}")
        print(f"       {case['description']}")

        # ── Compute similarity dynamically ────────────────────────────────────
        candidates = build_candidates(
            case["completed_level_id"],
            case["completed_level"],
            case.get("cooldown_ids", set()),
            case["routing_type"],
            case["completed_level"].get("difficultyScore", 2),
            case["completed_level"].get("environment"),
            case.get("completed_order"),
        )

        # Print top 3 similarity scores so you can verify the function
        print(f"       Top 3 by similarity:")
        for c in candidates[:3]:
            print(f"         {c['similarityToCompleted']:>3}pt  {c['title']}"
                  f"{'  [COOLDOWN]' if c['onCooldown'] else ''}")

        rec = call_groq(
            case["weak_skills"],
            case["completed_level"],
            candidates,
            case["routing_type"],
        )

        if rec is None:
            print("       ✗  API call failed\n")
            results.append({
                "case_id": case["id"], "routing_type": case["routing_type"],
                "description": case["description"],
                "expected": case["expected_id"], "predicted": "ERROR",
                "predicted_title": "", "correct": False,
                "from_candidates": False, "cooldown_violation": False,
                "similarity_of_expected": "", "similarity_of_predicted": "",
                "reason": "",
            })
            continue

        pred          = rec.get("recommendedLevelId","")
        from_cands    = pred in VALID_IDS
        cooldown_viol = pred in COOLDOWN_IDS
        match         = pred == case["expected_id"]
        pred_title    = next((c["title"] for c in candidates if c["id"]==pred), "unknown")
        sim_expected  = next((c["similarityToCompleted"] for c in candidates
                              if c["id"]==case["expected_id"]), "N/A")
        sim_predicted = next((c["similarityToCompleted"] for c in candidates
                              if c["id"]==pred), "N/A")

        if from_cands:        no_halluc   += 1
        if not cooldown_viol: no_cooldown += 1
        if match:             correct     += 1

        exp_title = next((c["title"] for c in candidates
                          if c["id"]==case["expected_id"]), case["expected_id"])
        print(f"       expected:  {exp_title}  (sim={sim_expected})")
        print(f"       predicted: {pred_title}  (sim={sim_predicted})")
        print(f"       from candidates: {'✓' if from_cands else '✗ HALLUCINATED'}")
        print(f"       cooldown safe:   {'✓' if not cooldown_viol else '✗ VIOLATION'}")
        print(f"       correct pick:    {'✓' if match else '✗'}")
        print(f"       reason: {rec.get('reason','')[:90]}")
        print()

        results.append({
            "case_id":               case["id"],
            "routing_type":          case["routing_type"],
            "description":           case["description"],
            "expected":              case["expected_id"],
            "expected_title":        exp_title,
            "predicted":             pred,
            "predicted_title":       pred_title,
            "correct":               match,
            "from_candidates":       from_cands,
            "cooldown_violation":    cooldown_viol,
            "similarity_of_expected":  sim_expected,
            "similarity_of_predicted": sim_predicted,
            "reason":                rec.get("reason",""),
        })
        time.sleep(0.5)

    n = len(DATASET)
    print(f"{'─'*65}")
    print(f"  Correct picks:          {correct}/{n}  ({correct/n*100:.1f}%)")
    print(f"  No hallucinations:      {no_halluc}/{n}  ({no_halluc/n*100:.1f}%)")
    print(f"  No cooldown violations: {no_cooldown}/{n}  ({no_cooldown/n*100:.1f}%)")
    print(f"{'─'*65}")

    # ── Per routing type breakdown ─────────────────────────────────────────────
    for rt in ["retry", "next", "challenge"]:
        rt_cases   = [r for r in results if r["routing_type"] == rt]
        rt_correct = sum(1 for r in rt_cases if r["correct"])
        if rt_cases:
            print(f"  {rt:<10} {rt_correct}/{len(rt_cases)}  ({rt_correct/len(rt_cases)*100:.1f}%)")

    out = "recommendation_results.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=results[0].keys())
        w.writeheader()
        w.writerows(results)
    print(f"\n  Results saved → {out}\n")

if __name__ == "__main__":
    run()