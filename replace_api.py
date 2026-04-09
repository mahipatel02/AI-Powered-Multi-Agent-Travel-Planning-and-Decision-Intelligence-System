import os
import glob
files = glob.glob('c:/Users/mahi/travel-ai-agent/frontend/src/**/*.jsx', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    new_content = content.replace('https://ai-powered-multi-agent-travel-planning.onrender.com', 'http://localhost:8000')
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
print("Reverted APIs to localhost!")
