from langchain_ollama import OllamaLLM

llm = OllamaLLM(
    model="mistral:7b",
    temperature=0.6,
    num_predict=450   # ✅ correct for Ollama
)

def chat(user_input: str) -> str:
    response = llm.invoke(user_input)
    return response.strip()
