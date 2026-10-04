import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import vm from 'node:vm'

import ts from 'typescript'

const root = resolve(import.meta.dirname, '..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')
const require = createRequire(import.meta.url)
const modules = new Map()
// Compile only the project's own TypeScript, with real dependencies and isolated state.
const load = (path) => {
  const absolute = resolve(root, path)
  if (modules.has(absolute)) return modules.get(absolute).exports
  const module = { exports: {} }
  modules.set(absolute, module)
  const code = ts.transpileModule(readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const localRequire = (name) =>
    name.startsWith('.') ? load(`${resolve(dirname(absolute), name)}.ts`) : require(name)
  vm.runInThisContext(`(function(module, exports, require) {${code}\n})`)(
    module,
    module.exports,
    localRequire,
  )
  return module.exports
}
const { canonicalizePathToContentId, isLessonId } = load('src/lib/progress/lessonIds.ts')
const { localeFromLang, localizePath, ui } = load('src/lib/i18n/ui.ts')
const {
  sanitizeProgressState,
  markLessonComplete,
  markLessonIncomplete,
  isLessonCompleted,
  $progress,
} = load('src/lib/stores/progressStore.ts')
const { serializeProgress, deserializeProgress, createSyncLink } = load('src/lib/progress/sync.ts')
const { generateOGURL } = load('src/lib/og.ts')
const { parseAlphaListPrompt } = load('src/components/quiz/questionUtils.ts')
assert.equal(canonicalizePathToContentId('/fr/curriculum/%invalid/'), '')
assert.equal(localeFromLang('fr-CA'), 'fr')
assert.equal(localizePath('fr', '/curriculum/1-introduction/'), '/fr/curriculum/1-introduction/')
assert.equal(localizePath('en', '/fr/curriculum/1-introduction/'), '/curriculum/1-introduction/')
assert.equal(
  canonicalizePathToContentId('/fr/curriculum/2-air-regulations/lesson/?x=1#top'),
  'curriculum/2-air-regulations/lesson',
)
assert.ok(isLessonId('/fr/curriculum/2-air-regulations/lesson/'))
assert.ok(!isLessonId('/fr/curriculum/2-air-regulations/quiz-air-regulations/'))
assert.deepEqual(
  sanitizeProgressState({ completedLessons: ['/fr/curriculum/a/b/', 'curriculum/a/b'] }),
  { completedLessons: ['curriculum/a/b'] },
)
markLessonComplete('/fr/curriculum/a/b/')
assert.ok(isLessonCompleted('curriculum/a/b'))
markLessonIncomplete('curriculum/a/b')
assert.equal($progress.get().completedLessons.length, 0)
const progress = { completedLessons: ['curriculum/a/b'] }
assert.deepEqual(await deserializeProgress(await serializeProgress(progress)), progress)
assert.match(
  await createSyncLink('https://hagarpro.ca', progress, 'fr'),
  /^https:\/\/hagarpro.ca\/fr\/sync\/\?data=/,
)
assert.match(
  await createSyncLink('https://hagarpro.ca', progress),
  /^https:\/\/hagarpro.ca\/sync\/\?data=/,
)
assert.equal(generateOGURL('/fr/'), '/og/fr/index.png')
assert.equal(generateOGURL('/'), '/og/index.png')
assert.deepEqual(
  parseAlphaListPrompt('Introduction\nA. Premier\nB. Deuxième\nC. Troisième\nQuelle combinaison?')
    .items,
  ['Premier', 'Deuxième', 'Troisième'],
)

const docsDir = 'src/content/docs'
const sources = readdirSync(resolve(root, docsDir), { recursive: true })
  .filter((path) => path.endsWith('.mdx') && !path.startsWith('fr/'))
  .sort()
const translations = readdirSync(resolve(root, `${docsDir}/fr`), { recursive: true })
  .filter((path) => path.endsWith('.mdx'))
  .sort()
assert.deepEqual(
  translations,
  sources,
  'Every source page must have exactly one matching French page',
)
const numbers = (text, french = false) => {
  const grouped = text.replace(/(?<=\d)[ \u00a0\u202f](?=\d{3}(?:\D|$))/g, '')
  const normalized = (
    french ? grouped : grouped.replace(/(?<=\d),\s*(?=\d{3}(?:\D|$))/g, '')
  ).replace(/(?<=\d),(?=\d)/g, '.')
  return (normalized.match(/\d+(?:\.\d+)?/g) ?? []).map(Number)
}
const quizQuestions = (text) => {
  const expression = text.match(/questions=\{\s*(\[[\s\S]*\])\s*\}/)?.[1]
  assert.ok(expression, 'Quiz questions must be an inline array')
  return vm.runInNewContext(ts.transpile(`const questions = ${expression}; questions;`))
}
let quizCount = 0
for (const file of sources) {
  const english = read(`${docsDir}/${file}`)
  const french = read(`${docsDir}/fr/${file}`)
  assert.match(french, /description:/, `French metadata missing: ${file}`)
  assert.notEqual(french, english, `Page was copied without translation: ${file}`)
  if (!file.includes('quiz-')) continue
  const en = quizQuestions(english)
  const fr = quizQuestions(french)
  assert.equal(en.length, fr.length, file)
  for (let index = 0; index < en.length; index++) {
    const a = en[index],
      b = fr[index]
    assert.equal(b.id, a.id, file)
    assert.equal(b.correctAnswer, a.correctAnswer, a.id)
    assert.equal(b.multiline, a.multiline, a.id)
    assert.deepEqual(
      Array.from(b.choices, (c) => c.value),
      Array.from(a.choices, (c) => c.value),
      a.id,
    )
    assert.notEqual(b.prompt, a.prompt, `Untranslated quiz prompt: ${a.id}`)
    assert.deepEqual(
      numbers(b.prompt, true),
      numbers(a.prompt),
      `Quiz prompt numbers changed: ${a.id}`,
    )
    for (let choice = 0; choice < a.choices.length; choice++)
      assert.deepEqual(
        numbers(b.choices[choice].label, true),
        numbers(a.choices[choice].label),
        `Quiz choice numbers changed: ${a.id}`,
      )
    if (a.explanation)
      assert.ok(
        b.explanation && b.explanation !== a.explanation,
        `Untranslated explanation: ${a.id}`,
      )
    quizCount++
  }
}
const enBank = JSON.parse(read('src/lib/data/annex-a-question-bank.json'))
const frBank = JSON.parse(read('src/lib/data/annex-a-question-bank.fr.json'))
assert.equal(frBank.version, enBank.version)
assert.equal(frBank.questionCount, enBank.questionCount)
assert.equal(frBank.questions.length, enBank.questions.length)
for (let index = 0; index < enBank.questions.length; index++) {
  const en = enBank.questions[index],
    fr = frBank.questions[index]
  assert.equal(fr.id, en.id)
  assert.equal(fr.answer, en.answer, en.id)
  assert.equal(fr.mapRegion, en.mapRegion, en.id)
  assert.deepEqual(Object.keys(fr.choices), Object.keys(en.choices), en.id)
  assert.notEqual(fr.question, en.question, `Untranslated exam prompt: ${en.id}`)
  assert.deepEqual(
    numbers(fr.question, true),
    numbers(en.question),
    `Exam prompt numbers changed: ${en.id}`,
  )
  for (const key of Object.keys(en.choices))
    assert.deepEqual(
      numbers(fr.choices[key], true),
      numbers(en.choices[key]),
      `Exam choice numbers changed: ${en.id} ${key}`,
    )
}
// Validate every literal passed to t(), including controls rendered only after interaction.
for (const file of readdirSync(resolve(root, 'src'), { recursive: true }).filter((path) =>
  /\.(ts|tsx)$/.test(path),
)) {
  const ast = ts.createSourceFile(
    file,
    read(`src/${file}`),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(ast) === 't' &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    )
      ui('fr')(node.arguments[0].text)
    ts.forEachChild(node, visit)
  }
  visit(ast)
}
const airspaceSource = ts.createSourceFile(
  'airspace.tsx',
  read('src/components/tools/AirspaceDiagram.tsx'),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
)
for (const statement of airspaceSource.statements) {
  if (!ts.isVariableStatement(statement)) continue
  for (const declaration of statement.declarationList.declarations) {
    if (declaration.name.getText(airspaceSource) !== 'AIRSPACE_INFO') continue
    const info = vm.runInNewContext(`(${declaration.initializer.getText(airspaceSource)})`)
    for (const item of Object.values(info))
      for (const text of [item.title, ...item.vfr, ...item.hgpg]) ui('fr')(text)
  }
}
console.log(
  `Source parity passed: ${sources.length} pages, ${quizCount} quiz questions, ${frBank.questions.length} exam questions; locale, progress, sync, UI and answer keys verified.`,
)

if (process.argv.includes('--built')) {
  assert.ok(existsSync(resolve(root, 'dist/fr/index.html')), 'Run pnpm build first')
  const decode = (value) =>
    value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'")
  const pageFor = (pathname) => {
    const file = resolve(root, 'dist', `.${decodeURIComponent(pathname)}`)
    if (existsSync(file) && !pathname.endsWith('/')) {
      try {
        return readFileSync(file, 'utf8')
      } catch {
        /* directory */
      }
    }
    const html = resolve(file, 'index.html')
    assert.ok(existsSync(html), `Missing built route: ${pathname}`)
    return readFileSync(html, 'utf8')
  }
  for (const file of sources) {
    const slug = file.replace(/\.mdx$/, '').replace(/(?:^|\/)index$/, '')
    const path = `/fr/${slug}${slug && !slug.endsWith('/') ? '/' : ''}`
    const html = pageFor(path)
    assert.match(html, /<html[^>]*lang="fr-CA"/, path)
    assert.ok(!html.includes('This content is not available in your language yet.'), path)
    assert.ok(!html.includes('Ce contenu n’est pas encore disponible dans votre langue.'), path)
    assert.ok(!html.includes('Section titled'), `Heading labels must be French: ${path}`)
    assert.ok(html.includes(`hreflang="fr-CA"`), path)
    assert.ok(html.includes('Rechercher dans ce site'), `French search UI missing: ${path}`)
    const image = html.match(/property="og:image" content="([^"]+)"/)?.[1]
    assert.ok(image, path)
    assert.ok(
      existsSync(resolve(root, 'dist', `.${new URL(image).pathname}`)),
      `Missing social image: ${image}`,
    )
    for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      const url = new URL(decode(match[1]), `https://hagarpro.ca${path}`)
      if (url.origin !== 'https://hagarpro.ca') continue
      if (/\.(png|avif|svg|pdf|jpg)$/.test(url.pathname)) {
        assert.ok(
          existsSync(resolve(root, 'dist', `.${url.pathname}`)),
          `Missing linked asset: ${url}`,
        )
        continue
      }
      assert.ok(
        url.pathname === '/fr' || url.pathname.startsWith('/fr/'),
        `French link escaped its locale: ${path} → ${url}`,
      )
      const target = pageFor(url.pathname)
      if (url.hash)
        assert.ok(
          target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
          `Broken anchor: ${path} → ${url}`,
        )
    }
  }
  for (const route of ['/fr/sync/', '/fr/og/', '/fr/404/'])
    assert.match(pageFor(route), /<html[^>]*lang="fr-CA"/, route)
  console.log(
    'Built French route, link, anchor, language, metadata and social-image checks passed.',
  )
}
