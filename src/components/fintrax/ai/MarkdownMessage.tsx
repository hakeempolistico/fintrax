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
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|`[^`]+`|\[[^\]]+\]\([^\s)]+\)|\*[^*]+\*|_[^_]+_)/g
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
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/)
      if (linkMatch) {
        const href = safeHref(linkMatch[2])
        nodes.push(href ? (
          <a key={key++} href={href} target="_blank" rel="noreferrer noopener" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
            {linkMatch[1]}
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
          {language && <div className="border-b border-white/10 px-3 py-1.5 text-xs text-gray-400">{language}</div>}
          <pre className="overflow-x-auto p-3 text-xs leading-5 text-gray-100"><code>{code.join('\n')}</code></pre>
        </div>,
      )
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      const classes = level <= 2
        ? 'mt-4 mb-2 text-base font-semibold text-gray-900 dark:text-white'
        : 'mt-3 mb-1.5 text-sm font-semibold text-gray-900 dark:text-white'
      blocks.push(<div key={`h-${index}`} className={classes}>{renderInline(heading[2])}</div>)
      index += 1
      continue
    }

    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      blocks.push(<hr key={`hr-${index}`} className="my-4 border-gray-200 dark:border-gray-700" />)
      index += 1
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

    const unordered = line.match(/^\s*[-+*]\s+(.+)$/)
    if (unordered) {
      const items: string[] = []
      while (index < lines.length) {
        const match = lines[index].match(/^\s*[-+*]\s+(.+)$/)
        if (!match) break
        items.push(match[1])
        index += 1
      }
      blocks.push(
        <ul key={`ul-${index}`} className="my-2 list-disc space-y-1 pl-5 marker:text-gray-400">
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
        </ul>,
      )
      continue
    }

    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/)
    if (ordered) {
      const items: string[] = []
      while (index < lines.length) {
        const match = lines[index].match(/^\s*\d+[.)]\s+(.+)$/)
        if (!match) break
        items.push(match[1])
        index += 1
      }
      blocks.push(
        <ol key={`ol-${index}`} className="my-2 list-decimal space-y-1 pl-5 marker:text-gray-500">
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
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
      !/^(#{1,6})\s+/.test(lines[index]) &&
      !/^\s*>\s?/.test(lines[index]) &&
      !/^\s*[-+*]\s+/.test(lines[index]) &&
      !/^\s*\d+[.)]\s+/.test(lines[index])
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
