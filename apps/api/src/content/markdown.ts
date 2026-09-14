import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

export interface OutlineEntry {
  depth: number;
  id: string;
  text: string;
}

export interface RenderedMarkdown {
  html: string;
  outline: OutlineEntry[];
}

/** Stable, accent-free heading id: the anchor a chapter URL can link to. */
export function slugifyHeading(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * highlight.js emits semantic classes rather than inline colours, so one
 * stylesheet themes code in both light and dark (docs/decisions.md).
 */
function highlight(code: string, language: string): string {
  if (language && hljs.getLanguage(language)) {
    try {
      return hljs.highlight(code, { language, ignoreIllegals: true }).value;
    } catch {
      // A malformed snippet must not break a whole chapter; fall through to plain.
    }
  }
  return '';
}

const markdown: MarkdownIt = new MarkdownIt({
  html: false, // raw HTML in content is never trusted, so never parsed
  linkify: false,
  typographer: false,
  highlight: (code, language) => {
    const highlighted = highlight(code, language);
    const body = highlighted || markdown.utils.escapeHtml(code);
    const languageClass = language ? ` language-${markdown.utils.escapeHtml(language)}` : '';
    return `<pre class="hljs${languageClass}"><code data-language="${markdown.utils.escapeHtml(language)}">${body}</code></pre>`;
  },
});

/**
 * Hints and solutions (docs/content-model.md): `:::indice`, `:::solution` and
 * `:::reponse` blocks closed by `:::`, rendered as native <details> — closed by
 * default, opened by keyboard, no client script. Three fixed names do not need
 * a plugin dependency.
 */
const CONTAINERS = {
  indice: { className: 'hint', label: 'Voir un indice', again: 'Un autre indice' },
  solution: { className: 'solution', label: 'Je ne sais pas — voir la solution', again: '' },
  reponse: { className: 'solution', label: 'Je ne sais pas — voir une réponse', again: '' },
} as const;
type ContainerName = keyof typeof CONTAINERS;

const OPENER = /^:::\s*(indice|solution|reponse)\s*$/;
const CLOSER = /^:::\s*$/;

type BlockRule = Parameters<typeof markdown.block.ruler.before>[2];

const container: BlockRule = (state, startLine, endLine, silent) => {
  if (state.sCount[startLine]! - state.blkIndent >= 4) return false;
  const start = state.bMarks[startLine]! + state.tShift[startLine]!;
  const name = OPENER.exec(state.src.slice(start, state.eMarks[startLine]!))?.[1] as ContainerName | undefined;
  if (!name) return false;
  if (silent) return true;

  let line = startLine;
  let closed = false;
  while (++line < endLine) {
    const lineStart = state.bMarks[line]! + state.tShift[line]!;
    const lineEnd = state.eMarks[line]!;
    // A non-blank line indented less than the block ends the list item it lives in.
    if (lineStart < lineEnd && state.sCount[line]! < state.blkIndent) break;
    if (state.sCount[line]! - state.blkIndent < 4 && CLOSER.test(state.src.slice(lineStart, lineEnd))) {
      closed = true;
      break;
    }
  }

  const parentType = state.parentType;
  const lineMax = state.lineMax;
  state.parentType = 'container' as unknown as typeof state.parentType;
  state.lineMax = line;

  const open = state.push('container_open', 'details', 1);
  open.block = true;
  open.info = name;
  open.map = [startLine, line];
  state.md.block.tokenize(state, startLine + 1, line);
  const close = state.push('container_close', 'details', -1);
  close.block = true;
  close.info = name;

  state.parentType = parentType;
  state.lineMax = lineMax;
  state.line = line + (closed ? 1 : 0);
  return true;
};

markdown.block.ruler.before('fence', 'container', container, {
  alt: ['paragraph', 'reference', 'blockquote', 'list'],
});

markdown.renderer.rules['container_open'] = (tokens, index) => {
  const token = tokens[index]!;
  const spec = CONTAINERS[token.info as ContainerName];
  const previous = tokens[index - 1];
  // Consecutive hints: the second one reads as more help, not as the first again.
  const again = previous?.type === 'container_close' && previous.info === token.info && spec.again;
  return `<details class="${spec.className}"><summary>${again || spec.label}</summary><div class="reveal">\n`;
};
markdown.renderer.rules['container_close'] = () => '</div></details>\n';

/**
 * Sanitising is the LAST step: nothing downstream can reintroduce markup.
 * The allowlist is deliberately narrow — content is Git-reviewed, but a bad
 * chapter must never become stored XSS (docs/architecture.md §6).
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'blockquote', 'ul', 'ol', 'li', 'hr', 'br',
    'strong', 'em', 'del', 'code', 'pre', 'span',
    'a', 'img',
    'details', 'summary', 'div',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    // rel and target are added by transformTags below; unlisted attributes are
    // stripped after the transform, so they must be allowed here too.
    a: ['href', 'title', 'rel', 'target'],
    img: ['src', 'alt', 'title'],
    code: ['class', 'data-language'],
    pre: ['class'],
    span: ['class'],
    h1: ['id'], h2: ['id'], h3: ['id'], h4: ['id'], h5: ['id'], h6: ['id'],
    th: ['align'], td: ['align'],
    details: ['class'], div: ['class'],
  },
  // Only the classes the hint renderer emits; nothing else can style its way in.
  allowedClasses: { details: ['hint', 'solution'], div: ['reveal'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  // Anything not listed disappears with its content, so a <script> body cannot leak.
  nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript'],
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs['href'] ?? '';
      const external = /^https?:\/\//i.test(href);
      return {
        tagName,
        attribs: external
          ? { ...attribs, rel: 'noopener noreferrer', target: '_blank' }
          : attribs,
      };
    },
  },
};

/**
 * Renders a chapter body to sanitized HTML and returns its heading outline.
 * Deterministic: the same Markdown always produces the same HTML, which is what
 * makes the version-keyed cache correct.
 */
export function renderMarkdown(body: string): RenderedMarkdown {
  const tokens = markdown.parse(body, {});
  const outline: OutlineEntry[] = [];
  const usedIds = new Map<string, number>();

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token?.type !== 'heading_open') continue;

    const inline = tokens[index + 1];
    const text = (inline?.content ?? '').trim();
    if (!text) continue;

    const base = slugifyHeading(text) || 'section';
    const seen = usedIds.get(base) ?? 0;
    usedIds.set(base, seen + 1);
    const id = seen === 0 ? base : `${base}-${seen + 1}`;

    token.attrSet('id', id);
    outline.push({ depth: Number(token.tag.slice(1)), id, text });
  }

  const raw = markdown.renderer.render(tokens, markdown.options, {});
  return { html: sanitizeHtml(raw, SANITIZE_OPTIONS), outline };
}
