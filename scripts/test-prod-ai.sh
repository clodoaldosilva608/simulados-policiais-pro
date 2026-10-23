#!/bin/bash
# Testa /api/transcribe e /api/generate EM PRODUÇÃO com o PDF do usuário
BASE="https://simuladospoliciais.vercel.app"

# 1) transcribe: página 2
python3 - << 'PY' > /tmp/t-body.json
import json, base64
b64 = base64.b64encode(open('/tmp/pgs/p-02.jpg', 'rb').read()).decode()
print(json.dumps({"images": ["data:image/jpeg;base64," + b64]}))
PY

echo "=== POST /api/transcribe ==="
curl -s -o /tmp/t-resp.json -w "HTTP %{http_code} em %{time_total}s\n" "$BASE/api/transcribe" \
  -H "Content-Type: application/json" --max-time 120 -d @/tmp/t-body.json
python3 -c "
import json
d = json.load(open('/tmp/t-resp.json'))
if 'text' in d:
    t = d['text']
    print('transcrito:', len(t), 'chars |', t[:150].replace(chr(10), ' | '))
    open('/tmp/t-texto.txt', 'w').write(t)
else:
    print('ERRO:', json.dumps(d)[:200])
"

# 2) generate: pedaço do texto transcrito
python3 - << 'PY' > /tmp/g-body.json
import json
t = open('/tmp/t-texto.txt').read() if __import__('os').path.exists('/tmp/t-texto.txt') else ''
if len(t) < 300:
    t = ("A ortografia oficial da língua portuguesa é regulada pelo Acordo Ortográfico. O emprego do hífen "
         "segue regras específicas: usa-se hífen diante de h (anti-higiene), prefixo terminado em vogal diante "
         "de vogal igual (micro-ondas), e não se usa hífen em prefixo terminado em vogal diante de vogal "
         "diferente (autoescola). As regras do novo acordo ortográfico definem ainda o uso do hífen com "
         "prefixos como ex-, vice- e além- que sempre exigem hífen (ex-marido, vice-presidente, além-mar). "
         "Antes da reforma, grafia-se automaticamente; hoje as regras mudaram e o estudante deve memorizar "
         "os casos especiais do hífen para a prova da PRF.")
chunk = t[:6000]
print(json.dumps({"chunk": chunk, "style": "multipla", "count": 3}))
PY

echo "=== POST /api/generate ==="
curl -s -o /tmp/g-resp.json -w "HTTP %{http_code} em %{time_total}s\n" "$BASE/api/generate" \
  -H "Content-Type: application/json" --max-time 120 -d @/tmp/g-body.json
python3 -c "
import json
d = json.load(open('/tmp/g-resp.json'))
if 'questions' in d:
    qs = d['questions']
    print('questões geradas:', len(qs))
    q = qs[0]
    print('q1:', q['statement'][:120])
    print('opções:', [o['key'] for o in q['options']], '| gabarito:', q['answer'])
else:
    print('ERRO:', json.dumps(d)[:200])
"
