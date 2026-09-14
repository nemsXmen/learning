import { renderMarkdown, slugifyHeading } from './markdown';

describe('slugifyHeading', () => {
  it('strips accents and punctuation', () => {
    expect(slugifyHeading('Comment ça fonctionne')).toBe('comment-ca-fonctionne');
    expect(slugifyHeading("Questions d'entretien")).toBe('questions-d-entretien');
    expect(slugifyHeading('À retenir')).toBe('a-retenir');
  });

  it('never leaves leading or trailing separators', () => {
    expect(slugifyHeading('  — Concept —  ')).toBe('concept');
  });
});

describe('renderMarkdown', () => {
  it('gives every heading a stable id and reports the outline', () => {
    const { html, outline } = renderMarkdown('## Concept\n\ntexte\n\n### Détail\n');
    expect(outline).toEqual([
      { depth: 2, id: 'concept', text: 'Concept' },
      { depth: 3, id: 'detail', text: 'Détail' },
    ]);
    expect(html).toContain('<h2 id="concept">');
    expect(html).toContain('<h3 id="detail">');
  });

  it('disambiguates repeated headings instead of colliding', () => {
    const { outline } = renderMarkdown('## Exemple\n\na\n\n## Exemple\n');
    expect(outline.map((entry) => entry.id)).toEqual(['exemple', 'exemple-2']);
  });

  it('labels code blocks with their language and highlights them', () => {
    const { html } = renderMarkdown('```js\nconst a = 1;\n```\n');
    expect(html).toContain('data-language="js"');
    expect(html).toContain('class="hljs');
    expect(html).toContain('hljs-keyword');
  });

  it('renders an unknown language as escaped plain text', () => {
    const { html } = renderMarkdown('```brainfuck\n+[<>]\n```\n');
    expect(html).toContain('data-language="brainfuck"');
    expect(html).not.toContain('hljs-keyword');
  });

  it('is deterministic for the same input', () => {
    const source = '## Concept\n\n```ts\ntype A = 1;\n```\n';
    expect(renderMarkdown(source).html).toBe(renderMarkdown(source).html);
  });

  it('renders tables and lists', () => {
    const { html } = renderMarkdown('- un\n- deux\n');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>un</li>');
  });
});

describe('hints and solutions', () => {
  const exercise = [
    '1. Écris `once(fn)`.',
    '',
    '   :::indice',
    '   Garde un drapeau dans la portée de `once`.',
    '   :::',
    '',
    '   :::indice',
    '   Renvoie une fonction qui le lit.',
    '   :::',
    '',
    '   :::solution',
    '   ```js',
    '   const appelee = false;',
    '   ```',
    '   :::',
  ].join('\n');

  it('renders a hint as a closed disclosure the learner opens', () => {
    const { html } = renderMarkdown(exercise);
    expect(html).toContain('<details class="hint"><summary>Voir un indice</summary><div class="reveal">');
    expect(html).toContain('<code>once</code>.</p>');
    expect(html).not.toMatch(/<details[^>]*\sopen/);
  });

  it('labels a hint that follows another as more help', () => {
    const { html } = renderMarkdown(exercise);
    expect(html.indexOf('Voir un indice')).toBeLessThan(html.indexOf('Un autre indice'));
  });

  it('offers the solution as "je ne sais pas" and still highlights its code', () => {
    const { html } = renderMarkdown(exercise);
    expect(html).toContain('<details class="solution"><summary>Je ne sais pas — voir la solution</summary>');
    expect(html).toContain('<pre class="hljs language-js">');
  });

  it('offers an answer, not a solution, to an interview question', () => {
    const { html } = renderMarkdown('- Pourquoi ?\n\n  :::reponse\n  Parce que.\n  :::');
    expect(html).toContain('<summary>Je ne sais pas — voir une réponse</summary>');
  });

  it('leaves an unknown block name as plain text', () => {
    const { html } = renderMarkdown(':::astuce\nTexte.\n:::');
    expect(html).not.toContain('<details');
    expect(html).toContain(':::astuce');
  });

  it('does not let a raw <details open> in the source become live markup', () => {
    const { html } = renderMarkdown('<details open><summary>x</summary></details>');
    expect(html).not.toMatch(/<details/);
  });
});

describe('sanitisation', () => {
  const hostile = [
    '<script>alert(1)</script>',
    '<img src="x" onerror="alert(1)">',
    '[clic](javascript:alert(1))',
    '<div style="position:fixed">recouvrement</div>',
    '<iframe src="https://evil.example"></iframe>',
  ].join('\n\n');

  // Hostile markup is escaped to inert text, so substrings like "alert(1)" appear
  // legitimately in the output. What must never appear is executable MARKUP.
  it('produces no executable markup from a hostile source', () => {
    const { html } = renderMarkdown(hostile);
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/<iframe/i);
    expect(html).not.toMatch(/<[a-z]+[^>]*\son[a-z]+=/i); // no event handler attribute
    expect(html).not.toMatch(/<[a-z]+[^>]*\sstyle=/i); // no style attribute
    expect(html).not.toMatch(/(href|src)="\s*javascript:/i);
  });

  it('refuses to build an anchor from a javascript: URL', () => {
    const { html } = renderMarkdown('[clic](javascript:alert(1))');
    expect(html).not.toMatch(/<a\b/);
  });

  it('keeps safe links and marks external ones', () => {
    const { html } = renderMarkdown('[MDN](https://developer.mozilla.org)');
    expect(html).toContain('href="https://developer.mozilla.org"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('leaves relative links untouched', () => {
    const { html } = renderMarkdown('[schéma](./schema.svg)');
    expect(html).toContain('href="./schema.svg"');
    expect(html).not.toContain('target="_blank"');
  });

  it('does not execute HTML written inside the Markdown source', () => {
    const { html } = renderMarkdown('Texte <b>gras</b> et <script>x</script>.');
    expect(html).not.toContain('<script');
    expect(html).toContain('&lt;b&gt;');
  });
});
