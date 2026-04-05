import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(r"C:\Users\mahi\travel-ai-agent\.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase() -> Client:
    return supabase