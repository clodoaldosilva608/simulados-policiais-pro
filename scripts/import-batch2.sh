#!/bin/bash
# Importa o lote 2 (questoes-batch2.csv) na produção via admin API
set -e
BASE="https://simuladospoliciais.vercel.app"
COOKIE=/tmp/spp-admin-cookie.txt
CSV=/tmp/deploy-src/scripts/bank-out/questoes-batch2.csv

# 1) login
LOGIN=$(curl -s -c "$COOKIE" -H 'Content-Type: application/json' \
  -d '{"username":"clodoaldo608@gmail.com","password":"Policial88677488"}' \
  "$BASE/api/admin/login")
echo "LOGIN: $LOGIN"

# 2) import via JSON {csv: ...} (python monta o JSON com escape correto)
python3 - <<PYEOF
import json, urllib.request, http.cookiejar

csv = open('/tmp/deploy-src/scripts/bank-out/questoes-batch2.csv', encoding='utf-8').read()
cookie = open('/tmp/spp-admin-cookie.txt', encoding='utf-8').read()
# extrai o par admin_session (nome do cookie com valor assinado)
sess = None
for line in cookie.splitlines():
    if '\t' in line:
        parts = line.split('\t')
        if len(parts) >= 7 and 'admin' in parts[5]:
            sess = f"{parts[5]}={parts[6]}"
if not sess:
    raise SystemExit('cookie admin nao encontrado')
body = json.dumps({'csv': csv}).encode()
req = urllib.request.Request(
    'https://simuladospoliciais.vercel.app/api/admin/questions/import',
    data=body, method='POST',
    headers={'Content-Type': 'application/json', 'Cookie': sess})
with urllib.request.urlopen(req, timeout=120) as r:
    print('IMPORT:', r.read().decode()[:400])
PYEOF

# 3) total no banco (rota pública do aluno)
curl -s "$BASE/api/questions?limit=1" | python3 -c "import sys,json; d=json.load(sys.stdin); print('TOTAL NO BANCO:', d.get('total'))"

rm -f "$COOKIE"
echo "cookie removido"
