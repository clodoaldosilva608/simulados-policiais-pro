#!/bin/bash
# Mede tempo/qualidade do vision com 1 página vs 4 páginas por chamada
CFG=/etc/.z-ai-config
BASE=$(python3 -c "import json;print(json.load(open('$CFG'))['baseUrl'])")
TOK=$(python3 -c "import json;print(json.load(open('$CFG'))['token'])")
CID=$(python3 -c "import json;print(json.load(open('$CFG')).get('chatId',''))")

mkdir -p /tmp/pgs && rm -f /tmp/pgs/*.jpg
# páginas 2,3,4,5 a 80 dpi
pdftoppm -f 2 -l 5 -jpeg -jpegopt quality=70 -r 80 /home/z/my-project/upload/port-02-ortografia-hifen.pdf /tmp/pgs/p
ls /tmp/pgs/

make_body() {
python3 - "$@" > /tmp/vision-body.json << 'PY'
import json, sys, base64
files = sys.argv[1:]
parts = [{"type": "text", "text": "Transcreva TODO o texto visível destas imagens de uma apostila de concurso, em texto puro, na ordem em que aparecem, separando as páginas por uma linha em branco. Mantenha numeração de questões, enunciados e alternativas. Não comente, não resuma, não omita nada."}]
for f in files:
    b64 = base64.b64encode(open(f, 'rb').read()).decode()
    parts.append({"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + b64}})
print(json.dumps({"model": "gpt-4o-mini", "thinking": {"type": "disabled"}, "messages": [{"role": "user", "content": parts}]}))
PY
}

echo "=== 1 página (p-02) ==="
make_body /tmp/pgs/p-02.jpg
echo "body: $(($(wc -c < /tmp/vision-body.json)/1024)) KB"
curl -s -o /tmp/v1.json -w "HTTP %{http_code} em %{time_total}s\n" "$BASE/chat/completions/vision" \
  -H "Content-Type: application/json" -H "Authorization: Bearer Z.ai" -H "X-Z-AI-From: Z" \
  -H "X-Token: $TOK" ${CID:+-H "X-Chat-Id: $CID"} --max-time 120 -d @/tmp/vision-body.json
python3 -c "import json; d=json.load(open('/tmp/v1.json')); print('chars:', len(d['choices'][0]['message']['content']) if 'choices' in d else json.dumps(d)[:150])" 2>/dev/null

echo "=== 4 páginas (p-02..p-05) ==="
make_body /tmp/pgs/p-02.jpg /tmp/pgs/p-03.jpg /tmp/pgs/p-04.jpg /tmp/pgs/p-05.jpg
echo "body: $(($(wc -c < /tmp/vision-body.json)/1024)) KB"
curl -s -o /tmp/v4.json -w "HTTP %{http_code} em %{time_total}s\n" "$BASE/chat/completions/vision" \
  -H "Content-Type: application/json" -H "Authorization: Bearer Z.ai" -H "X-Z-AI-From: Z" \
  -H "X-Token: $TOK" ${CID:+-H "X-Chat-Id: $CID"} --max-time 150 -d @/tmp/vision-body.json
python3 -c "
import json
d = json.load(open('/tmp/v4.json'))
if 'choices' in d:
    c = d['choices'][0]['message']['content']
    print('chars:', len(c))
    print('tem q1?', '1.' in c or 'Questão 1' in c)
    print('início:', c[:200].replace(chr(10),' | '))
else:
    print(json.dumps(d)[:200])
" 2>/dev/null
