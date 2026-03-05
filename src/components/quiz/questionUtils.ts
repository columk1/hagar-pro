export const parseAlphaListPrompt = (prompt: string) => {
  const splitTrailingPromptFromLastItem = (text: string): { item: string; outro: string } => {
    const trailingPromptMatcher =
      /^(.*?)(?:\s+)((?:Which|What|When|Where|Who|How|Select|Choose|Identify|From\s+the\s+following)\b[\s\S]*)$/i
    const match = text.match(trailingPromptMatcher)

    if (!match) {
      return { item: text.trim(), outro: '' }
    }

    const item = (match[1] ?? '').trim()
    const outro = (match[2] ?? '').trim()
    if (!item || !outro) {
      return { item: text.trim(), outro: '' }
    }

    return { item, outro }
  }

  const normalizedPrompt = prompt.replace(/\s([A-Z]\.\s+)/g, '\n$1')
  const lines = normalizedPrompt.split('\n')
  const isAlphaItem = (line: string) => /^[A-Z]\.[ \t]+/.test(line.trim())

  let listStart = -1
  let listEnd = -1
  for (let index = 0; index < lines.length; index += 1) {
    if (isAlphaItem(lines[index] ?? '')) {
      listStart = index
      break
    }
  }

  if (listStart === -1) {
    return {
      intro: prompt.trim(),
      items: [] as string[],
      outro: '',
    }
  }

  listEnd = listStart
  for (let index = listStart; index < lines.length; index += 1) {
    if (isAlphaItem(lines[index] ?? '')) {
      listEnd = index + 1
      continue
    }
    if ((lines[index] ?? '').trim().length === 0) {
      continue
    }
    break
  }

  const intro = lines.slice(0, listStart).join('\n').trim()
  const items = lines
    .slice(listStart, listEnd)
    .map((line) =>
      line
        .trim()
        .replace(/^[A-Z]\.[ \t]+/, '')
        .trim(),
    )
    .filter(Boolean)
  let outro = lines.slice(listEnd).join('\n').trim()

  if (!outro && items.length > 0) {
    const lastItemIndex = items.length - 1
    const split = splitTrailingPromptFromLastItem(items[lastItemIndex] ?? '')
    if (split.outro) {
      items[lastItemIndex] = split.item
      outro = split.outro
    }
  }

  return { intro, items, outro }
}
