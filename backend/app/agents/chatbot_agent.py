import os
from dotenv import load_dotenv
from google import genai

from agents.disruption_agent import DisruptionAgent

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
disruption_agent = DisruptionAgent()


def is_disruption_query(text: str) -> bool:
    keywords = ["delay", "delayed", "cancel", "cancelled", "missed", "rescheduled"]
    return any(k in text.lower() for k in keywords)


def chat(user_input: str, preferences: dict) -> str:
    if is_disruption_query(user_input):
        result = disruption_agent.handle_disruption(user_input)
        return format_disruption_response(result)

    style = preferences.get("style", "balanced")
    interests = preferences.get("interests", ["general sightseeing"])
    pace = preferences.get("pace", "moderate")

    prompt = f"""
You are an expert human travel planner (not a chatbot).

GOAL:
Create the BEST possible itinerary for the destination, optimized for:
- logical geography (minimum travel time)
- realistic daily pacing
- local highlights + hidden gems
- first-time visitor experience

USER PREFERENCES:
- Travel style: {style}
- Interests: {", ".join(interests)}
- Pace: {pace}

RULES:
- Match exactly the number of days requested
- Do NOT rush attractions
- Group nearby places in the same day
- Avoid tourist traps unless iconic
- Include food and local experiences
- IMPORTANT: Find 2 upcoming local events, concerts, festivals, or flea markets to include.
- Use bullet points
- Each day must have Morning / Afternoon / Evening

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown formatting, no code blocks):
{{
  "destination": "Specific name of the generated destination (e.g., 'Goa, India' or 'Santorini, Greece')",
  "events": ["Name of a local upcoming festival, concert, or flea market (Include an approximate date or season)", "Another local event"],
  "itinerary": [
    {{
      "day": 1,
      "title": "Welcome to the City",
      "plan": {{
        "morning": "Activity description",
        "afternoon": "Activity description",
        "evening": "Activity description"
      }}
    }}
  ]
}}

User request:
{user_input}

SPECIAL INSTRUCTION: 
If the user requested "Surprise Me" as their destination, you must use their group type, occasion, and vibes to intelligently pick an incredible, curated destination for them. Build the full itinerary for that place, and ensure you explicitly set the chosen location in the "destination" JSON field.
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text.strip()


def format_disruption_response(result: dict) -> str:
    response = "✅ Travel Disruption Managed Successfully\n\n"

    if "assumptions" in result:
        response += "ℹ️ Assumptions made:\n"
        for a in result["assumptions"]:
            response += f"• {a}\n"
        response += "\n"

    response += f"""✈️ Transport:
{result.get("transport", "N/A")}

🏨 Stay:
{result.get("hotel", "N/A")}

🚗 Pickup:
{result.get("pickup", "N/A")}

🗺️ Revised Itinerary:
"""
    for day, plans in result.get("itinerary", {}).items():
        response += f"\n{day}:\n"
        for p in plans:
            response += f"• {p}\n"

    return response.strip()
