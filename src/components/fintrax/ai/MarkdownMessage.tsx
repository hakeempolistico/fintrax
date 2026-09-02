'use client'

import { Fragment, ReactNode } from 'react'

type Props = {
  content: string
}

const safeHref = (href: string) => {
  try {
    const url = new URL(href)
    if (url.protocol === 'http:' || url.protocol === 'https:') return href
  } catch {
    // Ignore malformed or relative URLs from model output.
  }
  return undefined
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|`[^`]+`|\[[^\]]+\]\([^\s)]+\)|\$[^$\n]+\$|\*[^*]+\*|_[^_]+_)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
    const token = match[0]

    if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      nodes.push(<strong key={key++} className="font-semibold text-gray-900 dark:text-white">{renderInline(token.slice(2, -2))}</strong>)
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      nodes.push(<del key={key++}>{renderInline(token.slice(2, -2))}</del>)
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(<code key={key++} className="rounded bg-gray-200/70 px-1.5 py-0.5 font-mono text-[0.9em] text-gray-800 dark:bg-gray-800 dark:text-gray-200">{token.slice(1, -1)}</code>)
    } else if (token.startsWith('$') && token.endsWith('$')) {
      nodes.push(
        <span key={key++} className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.92em] text-gray-800 dark:bg-gray-800/80 dark:text-gray-200" title="LaTeX expression">
          {token.slice(1, -1)}
        </span>,
      )
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/)
      if (linkMatch) {
        const href = safeHref(linkMatch[2])
        nodes.push(href ? (
          <a key={key++} href={href} target="_blank" rel="noreferrer noopener" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
            {renderInline(linkMatch[1])}
          </a>
        ) : token)
      } else {
        nodes.push(token)
      }
    } else if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      nodes.push(<em key={key++}>{renderInline(token.slice(1, -1))}</em>)
    } else {
      nodes.push(token)
    }

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

const splitTableRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())

const isTableSeparator = (line: string) => {
  const cells = splitTableRow(line)
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

const headingClass = (level: number) => {
  if (level === 1) return 'mt-5 mb-2 text-lg font-semibold text-gray-900 dark:text-white'
  if (level === 2) return 'mt-4 mb-2 text-base font-semibold text-gray-900 dark:text-white'
  if (level === 3) return 'mt-3 mb-1.5 text-sm font-semibold text-gray-900 dark:text-white'
  return 'mt-3 mb-1 text-sm font-medium text-gray-900 dark:text-white'
}

export default function MarkdownMessage({ content }: Props) {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim()
      const code: string[] = []
      index += 1
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        code.push(lines[index])
        index += 1
      }
      if (index < lines.length) index += 1
      blocks.push(
        <div key={`code-${index}`} className="my-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-950 dark:border-gray-700">
          {language && <div className="border-b border-white/10 px-3 py-1.5 text-xs uppercase tracking-wide text-gray-400">{language}</div>}
          <pre className="overflow-x-auto p-3 text-xs leading-5 text-gray-100"><code>{code.join('\n')}</code></pre>
        </div>,
      )
      continue
    }

    if (line.trim() === '$$') {
      const math: string[] = []
      index += 1
      while (index < lines.length && lines[index].trim() !== '$$') {
        math.push(lines[index])
        index += 1
      }
      if (index < lines.length) index += 1
      blocks.push(
        <div key={`math-${index}`} className="my-3 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" title="LaTeX expression">
          {math.join('\n')}
        </div>,
      )
      continue
    }

    const inlineBlockMath = line.match(/^\s*\$\$(.+)\$\$\s*$/)
    if (inlineBlockMath) {
      blocks.push(
        <div key={`math-inline-${index}`} className="my-3 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" title="LaTeX expression">
          {inlineBlockMath[1].trim()}
        </div>,
      )
      index += 1
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      blocks.push(<div key={`h-${index}`} className={headingClass(level)}>{renderInline(heading[2])}</div>)
      index += 1
      continue
    }

    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      blocks.push(<hr key={`hr-${index}`} className="my-4 border-gray-200 dark:border-gray-700" />)
      index += 1
      continue
    }

    if (
      index + 1 < lines.length &&
      line.includes('|') &&
      isTableSeparator(lines[index + 1])
    ) {
      const headers = splitTableRow(line)
      const rows: string[][] = []
      index += 2
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]))
        index += 1
      }

      blocks.push(
        <div key={`table-${index}`} className="my-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800/80">
              <tr>
                {headers.map((header, headerIndex) => (
                  <th key={headerIndex} className="whitespace-nowrap border-b border-gray-200 px-3 py-2 font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
                    {renderInline(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-100 last:border-b-0 dark:border-gray-800">
                  {headers.map((_, cellIndex) => (
                    <td key={cellIndex} className="align-top px-3 py-2 text-gray-700 dark:text-gray-300">
                      {renderInline(row[cellIndex] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = []
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ''))
        index += 1
      }
      blocks.push(
        <blockquote key={`quote-${index}`} className="my-3 border-l-2 border-brand-300 pl-3 text-gray-600 dark:border-brand-500/60 dark:text-gray-300">
          {quote.map((item, quoteIndex) => <Fragment key={quoteIndex}>{quoteIndex > 0 && <br />}{renderInline(item)}</Fragment>)}
        </blockquote>,
      )
      continue
    }

    const unordered = line.match(/^(\s*)[-+*]\s+(.+)$/)
    if (unordered) {
      const items: { depth: number; text: string }[] = []
      while (index < lines.length) {
        const match = lines[index].match(/^(\s*)[-+*]\s+(.+)$/)
        if (!match) break
        items.push({ depth: Math.floor(match[1].replace(/\t/g, '  ').length / 2), text: match[2] })
        index += 1
      }
      blocks.push(
        <ul key={`ul-${index}`} className="my-2 space-y-1">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="relative pl-5" style={{ marginLeft: `${Math.min(item.depth, 6) * 16}px` }}>
              <span className="absolute left-1 top-[0.7em] h-1.5 w-1.5 rounded-full bg-gray-400" />
              {renderInline(item.text)}
            </li>
          ))}
        </ul>,
      )
      continue
    }

    const ordered = line.match(/^(\s*)\d+[.)]\s+(.+)$/)
    if (ordered) {
      const items: { depth: number; number: string; text: string }[] = []
      while (index < lines.length) {
        const match = lines[index].match(/^(\s*)(\d+)[.)]\s+(.+)$/)
        if (!match) break
        items.push({ depth: Math.floor(match[1].replace(/\t/g, '  ').length / 2), number: match[2], text: match[3] })
        index += 1
      }
      blocks.push(
        <ol key={`ol-${index}`} className="my-2 space-y-1">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="flex gap-2" style={{ marginLeft: `${Math.min(item.depth, 6) * 16}px` }}>
              <span className="shrink-0 text-gray-500">{item.number}.</span>
              <span>{renderInline(item.text)}</span>
            </li>
          ))}
        </ol>,
      )
      continue
    }

    const paragraph: string[] = [line]
    index += 1
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith('```') &&
      lines[index].trim() !== '$$' &&
      !/^(#{1,6})\s+/.test(lines[index]) &&
      !/^\s*>\s?/.test(lines[index]) &&
      !/^\s*[-+*]\s+/.test(lines[index]) &&
      !/^\s*\d+[.)]\s+/.test(lines[index]) &&
      !(index + 1 < lines.length && lines[index].includes('|') && isTableSeparator(lines[index + 1]))
    ) {
      paragraph.push(lines[index])
      index += 1
    }

    blocks.push(
      <p key={`p-${index}`} className="my-2 first:mt-0 last:mb-0">
        {paragraph.map((item, paragraphIndex) => (
          <Fragment key={paragraphIndex}>{paragraphIndex > 0 && <br />}{renderInline(item)}</Fragment>
        ))}
      </p>,
    )
  }

  return <div className="min-w-0 break-words">{blocks}</div>
}
