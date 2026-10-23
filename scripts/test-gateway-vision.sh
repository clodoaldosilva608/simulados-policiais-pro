#!/bin/bash
# Testa visão no gateway (OCR de uma página do PDF do usuário)
CFG=/etc/.z-ai-config
BASE=$(python3 -c "import json;print(json.load(open('$CFG'))['baseUrl'])")
TOK=$(python3 -c "import json;print(json.load(open('$CFG'))['token'])")
CID=$(python3 -c "import json;print(json.load(open('$CFG')).get('chatId',''))")

# renderiza a página 2 como JPEG pequeno (80 dpi)
pdftoppm -f 2 -l 2 -jpeg -jpegopt quality=70 -r 80 /home/z/my-project/upload/port-02-ortografia-hifen.pdf /tmp/pg && ls -la /tmp/pg*.jpg
IMG_B64=$(base64 -w0 /tmp/pg-2.jpg 2>/dev/null || base64 -w0 /tmp/pg-02.jpg)
echo "imagem base64: $((${#IMG_B64}/1024)) KB"

REQ=$(python3 - "$IMG_B64" << 'PY'
import json, sys
b64 = sys.argv[1]
body = {
    "model": "gpt-4o-mini",
    "thinking": {"type": "disabled"},
    "messages": [{
        "role": "user",
        "content": [
            {"type": "text", "text": "Transcreva TODO o texto visível desta imagem de uma apostila, em texto puro, mantendo a ordem. Não comente nem resuma."},
            {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + b64}},
        ],
    }],
}
print(json.dumps(body))
PY
)
echo "body: $((${#REQ}/1024)) KB"

for EP in "/chat/completions" "/chat/completions/vision"; do
  echo "=== POST $EP ==="
  HTTP=$(curl -s -o /tmp/gw-vision.json -w "%{http_code}" "$BASE$EP" \
    -H "Content-Type: application/json" -H "Authorization: Bearer Z.ai" -H "X-Z-AI-From: Z" \
    -H "X-Token: $TOK" ${CID:+-H "X-Chat-Id: $CID"} \
    --max-time 120 -d "$REQ")
  echo "HTTP $HTTP"
  python3 - << 'PY'
import json
try:
    d = json.load(open('/tmp/gw-vision.json'))
    if 'choices' in d:
        c = d['choices'][0]['message']['content']
        print('transcrição (primeiros 400):', c[:400].replace('\n', ' | '))
        print('... total chars:', len(c))
    else:
        print('resp:', json.dumps(d)[:250])
except Exception:
    print('resp não-JSON:', open('/tmp/gw-vision.json').read()[:250])
PY
done
