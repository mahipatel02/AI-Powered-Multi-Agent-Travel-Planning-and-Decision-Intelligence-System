# utils/vibe_taxonomy.py

VIBE_TAXONOMY = {
    "CALM_NATURE": {
        "pace": "SLOW",
        "energy": "LOW",
        "crowd": "QUIET"
    },
    "ROMANTIC": {
        "pace": "SLOW",
        "energy": "MEDIUM",
        "crowd": "BALANCED"
    },
    "CINEMATIC": {
        "pace": "MODERATE",
        "energy": "MEDIUM",
        "crowd": "BALANCED"
    },
    "VIBRANT_CITY": {
        "pace": "FAST",
        "energy": "HIGH",
        "crowd": "CROWDED_OK"
    },
    "ADVENTUROUS": {
        "pace": "FAST",
        "energy": "HIGH",
        "crowd": "QUIET"
    },
    "CULTURAL_HERITAGE": {
        "pace": "MODERATE",
        "energy": "MEDIUM",
        "crowd": "BALANCED"
    },
    "LUXURY_RELAXED": {
        "pace": "SLOW",
        "energy": "LOW",
        "crowd": "QUIET"
    },
    "RUSTIC_AUTHENTIC": {
        "pace": "SLOW",
        "energy": "LOW",
        "crowd": "QUIET"
    }
}

def get_all_vibes():
    return list(VIBE_TAXONOMY.keys())
