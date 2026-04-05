import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

import os
import json
from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client
from dotenv import load_dotenv
from google import genai

from database.db import get_supabase
from agents.chatbot_agent import chat
from agents.disruption_agent import DisruptionAgent
from agents.multimodal_agent import MultimodalAgent
from agents.packvote_agent import PackVoteAgent

load_dotenv()

app = FastAPI(title="Travel AI Agent API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
disruption_agent = DisruptionAgent()
multimodal_agent = MultimodalAgent()
packvote_agent   = PackVoteAgent()


@app.get("/")
async def root():
    return {"message": "Travel AI Agent API v2.0 Running ✅"}


@app.post("/chat")
async def chat_endpoint(
    user_input: str = Form(...),
    style: str = Form(default="balanced"),
    pace: str = Form(default="moderate"),
    interests: str = Form(default="general sightseeing"),
):
    preferences = {
        "style": style,
        "pace": pace,
        "interests": [i.strip() for i in interests.split(",")],
    }
    response = chat(user_input, preferences)
    return {"response": response}


@app.post("/disrupt")
async def disruption_endpoint(
    user_input: str = Form(...),
    db: Client = Depends(get_supabase),
):
    result = disruption_agent.handle_disruption(user_input)
    db.table("disruption_logs").insert({
        "disruption_type": "flight_delay_or_cancel",
        "recovery_plan": result,
    }).execute()
    return result


@app.post("/multimodal")
async def multimodal_endpoint(
    image: UploadFile = File(...),
    user_text: str = Form(default=""),
):
    image_bytes = await image.read()
    result = multimodal_agent.discover_destination(image_bytes, user_text)
    return result


@app.get("/flights")
async def search_flights(
    origin: str,
    destination: str,
    date: str,
    passengers: int = 1,
):
    prompt = f"""
Generate realistic Indian flight search results as JSON.
Route: {origin} → {destination}, Date: {date}, Passengers: {passengers}

Return ONLY valid JSON, no markdown:
{{
  "flights": [
    {{
      "airline": "IndiGo",
      "flight_number": "6E-123",
      "departure": "06:00",
      "arrival": "08:15",
      "duration": "2h 15m",
      "price_inr": 4500,
      "class": "Economy",
      "stops": "Non-stop",
      "seats_left": 12
    }}
  ]
}}
Generate 5 realistic flights with different airlines (IndiGo, Air India, SpiceJet, Vistara, Akasa Air).
"""
    response = gemini.models.generate_content(model="gemini-2.5-flash", contents=prompt)
    try:
        text = response.text.strip().strip("```json").strip("```")
        return json.loads(text)
    except Exception:
        return {"flights": [], "error": "Could not generate flights"}


@app.get("/hotels")
async def search_hotels(
    destination: str,
    checkin: str,
    checkout: str,
    guests: int = 1,
):
    prompt = f"""
Generate realistic hotel search results for {destination} as JSON.
Check-in: {checkin}, Check-out: {checkout}, Guests: {guests}

Return ONLY valid JSON, no markdown:
{{
  "hotels": [
    {{
      "name": "Hotel Name",
      "stars": 4,
      "price_per_night_inr": 3500,
      "rating": 4.2,
      "location": "City Center",
      "amenities": ["WiFi", "Pool", "Breakfast"],
      "rooms_left": 5
    }}
  ]
}}
Generate 5 realistic hotels ranging from budget to luxury.
"""
    response = gemini.models.generate_content(model="gemini-2.5-flash", contents=prompt)
    try:
        text = response.text.strip().strip("```json").strip("```")
        return json.loads(text)
    except Exception:
        return {"hotels": [], "error": "Could not generate hotels"}


@app.post("/itinerary/save")
async def save_itinerary(
    destination: str = Form(...),
    days: int = Form(...),
    itinerary_text: str = Form(...),
    style: str = Form(default="balanced"),
    pace: str = Form(default="moderate"),
    user_id: str = Form(default="anonymous"),
    db: Client = Depends(get_supabase),
):
    result = db.table("itineraries").insert({
        "user_id": user_id,
        "destination": destination,
        "days": days,
        "itinerary_text": itinerary_text,
        "style": style,
        "pace": pace,
    }).execute()
    return {"success": True, "itinerary_id": result.data[0]["id"]}


@app.get("/itinerary/{itinerary_id}")
async def get_itinerary(
    itinerary_id: int,
    db: Client = Depends(get_supabase),
):
    result = db.table("itineraries").select("*").eq("id", itinerary_id).execute()
    if not result.data:
        return {"error": "Itinerary not found"}
    return result.data[0]


@app.post("/reminders")
async def create_reminder(
    itinerary_id: int = Form(...),
    place: str = Form(...),
    remind_at: str = Form(...),
    message: str = Form(default=""),
    user_id: str = Form(default="anonymous"),
    db: Client = Depends(get_supabase),
):
    result = db.table("reminders").insert({
        "user_id": user_id,
        "itinerary_id": itinerary_id,
        "place": place,
        "remind_at": remind_at,
        "message": message,
    }).execute()
    return {"success": True, "reminder": result.data[0]}


@app.get("/reminders/{user_id}")
async def get_reminders(
    user_id: str,
    db: Client = Depends(get_supabase),
):
    result = db.table("reminders").select("*").eq("user_id", user_id).eq("is_sent", False).execute()
    return {"reminders": result.data}


@app.post("/groups")
async def create_group(
    group_name: str = Form(...),
    db: Client = Depends(get_supabase),
):
    result = db.table("groups").insert({"group_name": group_name}).execute()
    group = result.data[0]
    return {"group_id": group["id"], "group_name": group["group_name"]}


@app.post("/groups/{group_id}/members")
async def add_member(
    group_id: int,
    name: str = Form(...),
    budget: str = Form(...),
    pace: str = Form(...),
    db: Client = Depends(get_supabase),
):
    result = db.table("members").insert({
        "group_id": group_id,
        "name": name,
        "budget": budget,
        "pace": pace,
    }).execute()
    return result.data[0]


@app.post("/members/{member_id}/preferences")
async def add_preference(
    member_id: int,
    destination: str = Form(...),
    activity: str = Form(...),
    vibe: str = Form(default=""),
    db: Client = Depends(get_supabase),
):
    result = db.table("preferences").insert({
        "member_id": member_id,
        "destination": destination,
        "activity": activity,
        "vibe": vibe,
    }).execute()
    return result.data[0]


@app.get("/groups/{group_id}/members")
async def get_members(
    group_id: int,
    db: Client = Depends(get_supabase),
):
    result = db.table("members").select("*, preferences(*)").eq("group_id", group_id).execute()
    return result.data


@app.post("/groups/{group_id}/generate-decision")
async def generate_decision(
    group_id: int,
    db: Client = Depends(get_supabase),
):
    members_result = db.table("members").select("*, preferences(*)").eq("group_id", group_id).execute()
    members = members_result.data

    if not members:
        return {"error": "No members in group"}

    group_data = []
    for m in members:
        for pref in m.get("preferences", []):
            group_data.append({
                "name": m["name"],
                "budget": m["budget"],
                "pace": m["pace"],
                "destination": pref["destination"],
                "activity": pref["activity"],
                "vibe": pref.get("vibe", ""),
            })

    if not group_data:
        return {"error": "No preferences found"}

    ai_result = packvote_agent.resolve_chaos(group_data)

    destination_scores = {}
    budgets = [m["budget"] for m in members]
    paces   = [m["pace"]   for m in members]

    for m in members:
        for pref in m.get("preferences", []):
            dest  = pref["destination"]
            score = 2
            if m["budget"] in budgets: score += 2
            if m["pace"] in paces: score += 2
            for other in members:
                for op in other.get("preferences", []):
                    if op["activity"] == pref["activity"]:
                        score += 1
            destination_scores[dest] = destination_scores.get(dest, 0) + score

    best      = max(destination_scores, key=destination_scores.get)
    total     = sum(destination_scores.values())
    happiness = round((destination_scores[best] / total) * 100, 2)

    unique_dest    = len(destination_scores)
    unique_budgets = len(set(budgets))
    unique_paces   = len(set(paces))
    chaos_score    = (unique_dest + unique_budgets + unique_paces) / 3
    chaos_level    = "Low" if chaos_score <= 1.5 else "Medium" if chaos_score <= 2.5 else "High"
    ai_reason      = ai_result.get("mediation_message", f"{best} selected based on group preferences.")

    db.table("results").insert({
        "group_id": group_id,
        "destination": best,
        "group_happiness": happiness,
        "chaos_level": chaos_level,
        "ai_reason": ai_reason,
    }).execute()

    return {
        "selected_destination": best,
        "group_happiness": happiness,
        "score_distribution": destination_scores,
        "chaos_score": round(chaos_score, 2),
        "chaos_level": chaos_level,
        "ai_reason": ai_reason,
        "ai_suggestions": ai_result.get("suggested_destinations", []),
        "conflicts": ai_result.get("conflicts", []),
    }


@app.post("/regret")
async def submit_regret(
    destination: str = Form(...),
    would_revisit: bool = Form(...),
    overrated_aspects: str = Form(default=""),
    exceeded_expectations: str = Form(default=""),
    crowds_score: int = Form(default=3),
    expense_score: int = Form(default=3),
    safety_score: int = Form(default=3),
    expectations_score: int = Form(default=3),
    user_id: str = Form(default="anonymous"),
    db: Client = Depends(get_supabase),
):
    prompt = f"""
Calculate a Regret Score (0.0 to 1.0) and analysis for this trip.
Destination: {destination}, Would revisit: {would_revisit}

Ratings (1=Terrible, 5=Excellent):
- Crowds/Comfort: {crowds_score}/5
- Value for Money: {expense_score}/5
- Safety: {safety_score}/5
- Expectations met: {expectations_score}/5

Written Feedback:
Overrated: {overrated_aspects}
Exceeded expectations: {exceeded_expectations}

Return ONLY valid JSON:
{{
  "regret_score": 0.0,
  "summary": "...",
  "recommendation_for_others": "..."
}}
regret_score: 0 = no regret, 1 = full regret
"""
    response = gemini.models.generate_content(model="gemini-2.5-flash", contents=prompt)
    try:
        text = response.text.strip().strip("```json").strip("```")
        parsed = json.loads(text)
    except Exception:
        parsed = {"regret_score": 0.5, "summary": "Could not analyze", "recommendation_for_others": ""}

    db.table("regret_scores").insert({
        "user_id": user_id,
        "destination": destination,
        "would_revisit": would_revisit,
        "overrated_aspects": overrated_aspects,
        "exceeded_expectations": exceeded_expectations,
        "regret_score": parsed.get("regret_score", 0.5),
        "ai_summary": parsed.get("summary", ""),
    }).execute()

    return parsed


@app.get("/memories")
async def get_memories(db: Client = Depends(get_supabase)):
    try:
        result = db.table("trip_memories").select("*").order("created_at", desc=True).limit(20).execute()
        return result.data
    except Exception:
        return []


@app.post("/memories")
async def post_memory(
    user_name: str = Form(...),
    destination: str = Form(...),
    image_url: str = Form(...),
    caption: str = Form(...),
    db: Client = Depends(get_supabase)
):
    try:
        result = db.table("trip_memories").insert({
            "user_name": user_name,
            "destination": destination,
            "image_url": image_url,
            "caption": caption,
            "likes": 0
        }).execute()
        return result.data[0]
    except Exception as e:
        return {"error": str(e)}


@app.get("/groups/{group_id}/wishlist")
async def get_wishlist(group_id: int, db: Client = Depends(get_supabase)):
    try:
        result = db.table("group_wishlist").select("*").eq("group_id", group_id).order("id", desc=True).execute()
        return result.data
    except Exception:
        return []


@app.post("/groups/{group_id}/wishlist")
async def add_wishlist_item(
    group_id: int,
    link_url: str = Form(...),
    member_name: str = Form(...),
    db: Client = Depends(get_supabase)
):
    try:
        result = db.table("group_wishlist").insert({
            "group_id": group_id,
            "link_url": link_url,
            "member_name": member_name
        }).execute()
        return result.data[0]
    except Exception as e:
        return {"error": str(e)}
