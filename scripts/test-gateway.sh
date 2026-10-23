#!/bin/bash
# Testa o gateway Z.ai exatamente como o provider viaOpenAI usaria (com headers extras)
CFG=/etc/.z-ai-config
BASE=$(python3 -c "import json;print(json.load(open('$CFG'))['baseUrl'])")
TOK=$(python3 -c "import json;print(json.load(open('$CFG'))['token'])")
CID=$(python3 -c "import json;print(json.load(open('$CFG')).get('chatId',''))")
UID=$(python3 -c "import json;print(json.load(open('$CFG')).get('userId',''))")

call_text() {
  local label="$1"; local body="$2"
  echo "=== $label ==="
  curl -s -o /tmp/gw-resp.json -w "HTTP %{http_code} em %{time_total}s\n" "$BASE/chat/completions" \
    -H "Content-Type: application/json" -H "Authorization: Bearer Z.ai" -H "X-Z-AI-From: Z" \
    -H "X-Token: $TOK" ${CID:+-H "X-Chat-Id: $CID"} ${UID:+-H "X-User-Id: $UID"} \
    -d "$body"
  python3 - << 'PY'
import json
try:
    d = json.load(open('/tmp/gw-resp.json'))
    if 'choices' in d:
        print('modelo:', d.get('model'), '| conteúdo:', repr(d['choices'][0]['message']['content'][:120]))
    else:
        print('resp:', json.dumps(d)[:300])
except Exception as e:
    print('resp não-JSON:', open('/tmp/gw-resp.json').read()[:300])
PY
}

# 1) modelo gpt-4o-mini
call_text "texto model=gpt-4o-mini" '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Responda apenas: OK"}],"thinking":{"type":"disabled"}}'
# 2) sem model
call_text "texto sem model" '{"messages":[{"role":"user","content":"Responda apenas: OK"}],"thinking":{"type":"disabled"}}'
# 3) glm-4.6
call_text "texto model=glm-4.6" '{"model":"glm-4.6","messages":[{"role":"user","content":"Responda apenas: OK"}],"thinking":{"type":"disabled"}}'
# 4) SEM o header X-Token (para provar que é obrigatório)
echo "=== texto SEM X-Token ==="
curl -s -o /tmp/gw-resp2.json -w "HTTP %{http_code}\n" "$BASE/chat/completions" \
  -H "Content-Type: application/json" -H "Authorization: Bearer Z.ai" -H "X-Z-AI-From: Z" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Responda apenas: OK"}],"thinking":{"type":"disabled"}}'
head -c 200 /tmp/gw-resp2.json; echo
