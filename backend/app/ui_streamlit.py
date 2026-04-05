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

# ===============================
# Sidebar Navigation
# ===============================
st.sidebar.title("🌍 Travel AI Agent")

app_mode = st.sidebar.radio(
    "Select Module",
    [
        "🤖 Chat Assistant",
        "🗳️ PackVote (Group Planner)",
        "⚡ Disruption Recovery",
        "🖼️ Multimodal Explorer"
    ]
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

if "multimodal_result" not in st.session_state:
    st.session_state.multimodal_result = None


# =====================================================
# 🤖 CHAT ASSISTANT
# =====================================================
if app_mode == "🤖 Chat Assistant":

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


# =====================================================
# 🖼️ MULTIMODAL EXPLORER
# =====================================================
elif app_mode == "🖼️ Multimodal Explorer":

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

    if uploaded_image and st.button("Discover Destination"):
        with st.spinner("Analyzing image..."):
            result = multimodal_agent.discover_destination(
                image_bytes=uploaded_image.getvalue(),
                user_text=user_vibe_text
            )

            st.session_state.multimodal_result = result

    result = st.session_state.multimodal_result

    if result:

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

        if result.get("images"):
            st.subheader("📸 Visual Preview")
            st.image(result["images"][0], use_container_width=True)


# =====================================================
# ⚡ DISRUPTION (placeholder for now)
# =====================================================
elif app_mode == "⚡ Disruption Recovery":

    st.subheader("⚡ Travel Disruption Recovery")
    st.info("Disruption Agent UI will go here.")


# =====================================================
# 🗳️ PACKVOTE (placeholder for now)
# =====================================================
# =====================================================
# 🗳️ PACKVOTE - GROUP PLANNER
# =====================================================
elif app_mode == "🗳️ PackVote (Group Planner)":

    from agents.packvote_agent import PackVoteAgent

    st.subheader("🗳️ PackVote - Group Travel Intelligence")

    # ---------------------------
    # Create Group
    # ---------------------------
    if "packvote_agent" not in st.session_state:

        group_name = st.text_input("Enter Group Name")

        if st.button("Create Group"):
            if group_name:
                st.session_state.packvote_agent = PackVoteAgent(group_name)
                st.success("Group created successfully!")
                st.rerun()
            else:
                st.warning("Please enter group name.")

        st.stop()

    agent = st.session_state.packvote_agent

    # ---------------------------
    # Show Group Info
    # ---------------------------
    st.markdown(f"**Group Name:** {agent.group.group_name}")
    st.markdown(f"**Group ID:** `{agent.group.group_id}`")

    st.divider()

    # ---------------------------
    # Add Member
    # ---------------------------
    st.subheader("➕ Add Member Preference")

    name = st.text_input("Member Name")
    destinations = st.text_input("Preferred Destinations (comma separated)")
    budget = st.selectbox("Budget", ["low", "medium", "high"])
    pace = st.selectbox("Travel Pace", ["relaxed", "moderate", "fast"])
    activities = st.text_input("Preferred Activities (comma separated)")
    weight = st.number_input("Voting Weight", min_value=1.0, value=1.0)

    if st.button("Add Member"):
        if name and destinations and activities:
            agent.add_member_preference({
                "name": name,
                "destinations": [d.strip() for d in destinations.split(",")],
                "budget": budget,
                "pace": pace,
                "activities": [a.strip() for a in activities.split(",")],
                "weight": weight
            })
            st.success("Member added!")
            st.rerun()
        else:
            st.warning("Please fill all required fields.")

    # ---------------------------
    # Show Current Members
    # ---------------------------
    st.divider()
    st.subheader("👥 Current Members")

    members = agent.group.get_members()

    if members:
        for m in members:
            st.write(
                f"• **{m.name}** | Destinations: {', '.join(m.destinations)} | "
                f"Budget: {m.budget} | Pace: {m.pace} | Weight: {m.weight}"
            )
    else:
        st.info("No members added yet.")

    # ---------------------------
    # Generate Decision
    # ---------------------------
    st.divider()

    if st.button("🚀 Generate Optimized Decision"):

        if len(members) < 1:
            st.warning("Add at least one member.")
        else:
            result = agent.generate_group_decision()

            st.subheader("🏆 Optimized Decision")
            st.json(result["decision"])

            st.subheader("😊 Member Satisfaction")
            st.json(result["satisfaction_scores"])

            st.metric("Overall Group Happiness (%)", result["group_happiness"])

    # ---------------------------
    # Reset Group
    # ---------------------------
    st.divider()

    if st.button("🔄 Reset Group"):
        del st.session_state.packvote_agent
        st.success("Group reset successfully.")
        st.rerun()

