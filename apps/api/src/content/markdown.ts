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
  },
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
