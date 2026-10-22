/** Valida os packs oficiais: todo item precisa de gabarito, opções e (se textRef) texto existente. */
import { OFFICIAL_PACKS } from '../src/data/official'

let errors = 0
for (const pack of OFFICIAL_PACKS) {
  const gabs = new Set(pack.questions.map((q) => q.id))
  const dupes = pack.questions.length - gabs.size
  if (dupes > 0) {
    errors++
    console.log(`❌ ${pack.id}: ${dupes} ids duplicados`)
  }
  for (const q of pack.questions) {
    if (!q.answer) {
      errors++
      console.log(`❌ ${pack.id} q${q.id}: answer indefinida`)
    }
    if (!q.options || q.options.length === 0) {
      errors++
      console.log(`❌ ${pack.id} q${q.id}: sem opções`)
    }
    if (q.textRef && !pack.textBlocks[q.textRef]) {
      errors++
      console.log(`❌ ${pack.id} q${q.id}: textRef "${q.textRef}" sem TextBlock`)
    }
  }
  const withText = pack.questions.filter((q) => q.textRef).length
  console.log(
    `✅ ${pack.id}: ${pack.questions.length} questões | ${withText} com texto-base | ${pack.textBlocks && Object.keys(pack.textBlocks).length} textBlocks | formato ${pack.questionFormat}`,
  )
}
console.log(errors === 0 ? '\n✨ TUDO OK' : `\n💥 ${errors} erros`)
