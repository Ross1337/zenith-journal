import { Fragment } from 'react';

/**
 * Minimal markdown → React renderer. Supports: #/##/### headings, **bold**,
 * *italic*, `code`, - lists, paragraphs. Builds React nodes (never raw HTML)
 * so user content is XSS-safe by construction.
 */

function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // Tokenize bold / italic / code in one pass.
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith('**')) {
      out.push(
        <strong key={key++} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('`')) {
      out.push(
        <code key={key++} className="z-numeric rounded-xs bg-high px-1 py-px text-[0.92em] text-gold">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      out.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ children }: { children: string }) {
  const lines = children.split('\n');
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={key++} className="my-2 list-disc space-y-1 pl-5">
        {list.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const listMatch = /^[-*]\s+(.*)$/.exec(line.trim());
    if (listMatch) {
      list.push(listMatch[1] ?? '');
      continue;
    }
    flushList();

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1]!.length;
      const text = renderInline(heading[2] ?? '');
      blocks.push(
        level === 1 ? (
          <h3 key={key++} className="mb-1 mt-3 font-display text-[15px] font-semibold text-ink">
            {text}
          </h3>
        ) : level === 2 ? (
          <h4 key={key++} className="mb-1 mt-3 font-display text-[13.5px] font-semibold text-ink">
            {text}
          </h4>
        ) : (
          <h5 key={key++} className="mb-0.5 mt-2 text-[12.5px] font-semibold uppercase tracking-wider text-ink-secondary">
            {text}
          </h5>
        ),
      );
      continue;
    }

    if (line.trim() === '') continue;
    blocks.push(
      <p key={key++} className="my-1.5">
        {renderInline(line)}
      </p>,
    );
  }
  flushList();

  return <Fragment>{blocks}</Fragment>;
}
