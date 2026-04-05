import os
import json
from google.generativeai import GenerativeModel # type: ignore

class RegretAgent:
    def __init__(self):
        self.model = GenerativeModel("models/gemini-2.5-flash")

    def critique_itinerary(self, itinerary_text: str, user_persona: str) -> dict:
        prompt = f"""
You are a 'Regret Prevention' expert. Review this itinerary for a {user_persona} traveler.

ITINERARY:
{itinerary_text}

LOOK FOR:
1. Transit Fatigue: Too much travel, too little rest.
2. FOMO: Iconic things missed in that city.
3. Logistics: Tight connections or illogical routes.

OUTPUT FORMAT (JSON ONLY):
{{
  "regret_risks": [
    {{ "issue": "...", "fix": "..." }}
  ],
  "fatigue_rating": "Low/Medium/High",
  "optimization_tip": "One big tip to make the trip better"
}}
"""
        response = self.model.generate_content(prompt)
        return json.loads(response.text.strip('`json\n '))
    
    