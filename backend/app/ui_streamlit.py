import streamlit as st
from agents.chatbot_agent import chat

# -------------------------------
# Page Config (SAFE)
# -------------------------------
st.set_page_config(
    page_title="Travel AI Agent",
    page_icon="🧳",
    layout="centered"
)

st.title("🧳 Travel AI Agent")
st.caption("Local AI Travel Assistant (Ollama + LLaMA 3)")

# -------------------------------
# Session State
# -------------------------------
if "history" not in st.session_state:
    st.session_state.history = []

# -------------------------------
# Input Box
# -------------------------------
user_input = st.text_input("Ask something about travel:")

if st.button("Send") and user_input:
    with st.spinner("Thinking..."):
        response = chat(user_input)

    st.session_state.history.append(("You", user_input))
    st.session_state.history.append(("AI", response))

# -------------------------------
# Display Chat History
# -------------------------------
st.divider()

for role, message in st.session_state.history:
    if role == "You":
        st.markdown(f"**🧑 You:** {message}")
    else:
        st.markdown(f"**🤖 AI:** {message}")
