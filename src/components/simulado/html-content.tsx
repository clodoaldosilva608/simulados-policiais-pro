interface HtmlContentProps {
  html: string
  className?: string
}

/**
 * Renderiza strings HTML confiáveis (dados estáticos do simulado),
 * aplicando estilos tipográficos consistentes ao conteúdo.
 */
export function HtmlContent({ html, className = '' }: HtmlContentProps) {
  return (
    <div
      className={`text-[15px] leading-relaxed text-slate-800 [&_b]:font-semibold [&_em]:italic [&_li]:mb-1 [&_ol]:list-decimal [&_p]:mb-3 [&_p:last-child]:mb-0 [&_sub]:text-xs [&_sup]:text-xs [&_u]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:pl-5 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
