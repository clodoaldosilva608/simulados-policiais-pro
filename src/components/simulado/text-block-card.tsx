import { BookOpen } from 'lucide-react'
import type { TextBlock } from '@/data/types'

interface TextBlockCardProps {
  text: TextBlock
}

export function TextBlockCard({ text }: TextBlockCardProps) {
  return (
    <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50/80">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5">
        <BookOpen className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-800">{text.title}</h3>
      </div>
      <div className="scroll-thin max-h-[26rem] overflow-y-auto px-4 py-3">
        {text.paragraphs.map((p, i) => (
          <p key={i} className="mb-3 text-[15px] leading-relaxed text-slate-700 last:mb-0">
            {p}
          </p>
        ))}
        {text.source && <p className="mt-4 text-xs italic text-slate-400">{text.source}</p>}
      </div>
    </div>
  )
}
