"""Configura as env vars do gateway de IA na Vercel (production/preview/development)."""
import json
import urllib.request

VERCEL_TOKEN = "vcp_101JcBxPkAWJySJisg9r0NEWZ5plt8eMwagj0z1kuqUcQGbZ5d0EN1gT"
PROJECT_ID = "prj_FJzi584zmq8QjdBZcd5TA80G9Bin"

cfg = json.load(open("/etc/.z-ai-config"))

env_vars = [
    ("AI_API_BASE", cfg["baseUrl"], "plain"),
    ("AI_API_KEY", cfg.get("apiKey", "Z.ai"), "plain"),
    ("AI_API_TOKEN", cfg["token"], "encrypted"),
    ("AI_CHAT_ID", cfg.get("chatId", ""), "plain"),
    ("AI_MODEL", "gpt-4o-mini", "plain"),
]

for key, value, vtype in env_vars:
    if not value:
        print(f"skip {key} (vazio)")
        continue
    body = json.dumps({
        "key": key,
        "value": value,
        "type": vtype,
        "target": ["production", "preview", "development"],
    }).encode()
    req = urllib.request.Request(
        f"https://api.vercel.com/v10/projects/{PROJECT_ID}/env?upsert=true",
        data=body,
        headers={"Authorization": f"Bearer {VERCEL_TOKEN}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as res:
            print(key, "-> HTTP", res.status)
    except urllib.error.HTTPError as e:
        print(key, "-> ERRO", e.code, e.read().decode()[:200])
