import streamlit as st

from agents.chatbot_agent import chat
from agents.multimodal_agent import MultimodalAgent

# --------------------------------
# Page Config (MUST be first)
# --------------------------------
st.set_page_config(
    page_title="Travel AI Agent",
    page_icon="🧳",
    layout="centered"
)

st.title("🧳 Travel AI Agent")
st.caption("AI-powered Travel Assistant")

# --------------------------------
# Session State
# --------------------------------
if "history" not in st.session_state:
    st.session_state.history = []

if "preferences" not in st.session_state:
    st.session_state.preferences = {
        "style": "balanced",
        "interests": ["general sightseeing"],
        "pace": "moderate"
    }

# 🔥 Multimodal result storage (IMPORTANT FIX)
if "multimodal_result" not in st.session_state:
    st.session_state.multimodal_result = None

# --------------------------------
# Chat Section
# --------------------------------
st.subheader("💬 Travel Chat")

user_input = st.text_input("Ask something about travel")

if st.button("Send") and user_input:
    with st.spinner("Thinking..."):
        response = chat(user_input, st.session_state.preferences)

    st.session_state.history.append(("You", user_input))
    st.session_state.history.append(("AI", response))

for role, message in st.session_state.history:
    if role == "You":
        st.markdown(f"**🧑 You:** {message}")
    else:
        st.markdown(f"**🤖 AI:** {message}")

# --------------------------------
# Multimodal Section
# --------------------------------
st.divider()
st.subheader("🌍 Discover Destination by Image")

multimodal_agent = MultimodalAgent()

uploaded_image = st.file_uploader(
    "Upload an image (Pinterest / movie scene / photo)",
    type=["jpg", "jpeg", "png"]
)

user_vibe_text = st.text_input(
    "Optional description",
    placeholder="Find me a peaceful mountain town like this"
)

# ---------- BUTTON ----------
if uploaded_image and st.button("Discover Destination"):
    with st.spinner("Analyzing image..."):
        result = multimodal_agent.discover_destination(
            image_bytes=uploaded_image.getvalue(),
            user_text=user_vibe_text
        )

        # 🔥 Store in session state
        st.session_state.multimodal_result = result

# --------------------------------
# DISPLAY RESULTS (SAFE)
# --------------------------------
result = st.session_state.multimodal_result

if result:

    # MODE 1 → Exact Location Identified
    if result.get("mode") == "location_identified":

        location = result.get("location", {})

        st.subheader("📍 Identified Location")
        st.markdown(f"### {location.get('name')} — {location.get('country')}")
        st.write(location.get("description"))
        st.write("**Best Time to Visit:**", location.get("best_time_to_visit"))

        if location.get("top_things_to_do"):
            st.write("### 🎯 Top Things To Do")
            for thing in location.get("top_things_to_do"):
                st.write("•", thing)

    # MODE 2 → Vibe Recommendation
    if result.get("mode") == "vibe_recommendation":

        st.subheader("✨ Detected Vibe")
        st.json(result.get("detected_vibe", {}))

        recs = result.get("recommendations", {})
        primary = recs.get("primary_destination", {})

        st.subheader("📍 Recommended Destination")
        st.markdown(f"### {primary.get('name')} — {primary.get('country')}")
        st.write(primary.get("why_it_matches"))

        if recs.get("alternatives"):
            st.write("### 🔁 Alternatives")
            for alt in recs["alternatives"]:
                st.write(f"• {alt.get('name')} — {alt.get('country')}")

        st.write("**Best Season:**", recs.get("best_season"))

    # ---------- IMAGES ----------
    if result.get("images"):
        st.subheader("📸 Visual Preview")
        cols = st.columns(2)

        for idx, img_url in enumerate(result["images"]):
            cols[idx % 2].image(img_url, use_column_width=True)
