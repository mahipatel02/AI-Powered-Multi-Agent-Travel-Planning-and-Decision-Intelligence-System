import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


class PackVoteAgent:

    def resolve_chaos(self, group_data: list) -> dict:
        prompt = f"""
You are a Group Travel Mediator.
Your goal is to find a middle ground between conflicting preferences.

GROUP PROFILES:
{json.dumps(group_data)}

TASK:
1. Identify major conflicts (e.g., Budget gaps, Activity mismatches).
2. Calculate a "Chaos Score" (0 to 100).
3. Suggest 3 specific destinations that satisfy the MOST people.
4. Provide a "Consensus Vibe" that everyone can agree on.

OUTPUT FORMAT (JSON ONLY, no markdown):
{{
  "chaos_score": 0,
  "conflicts": ["..."],
  "consensus_vibe": "...",
  "suggested_destinations": [
    {{ "name": "...", "reason": "Why it fits the group" }}
  ],
  "mediation_message": "A friendly message for the group chat"
}}
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return self._safe_parse(response.text)

    def _safe_parse(self, text: str) -> dict:
        try:
            return json.loads(text.strip().strip("```json").strip("```"))
        except Exception:
            try:
                start = text.find("{")
                end = text.rfind("}") + 1
                return json.loads(text[start:end])
            except Exception:
                return {
                    "chaos_score": 50,
                    "conflicts": [],
                    "consensus_vibe": "mixed",
                    "suggested_destinations": [],
                    "mediation_message": "Could not calculate consensus."
                }
