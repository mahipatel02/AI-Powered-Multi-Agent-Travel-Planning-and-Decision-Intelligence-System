import os
import io
import json
import requests
from dotenv import load_dotenv
from PIL import Image
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")


class MultimodalAgent:

    def discover_destination(self, image_bytes: bytes, user_text: str = "") -> dict:

        image = Image.open(io.BytesIO(image_bytes))

        prompt = f"""
You are an advanced travel AI system.

USER MESSAGE:
{user_text if user_text else "No additional message provided."}

TASK:
1. If user is asking "Where is this?" or "What place is this?" → Identify exact real-world location.
2. Otherwise → Analyze visual aesthetics, classify travel vibe, recommend similar destinations.

Return ONLY valid JSON. No markdown. No explanation outside JSON.

IF LOCATION IDENTIFIED:
{{
  "mode": "location_identified",
  "location": {{
    "name": "...",
    "country": "...",
    "description": "...",
    "best_time_to_visit": "...",
    "top_things_to_do": ["...", "..."]
  }}
}}

IF RECOMMENDATION MODE:
{{
  "mode": "vibe_recommendation",
  "vibe": {{
    "primary_vibe": "...",
    "secondary_vibes": [],
    "pace": "slow | moderate | fast",
    "aesthetic_tags": []
  }},
  "recommendation": {{
    "name": "...",
    "country": "...",
    "why_it_matches": "...",
    "best_season": "..."
  }}
}}
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_text(text=prompt),
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type="image/jpeg"
                )
            ]
        )

        result = self.safe_parse(response.text)

        place_name = ""
        country = ""

        if result.get("mode") == "location_identified":
            place_name = result.get("location", {}).get("name", "")
            country = result.get("location", {}).get("country", "")
        elif result.get("mode") == "vibe_recommendation":
            place_name = result.get("recommendation", {}).get("name", "")
            country = result.get("recommendation", {}).get("country", "")

        if place_name:
            result["images"] = self.fetch_unsplash_images(place_name, country)

        return result

    def fetch_unsplash_images(self, place_name: str, country: str) -> list:
        if not UNSPLASH_ACCESS_KEY:
            return []

        queries = [
            f"{place_name} {country} landmark",
            f"{place_name} sunrise",
            f"{place_name} aerial view"
        ]

        images = []
        for q in queries:
            try:
                response = requests.get(
                    "https://api.unsplash.com/search/photos",
                    params={"query": q, "per_page": 1, "client_id": UNSPLASH_ACCESS_KEY}
                )
                data = response.json()
                if data.get("results"):
                    images.append(data["results"][0]["urls"]["regular"])
            except Exception:
                continue

        return images

    def safe_parse(self, text: str) -> dict:
        try:
            return json.loads(text)
        except Exception:
            try:
                start = text.find("{")
                end = text.rfind("}") + 1
                return json.loads(text[start:end])
            except Exception:
                return {}
