"""
Parkette – Adaptive Simplification Pipeline Evaluator
Uses real Parkette levels from MongoDB Atlas.
Tests Groq llama-3.1-8b-instant simplification against the original dialog,
scoring each output on:
  1. Step count preservation
  2. Sentence length reduction
  3. Fields preserved
  4. concept_preserved → fill manually in CSV after running

Usage:
    GROQ_API_KEY=gsk-... python test_simplification.py
"""

import os, json, csv, time, re
import requests
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.environ["GROQ_API_KEY"]
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"

# ── Real Parkette levels (dialog field only, stripped of Mongo metadata) ───────
DATASET = [
    {
        "id": "stranger_in_the_park",
        "safety_concept": "Never go anywhere with a stranger; find a trusted adult",
        "dialog": [
            {"type":"dialog","sceneKey":"park_arrival","text":"look! here are your friends, go play with them.","speaker":"Mom","renderMode":"inline","continuationSteps":[]},
            {"type":"dialog","sceneKey":"park_arrival","text":"Okayy bye mommyy","speaker":"Me","renderMode":"inline","continuationSteps":[]},
            {"type":"dialog","sceneKey":"park_play","text":"Come play hide and seek!","speaker":"Friend","renderMode":"inline","continuationSteps":[]},
            {"type":"dialog","sceneKey":"park_play","text":"Yess let's go! I will count to 10","speaker":"Me","renderMode":"inline","continuationSteps":[]},
            {"type":"task","sceneKey":"null","taskType":"tap_object","gameType":"find_friends","renderMode":"fullscreen",
             "instruction":"Search for your friends and uncover their secret hideout! Spot one? Tap them quick! Find them all to complete the task and win the game!",
             "content":{"friends":[{"name":"omar","emoji":"🧒"},{"name":"noura","emoji":"🧒"}],"randomPositions":True,"objectsInScene":["omar","noura"]},
             "correctFeedback":"Task completed! Good job!","wrongFeedback":"Try again!",
             "continuationSteps":[
                 {"type":"dialog","sceneKey":"park_volleyball","speaker":"Friend","text":"Let's play volleyball!"},
                 {"type":"dialog","sceneKey":"park_volleyball","speaker":"Me","text":"I will go get the ball!"},
                 {"type":"dialog","sceneKey":"park_stranger","speaker":"Stranger","text":"Were you looking for this ball?"},
                 {"type":"narrate","sceneKey":"park_stranger","text":"Stranger kicks the ball"},
                 {"type":"dialog","sceneKey":"park_stranger","speaker":"Stranger","text":"How old are you? I have kids your age!"},
                 {"type":"dialog","sceneKey":"park_stranger","speaker":"Stranger","text":"Want to see their pictures? My car is over there!"},
                 {"type":"task","taskType":"choice","gameType":"choice","renderMode":"inline",
                  "instruction":"He seems nice... what should I do?",
                  "content":{"options":[
                      {"text":"Maybe I will go then ask my mom","correct":False,"continuationSteps":[]},
                      {"text":"He seems okay, I think ill go with him!","correct":False,"continuationSteps":[]},
                      {"text":"This seems strange, let me ask my mother","correct":True,"continuationSteps":[]}
                  ]},
                  "correctFeedback":"Good job! never trust a stranger","wrongFeedback":"","continuationSteps":[]}
             ]}
        ]
    },
    {
        "id": "opening_the_door",
        "safety_concept": "Never open the door to strangers when home alone; call a trusted adult",
        "dialog": [
            {"type":"narrate","sceneKey":"home","text":"You are home alone. Your mother is at the supermarket. When you hear a knock on the door...","renderMode":"inline","continuationSteps":[]},
            {"type":"dialog","sceneKey":"home","text":"Hello? Is anyone home? I have a package for your mom. Can you open the door please?","speaker":"Stranger","renderMode":"inline","continuationSteps":[]},
            {"type":"task","sceneKey":"null","taskType":"choice","gameType":"choice","renderMode":"inline",
             "instruction":"What do you do?",
             "content":{"options":[
                 {"text":"Open the door and take the package","correct":False,"continuationSteps":[]},
                 {"text":"Ignore the knocking completely and hide","correct":False,"continuationSteps":[]},
                 {"text":"Call out \"My mom is busy!\" without opening","correct":True,"continuationSteps":[]},
                 {"text":"Open the door but keep the chain on","correct":False,"continuationSteps":[]}
             ]},
             "correctFeedback":"Great thinking! Never open the door to strangers, even if they seem nice or have a reason.",
             "wrongFeedback":"That's not the safest choice. A stranger is someone you don't know — even if they seem friendly!",
             "continuationSteps":[
                 {"type":"dialog","sceneKey":"home","speaker":"Stranger","text":"Oh okay... can you just open it a tiny bit so I can leave it?"},
                 {"type":"task","taskType":"choice","gameType":"choice","renderMode":"inline",
                  "instruction":"The stranger is still asking. What do you do now?",
                  "content":{"options":[
                      {"text":"Open the door just a little bit","correct":False,"continuationSteps":[]},
                      {"text":"Call Mom or a trusted adult right away","correct":True,"continuationSteps":[]},
                      {"text":"Start crying and do nothing","correct":False,"continuationSteps":[]}
                  ]},
                  "correctFeedback":"Perfect! When a stranger keeps asking, always get a trusted adult involved immediately.",
                  "wrongFeedback":"Even opening the door a little is dangerous. Always call a trusted adult first!",
                  "continuationSteps":[
                      {"type":"narrate","sceneKey":"home","text":"You call Mom. She says \"Good job! I'll call our neighbor to check. Never open the door for strangers."},
                      {"type":"dialog","sceneKey":"home","speaker":"You","text":"I did the right thing! I kept us safe."}
                  ]}
             ]}
        ]
    },
    {
        "id": "fire_in_the_kitchen",
        "safety_concept": "Move away from smoke, don't open hot doors, call 180 or a trusted adult",
        "dialog": [
            {"type":"narrate","sceneKey":"kitchen","text":"You look up from your homework. The kitchen door is closed but you can see smoke coming from under it. The smoke alarm starts beeping loudly.","renderMode":"inline","continuationSteps":[]},
            {"type":"dialog","sceneKey":"kitchen","text":"I smell something burning... the alarm is going off! What do I do?!","speaker":"You","renderMode":"inline","continuationSteps":[]},
            {"type":"task","sceneKey":"null","taskType":"choice","gameType":"choice","renderMode":"inline",
             "instruction":"The smoke alarm is beeping and you see smoke. What is the FIRST thing you do?",
             "content":{"options":[
                 {"text":"Open kitchen door to see what's happening","correct":False,"continuationSteps":[]},
                 {"text":"Move away from the smoke","correct":True,"continuationSteps":[]},
                 {"text":"Grab your toys and run","correct":False,"continuationSteps":[]},
                 {"text":"Wait and see if smoke will go away","correct":False,"continuationSteps":[]}
             ]},
             "correctFeedback":"Smart move! Smoke rises, so staying low gives you cleaner air to breathe.",
             "wrongFeedback":"Never open a door with smoke around it — it can spread the fire fast!",
             "continuationSteps":[
                 {"type":"narrate","sceneKey":"kitchen3","text":"You crouch low and peek carefully around the kitchen from the doorway. The stove caught fire but it hasn't spread yet. You have just a few seconds!"},
                 {"type":"dialog","sceneKey":"kitchen3","speaker":"You","text":"There are things near the stove that could catch fire and make it worse! I need to think fast!"},
                 {"type":"task","taskType":"drag_drop","gameType":"fire_hazard","renderMode":"fullscreen",
                  "instruction":"Drag dangerous items away from fire! before time runs out!",
                  "content":{"items":["towel","wooden spoon","curtain","bottle","paper bag"],"targets":["towel","curtain","bottle"]},
                  "correctFeedback":"Amazing! You cleared all the flammable items. Towels, wood, paper, and spray cans near fire are extremely dangerous!",
                  "wrongFeedback":"Some items were left near the fire! Anything that can burn or explode must be kept far away from flames.",
                  "continuationSteps":[
                      {"type":"narrate","sceneKey":"kitchen4","text":"Good thinking — but the fire is still growing. You remember you're not supposed to fight fires yourself. Time to get out!"},
                      {"type":"task","taskType":"choice","gameType":"choice","renderMode":"inline",
                       "instruction":"You reach the front door. What do you do before opening it?",
                       "content":{"options":[
                           {"text":"Swing it open as fast as possible","correct":False,"continuationSteps":[]},
                           {"text":"Touch the door with the back of your hand to check if it's hot","correct":True,"continuationSteps":[]},
                           {"text":"Kick it open","correct":False,"continuationSteps":[]}
                       ]},
                       "correctFeedback":"Always use the back of your hand — it's more sensitive to heat. If it's hot, don't open it!",
                       "wrongFeedback":"Never rush out without checking — and never go back for more things once the fire is growing!",
                       "continuationSteps":[
                           {"type":"narrate","sceneKey":"kitchen4","text":"The door feels cool. You open it and step outside safely."},
                           {"type":"task","taskType":"choice","gameType":"choice","renderMode":"inline",
                            "instruction":"You are outside. what do you do next?",
                            "content":{"options":[
                                {"text":"Go back inside to get your backpack","correct":False,"continuationSteps":[]},
                                {"text":"Try to put the fire out yourself with water","correct":False,"continuationSteps":[]},
                                {"text":"Call 180 the fire department or find a trusted adult","correct":True,"continuationSteps":[]}
                            ]},
                            "correctFeedback":"Once you're out, stay out! Call emergency services immediately. Or your parents!",
                            "wrongFeedback":"Never go back into a burning building for any reason!",
                            "continuationSteps":[
                                {"type":"narrate","sceneKey":"kitchen5","text":"You called 180 the fire department then you called your mom!"},
                                {"type":"dialog","sceneKey":"kitchen5","speaker":"Mom","text":"I'm so proud of you. You kept the fire from spreading AND got out safely. That's my hero!"}
                            ]}
                       ]}
                  ]}
             ]}
        ]
    },
    {
        "id": "stay_away_from_sockets",
        "safety_concept": "Electrical sockets are dangerous; keep water and metal away from them",
        "dialog": [
            {"type":"narrate","sceneKey":"living_room","text":"You are playing with your toys on the floor. You notice something on the wall — it has little holes in it and looks interesting.","renderMode":"inline","continuationSteps":[]},
            {"type":"dialog","sceneKey":"living_room","text":"Ooooh! What are those little holes in the wall? I want to touch them!","speaker":"You","renderMode":"inline","continuationSteps":[]},
            {"type":"dialog","sceneKey":"living_room","text":"Do you know what that is?","speaker":"Mom","renderMode":"inline","continuationSteps":[]},
            {"type":"task","sceneKey":"null","taskType":"choice","gameType":"choice","renderMode":"inline",
             "instruction":"What is that?",
             "content":{"options":[
                 {"text":"Electricity","correct":True,"continuationSteps":[]},
                 {"text":"A toy","correct":False,"continuationSteps":[]},
                 {"text":"A game","correct":False,"continuationSteps":[]}
             ]},
             "correctFeedback":"That's right! this is an electrical socket. A source of electricity.",
             "wrongFeedback":"No....this is an electrical socket! Electricity lives inside it!",
             "continuationSteps":[
                 {"type":"narrate","sceneKey":"living_room","text":"Mom sits next to you and points at socket."},
                 {"type":"task","taskType":"drag_drop","gameType":"electricity","renderMode":"inline",
                  "instruction":"Tap ALL the things in the room that are dangerous to put near a socket!",
                  "content":{"items":["tv","bottle","table","picture","pencil","toys"],"targets":["tv","bottle"]},
                  "correctFeedback":"Great Job!",
                  "wrongFeedback":"Some of those are actually safe! Remember — water and metal things are the dangerous ones near sockets.",
                  "continuationSteps":[
                      {"type":"dialog","sceneKey":"living_room","speaker":"Mother","text":"Exactly right! Water and metal things near a socket can give you a very bad shock. Always keep them away!"},
                      {"type":"narrate","sceneKey":"living_room","text":"You nod and look back at the socket. Now you understand why it looks dangerous."}
                  ]}
             ]}
        ]
    },
    {
        "id": "fire_safety_at_school",
        "safety_concept": "Follow the teacher calmly during a fire alarm; stay low under smoke",
        "dialog": [
            {"type":"narrate","sceneKey":"classroom_fire_alarm","text":"You are drawing in class when the fire alarm starts ringing loudly.","renderMode":"inline","continuationSteps":[]},
            {"type":"dialog","sceneKey":"classroom_teacher","text":"Everyone stand up calmly and follow me to the exit.","speaker":"Teacher","renderMode":"inline","continuationSteps":[]},
            {"type":"task","sceneKey":"null","taskType":"choice","gameType":"choice","renderMode":"inline",
             "instruction":"What is the safest thing to do during the fire alarm?",
             "content":{"options":[
                 {"text":"Push others to get outside first","correct":False,"continuationSteps":[]},
                 {"text":"Stay calm and follow the teacher","correct":True,"continuationSteps":[]},
                 {"text":"Hide in the classroom","correct":False,"continuationSteps":[]}
             ]},
             "correctFeedback":"Great job! Staying calm helps everyone stay safe.",
             "wrongFeedback":"During a fire alarm, you should calmly follow the teacher.",
             "continuationSteps":[
                 {"type":"dialog","sceneKey":"outside_school","speaker":"Teacher","text":"Excellent! Everyone made it outside safely."},
                 {"type":"dialog","sceneKey":"fire_smoke","speaker":"Teacher","text":"If you see smoke, stay low and crawl under it to breathe cleaner air."},
                 {"type":"dialog","sceneKey":"fire_belongings","speaker":"Teacher","text":"Do not stop to collect your backpack or toys during an emergency."},
                 {"type":"dialog","sceneKey":"fire_lineup","speaker":"Teacher","text":"Stay in line with your classmates so nobody gets lost."},
                 {"type":"dialog","sceneKey":"fire_exit_sign","speaker":"Teacher","text":"Follow the exit signs to safely leave the building."},
                 {"type":"dialog","sceneKey":"fire_no_running","speaker":"Teacher","text":"Walk quickly but do not run, because running can make people fall."},
                 {"type":"dialog","sceneKey":"meeting_point","speaker":"Teacher","text":"After leaving the building, go to the class meeting spot and stay there."},
                 {"type":"dialog","sceneKey":"firefighter_help","speaker":"Teacher","text":"Firefighters are here to help keep everyone safe."},
                 {"type":"task","taskType":"choice","gameType":"choice","renderMode":"inline",
                  "instruction":"What should you do if there is smoke in the hallway?",
                  "content":{"options":[
                      {"text":"Stand tall and wave your arms","correct":False,"continuationSteps":[]},
                      {"text":"Stay low and crawl carefully","correct":True,"continuationSteps":[]},
                      {"text":"Hide in the classroom","correct":False,"continuationSteps":[]}
                  ]},
                  "correctFeedback":"Correct! Staying low helps you breathe safer air.",
                  "wrongFeedback":"Smoke rises, so it is safer to stay low.",
                  "continuationSteps":[
                      {"type":"dialog","sceneKey":"safe_exit","speaker":"Teacher","text":"Excellent! You remembered an important fire safety rule."}
                  ]}
             ]}
        ]
    },
]

# ── Groq call ──────────────────────────────────────────────────────────────────
def simplify_dialog(dialog):
    prompt = f"""
You are simplifying a children's educational dialog level.
STRICT RULES:
- Keep EVERY step. Output array must have the same number of items as the input.
- Do NOT remove, merge, or skip any dialog or task step.
- Preserve all fields: type, taskType, gameType, renderMode, sceneKey, content,
  continuationSteps, correctFeedback, wrongFeedback, speaker.
- Simplify: "text", "instruction", "correctFeedback", "wrongFeedback".
- For choice tasks: also simplify the "text" of EVERY option in content.options.
  CRITICAL: never change the "correct" field of any option. True stays True, False stays False.
- continuationSteps: simplify text, instruction, feedback AND option texts inside them.
- Input has {len(dialog)} steps. Output MUST have {len(dialog)} steps.
Simplification goals:
- Shorter sentences (max 8 words per sentence)
- Simpler words (a 7-year-old should understand every word)
- Friendly, calm tone
Return ONLY a valid JSON array. No markdown. No explanation.
Original dialog:
{json.dumps(dialog, indent=2)}
""".strip()
    try:
        resp = requests.post(
            GROQ_URL,
            headers={"Content-Type":"application/json","Authorization":f"Bearer {GROQ_API_KEY}"},
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {"role":"system","content":"You are an educational content adapter for children. Return only valid JSON, no markdown, no explanation."},
                    {"role":"user","content":prompt}
                ],
                "temperature": 0.7,
            },
            timeout=60,
        )
        resp.raise_for_status()
        raw     = resp.json()["choices"][0]["message"]["content"]
        cleaned = raw.replace("```json","").replace("```","").strip()
        return json.loads(cleaned)
    except Exception as e:
        print(f"  [Groq error] {e}")
        return None

# ── Scoring helpers ───────────────────────────────────────────────────────────
def collect_all_steps(dialog):
    """Flatten top-level steps + all nested continuationSteps recursively."""
    steps = []
    def walk(d):
        for step in d:
            steps.append(step)
            walk(step.get("continuationSteps", []))
            for opt in step.get("content", {}).get("options", []):
                walk(opt.get("continuationSteps", []))
    walk(dialog)
    return steps

def avg_sentence_length(dialog):
    texts = []
    for step in collect_all_steps(dialog):
        for field in ["text","instruction","correctFeedback","wrongFeedback"]:
            val = step.get(field)
            if val and isinstance(val, str):
                texts.append(val)
    import re
    all_text  = " ".join(texts)
    sentences = [s.strip() for s in re.split(r'[.!?]+', all_text) if s.strip()]
    if not sentences:
        return 0.0
    return sum(len(s.split()) for s in sentences) / len(sentences)

def step_count_ok(orig, simp):
    return len(orig) == len(simp)

def fields_preserved(orig, simp):
    for o, s in zip(orig, simp):
        for key in o:
            if key not in s:
                return False
    return True

def answer_integrity_ok(orig, simp):
    """Check that every choice option correct flag is unchanged."""
    orig_steps = collect_all_steps(orig)
    simp_steps = collect_all_steps(simp)
    violations = []
    for o, s in zip(orig_steps, simp_steps):
        orig_opts = o.get("content", {}).get("options", [])
        simp_opts = s.get("content", {}).get("options", [])
        for idx, (oo, so) in enumerate(zip(orig_opts, simp_opts)):
            if oo.get("correct") != so.get("correct"):
                violations.append(f"option[{idx}] correct flipped: {oo.get('correct')} to {so.get('correct')}")
    return len(violations) == 0, violations

def choice_text_simplified(orig, simp):
    """Check that option texts are shorter on average after simplification."""
    def collect_option_texts(dialog):
        texts = []
        for step in collect_all_steps(dialog):
            for opt in step.get("content", {}).get("options", []):
                t = opt.get("text", "")
                if t:
                    texts.append(t)
        return texts
    orig_texts = collect_option_texts(orig)
    simp_texts = collect_option_texts(simp)
    if not orig_texts or not simp_texts:
        return True, 0.0, 0.0
    avg_orig = sum(len(t.split()) for t in orig_texts) / len(orig_texts)
    avg_simp = sum(len(t.split()) for t in simp_texts) / len(simp_texts)
    return avg_simp <= avg_orig, round(avg_orig, 1), round(avg_simp, 1)

def avg_word_length(dialog):
    """Average character length of words — proxy for vocabulary complexity."""
    all_words = []
    for step in collect_all_steps(dialog):
        for field in ["text","instruction","correctFeedback","wrongFeedback"]:
            val = step.get(field, "")
            if val and isinstance(val, str):
                all_words += [w.strip(".,!?\"'") for w in val.split() if w.strip(".,!?\"'")]
        for opt in step.get("content", {}).get("options", []):
            t = opt.get("text", "")
            if t:
                all_words += [w.strip(".,!?\"'") for w in t.split() if w.strip(".,!?\"'")]
    if not all_words:
        return 0.0
    return sum(len(w) for w in all_words) / len(all_words)

# ── Runner ─────────────────────────────────────────────────────────────────────
def run():
    results = []
    passed  = 0

    print(f"\n{'─'*65}")
    print(f"  Parkette Simplification — {len(DATASET)} real levels")
    print(f"{'─'*65}\n")

    for i, scenario in enumerate(DATASET, 1):
        sid     = scenario["id"]
        concept = scenario["safety_concept"]
        orig    = scenario["dialog"]

        print(f"[{i:02d}/{len(DATASET)}] {sid}  ({len(orig)} top-level steps)")
        simplified = simplify_dialog(orig)

        if simplified is None:
            print("       ✗  API call failed\n")
            results.append({"id":sid,"safety_concept":concept,
                "steps_original":len(orig),"steps_simplified":0,
                "step_count_ok":False,"fields_ok":False,
                "avg_words_before":round(avg_sentence_length(orig),1),"avg_words_after":"N/A","length_reduced":False,
                "avg_word_len_before":round(avg_word_length(orig),1),"avg_word_len_after":"N/A","vocab_simplified":False,
                "choice_avg_before":"N/A","choice_avg_after":"N/A","choice_text_simplified":False,
                "answer_integrity":False,"answer_violations":"API_FAILED",
                "overall_pass":False,"concept_preserved":"","tone_appropriate":"","no_errors":"","simplified_dialog":""})
            continue

        sc_ok              = step_count_ok(orig, simplified)
        fields_ok          = fields_preserved(orig, simplified)
        avg_before         = avg_sentence_length(orig)
        avg_after          = avg_sentence_length(simplified)
        length_reduced     = avg_after < avg_before
        wl_before          = avg_word_length(orig)
        wl_after           = avg_word_length(simplified)
        vocab_ok           = wl_after <= wl_before
        ct_ok, ct_b, ct_a  = choice_text_simplified(orig, simplified)
        ans_ok, violations = answer_integrity_ok(orig, simplified)
        overall            = sc_ok and fields_ok and length_reduced and ans_ok
        if overall:
            passed += 1

        print(f"       steps:            {len(orig)} -> {len(simplified)}   {'✓' if sc_ok else '✗ MISMATCH'}")
        print(f"       fields preserved: {'✓' if fields_ok else '✗'}")
        print(f"       avg sentence len: {avg_before:.1f} -> {avg_after:.1f} words   {'✓' if length_reduced else '✗'}")
        print(f"       avg word length:  {wl_before:.1f} -> {wl_after:.1f} chars   {'✓ simpler' if vocab_ok else '✗'}")
        print(f"       choice texts:     {ct_b} -> {ct_a} words/option   {'✓' if ct_ok else '✗'}")
        print(f"       answer integrity: {'✓' if ans_ok else f'✗ VIOLATIONS: {violations}'}")
        print(f"       overall auto:     {'PASS ✓' if overall else 'FAIL ✗'}")
        print(f"\n       -- Simplified preview (check: '{concept}') --")
        for j, step in enumerate(simplified):
            for field in ["text","instruction","correctFeedback","wrongFeedback"]:
                val = step.get(field)
                if val and isinstance(val, str):
                    print(f"         step[{j}].{field}: {val}")
            for opt in step.get("content",{}).get("options",[]):
                print(f"         option[correct={opt.get('correct')}]: {opt.get('text','')}")
        print()

        results.append({
            "id": sid, "safety_concept": concept,
            "steps_original": len(orig), "steps_simplified": len(simplified),
            "step_count_ok": sc_ok, "fields_ok": fields_ok,
            "avg_words_before": round(avg_before,1), "avg_words_after": round(avg_after,1),
            "length_reduced": length_reduced,
            "avg_word_len_before": round(wl_before,1), "avg_word_len_after": round(wl_after,1),
            "vocab_simplified": vocab_ok,
            "choice_avg_before": ct_b, "choice_avg_after": ct_a,
            "choice_text_simplified": ct_ok,
            "answer_integrity": ans_ok,
            "answer_violations": "; ".join(violations) if violations else "",
            "overall_pass": overall,
            "concept_preserved": "",   # yes / no / partial
            "tone_appropriate":  "",   # yes / no
            "no_errors":         "",   # yes / no
            "simplified_dialog": json.dumps(simplified, ensure_ascii=False),
        })
        time.sleep(8)

    n = len(DATASET)
    print(f"{'─'*65}")
    print(f"  Automated pass rate:      {passed}/{n}  ({passed/n*100:.1f}%)")
    print(f"  Answer integrity:         {sum(1 for r in results if r['answer_integrity'])}/{n}")
    print(f"  Vocab simplified:         {sum(1 for r in results if r['vocab_simplified'])}/{n}")
    print(f"  Choice texts simplified:  {sum(1 for r in results if r['choice_text_simplified'])}/{n}")
    print(f"\n  Fill in CSV: concept_preserved / tone_appropriate / no_errors")
    print(f"{'─'*65}")

    out = "simplification_results.csv"
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=results[0].keys())
        w.writeheader()
        w.writerows(results)
    print(f"\n  Results saved -> {out}\n")

if __name__ == "__main__":
    run()