from agents.chatbot_agent import chat

print("\n🤖 Simple Chatbot (type 'exit' to quit)\n")

while True:
    user_input = input("You: ")

    if user_input.lower() == "exit":
        break

    response = chat(user_input)
    print("\nBot:", response, "\n")