import subprocess
import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MEMORY_FILE = ROOT / "agent" / "memory.json"
PROMPT_FILE = ROOT / "agent" / "prompt.txt"

def run(cmd):
    return subprocess.getoutput(cmd)

def project_tree():
    return run(
        "find app bootstrap config routes public agent "
        "-maxdepth 3 -type f 2>/dev/null | sed 's|^./||'"
    )

def git_status():
    return run("git status --short")

def load_prompt():
    return PROMPT_FILE.read_text()

def build_prompt():
    return f"""
{load_prompt()}

--- PROJECT TREE ---
{project_tree()}

--- GIT STATUS ---
{git_status()}
"""

def call_llm(prompt):
    process = subprocess.Popen(
        ["ollama", "run", "qwen2.5"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    stdout, stderr = process.communicate(prompt)
    return stdout if stdout else stderr

def save_memory(response):
    memory = json.loads(MEMORY_FILE.read_text())
    memory.append({
        "time": datetime.now().isoformat(),
        "response": response
    })
    MEMORY_FILE.write_text(json.dumps(memory, indent=2))

if __name__ == "__main__":
    prompt = build_prompt()
    response = call_llm(prompt)
    save_memory(response)
    print("\n=== PLANNER AGENT OUTPUT ===\n")
    print(response)