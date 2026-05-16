import { Fragment, type ReactNode } from "react";

/**
 * Minimum markdown renderer — sözleşme metni için yeterli.
 * Desteklenen: H1-H4, paragraf, bold (**), tablo (|), liste (- veya 1.), yatay çizgi (---).
 * Karmaşık edge case'ler için ileride remark/rehype eklenebilir.
 */

interface MarkdownProps {
  source: string;
  className?: string;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\*\*([^*]+?)\*\*|`([^`]+?)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(
        <strong key={`${keyPrefix}-b-${i++}`} className="font-medium text-foreground">
          {match[1]}
        </strong>,
      );
    } else if (match[2]) {
      parts.push(
        <code
          key={`${keyPrefix}-c-${i++}`}
          className="rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono"
        >
          {match[2]}
        </code>,
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export function Markdown({ source, className }: MarkdownProps) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  let i = 0;
  let blockCounter = 0;
  const nextKey = () => `md-${blockCounter++}`;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={nextKey()} className="my-10 border-border" />);
      i++;
      continue;
    }

    // Headings
    const headingMatch = /^(#{1,6})\s+(.+?)$/.exec(line);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = renderInline(headingMatch[2], nextKey());
      const sharedClass =
        level === 1
          ? "font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl"
          : level === 2
            ? "font-serif text-2xl leading-snug tracking-tight text-foreground mt-12 mb-3"
            : level === 3
              ? "text-lg font-medium text-foreground mt-6 mb-2"
              : "text-base font-medium text-foreground mt-4 mb-1";
      const Tag = (`h${level}` as unknown) as keyof React.JSX.IntrinsicElements;
      blocks.push(
        <Tag key={nextKey()} className={sharedClass}>
          {content}
        </Tag>,
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        buf.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <blockquote
          key={nextKey()}
          className="my-4 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
        >
          {renderInline(buf.join(" "), nextKey())}
        </blockquote>,
      );
      continue;
    }

    // Tables (header | sep | rows)
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      /^\s*\|?[-:|\s]+\|?\s*$/.test(lines[i + 1])
    ) {
      const headerCells = line
        .split("|")
        .map((c) => c.trim())
        .filter((_, idx, arr) =>
          // İlk veya son boş hücreyi (kenardan kaynaklı) at
          !((idx === 0 || idx === arr.length - 1) && _.length === 0),
        );
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        const cells = lines[i]
          .split("|")
          .map((c) => c.trim())
          .filter((c, idx, arr) =>
            !((idx === 0 || idx === arr.length - 1) && c.length === 0),
          );
        rows.push(cells);
        i++;
      }
      blocks.push(
        <div
          key={nextKey()}
          className="my-4 overflow-x-auto rounded-2xl border border-border"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40">
                {headerCells.map((h, idx) => (
                  <th
                    key={idx}
                    className="px-3 py-2 text-left font-medium text-foreground"
                  >
                    {renderInline(h, `th-${idx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-t border-border">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 align-top text-muted-foreground">
                      {renderInline(cell, `td-${rIdx}-${cIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul
          key={nextKey()}
          className="my-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground"
        >
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `li-${idx}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol
          key={nextKey()}
          className="my-3 list-decimal space-y-1 pl-6 text-sm text-muted-foreground"
        >
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `oli-${idx}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph (with line wrapping)
    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !lines[i].startsWith("> ") &&
      !/^---+$/.test(lines[i].trim())
    ) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={nextKey()} className="my-3 text-sm leading-7 text-muted-foreground">
        {renderInline(buf.join(" "), nextKey())}
      </p>,
    );
  }

  return (
    <article className={className}>
      {blocks.map((b, idx) => (
        <Fragment key={idx}>{b}</Fragment>
      ))}
    </article>
  );
}
