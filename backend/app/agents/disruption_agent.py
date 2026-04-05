import os
import json
from dotenv import load_dotenv
from google import genai
from typing import Dict

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


class DisruptionAgent:

    def handle_disruption(self, user_input: str) -> Dict:
        disruption = self.detect_disruption(user_input)
        plan = self.plan_recovery(disruption)
        execution = self.execute_actions(plan)
        return self.summarize_for_user(plan, execution)

    def detect_disruption(self, user_input: str) -> Dict:
        return {
            "type": "flight_delay_or_cancel",
            "raw_input": user_input
        }

    def plan_recovery(self, disruption: Dict) -> Dict:
        prompt = f"""
You are an autonomous travel disruption recovery agent.

USER SITUATION:
{disruption.get("raw_input", "Flight disruption reported.")}

CONTEXT:
- User is a traveler (assume economy class)
- Hotel and airport pickup are already booked
- Make realistic assumptions if details are missing

TASK:
1. Select ONE best alternative flight/train with realistic timing
2. Mention 2 backup alternatives
3. Handle hotel/Airbnb late check-in
4. Reschedule airport pickup to match new arrival time
5. Revise the itinerary logically

STRICT RULES:
- Output VALID JSON ONLY
- Use double quotes only
- No explanations outside JSON
- No trailing commas

OUTPUT FORMAT:
{{
  "assumptions": ["..."],
  "selected_transport": "...",
  "alternatives": ["...", "..."],
  "hotel_action": "...",
  "pickup_action": "...",
  "revised_itinerary": {{
    "Day 1": ["..."],
    "Day 2": ["..."]
  }}
}}
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return self.safe_parse(response.text)

    def execute_actions(self, plan: Dict) -> Dict:
        return {
            "transport_booking": f"(Simulated) Booked {plan.get('selected_transport')}",
            "hotel_notification": "(Simulated) Hotel/Airbnb notified & acknowledged",
            "pickup_rescheduled": "(Simulated) Pickup scheduled at updated arrival time"
        }

    def summarize_for_user(self, plan: Dict, execution: Dict) -> Dict:
        return {
            "status": "Recovery completed",
            "transport": execution["transport_booking"],
            "hotel": execution["hotel_notification"],
            "pickup": execution["pickup_rescheduled"],
            "itinerary": plan.get("revised_itinerary", {})
        }

    def safe_parse(self, text: str) -> Dict:
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            try:
                start = text.find("{")
                end = text.rfind("}") + 1
                return json.loads(text[start:end])
            except Exception:
                return {
                    "assumptions": ["Exact flight details unavailable"],
                    "selected_transport": "Next available flight/train (fallback)",
                    "alternatives": [],
                    "hotel_action": "Hotel notified about late check-in (fallback)",
                    "pickup_action": "Pickup rescheduled to updated arrival time (fallback)",
                    "revised_itinerary": {
                        "Day 1": ["Arrival delayed due to disruption", "Rest"],
                        "Day 2": ["Resume original planned activities"]
                    }
                }
