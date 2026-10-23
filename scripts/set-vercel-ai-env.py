"""Configura as env vars do gateway de IA na Vercel (production/preview/development).

Segurança: o token NUNCA fica no código — leia do ambiente OU de /etc/.z-ai-config.
Uso: VERCEL_TOKEN=vcp_... python scripts/set-vercel-ai-env.py
"""
import json
import os
import urllib.request

def _token() -> str:
    tok = os.environ.get("VERCEL_TOKEN", "").strip()
    if tok:
        return tok
    try:
        return json.load(open("/etc/.z-ai-config")).get("vercelToken", "").strip()
    except Exception:
        return ""

VERCEL_TOKEN = _token()
if not VERCEL_TOKEN:
    raise SystemExit("Defina VERCEL_TOKEN no ambiente (nunca commitar tokens!)")
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
