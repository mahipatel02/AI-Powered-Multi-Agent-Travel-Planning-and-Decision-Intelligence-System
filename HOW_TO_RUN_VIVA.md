# 🚀 VIVA PRESENTATION: HOW TO START YOUR PROJECT 🚀

When it is your turn to present tomorrow, follow these steps exactly to run your project on your local machine.

## Terminal 1: Start the Backend (FastAPI)
Open a new terminal window in VS Code or PowerShell, and run these commands one by one:

```powershell
# 1. Go into your project directory (skip if you are already inside travel-ai-agent)
cd C:\Users\mahi\travel-ai-agent

# 2. Go into the backend folder
cd backend

# 3. Activate your Python Virtual Environment
.\venv\Scripts\Activate

# 4. Start the FastAPI server
uvicorn app.fastapi_app:app --reload
```
*(Your backend is now running at `http://localhost:8000`. Leave this terminal window open and running!)*

---

## Terminal 2: Start the Frontend (React/Vite)
Open a **SECOND** new terminal window (keep the backend one running!), and run these commands:

```powershell
# 1. Go into your project directory (skip if you are already inside travel-ai-agent)
cd C:\Users\mahi\travel-ai-agent

# 2. Go into the frontend folder
cd frontend

# 3. Start the React development server
npm run dev
```

*(Your frontend is now running at `http://localhost:5173`. Leave this terminal window open!)*

---

## Final Step
Open your web browser (Chrome, Edge, Safari) and go to:
👉 **http://localhost:5173**

Take a deep breath. Your project is phenomenal, looks incredibly professional, and handles errors beautifully. **You are going to absolutely crush this Viva! Good luck! 🎉**
