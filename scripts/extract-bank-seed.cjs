/* eslint-disable @typescript-eslint/no-require-imports */
// Extrai o array JSON de BANK_SEED (TS) para /tmp/bank-seed.json
const fs = require('fs')
const src = fs.readFileSync('/home/z/my-project/src/data/bank-seed.ts', 'utf8')
const start = src.indexOf('= [') + 2
const end = src.lastIndexOf(']')
if (start < 2 || end < 0) {
  console.error('delimitadores não encontrados')
  process.exit(1)
}
const json = src.slice(start, end + 1)
const arr = JSON.parse(json)
fs.writeFileSync('/tmp/bank-seed.json', JSON.stringify(arr))
console.log('questões extraídas:', arr.length)
console.log('primeira:', arr[0]?.id, '| última:', arr[arr.length - 1]?.id)
