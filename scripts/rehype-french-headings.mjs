/**
 * Starlight 0.42 resolves Markdown language helpers before inferring Astro's native
 * i18n configuration. Correct the heading-link labels after its Markdown plugin.
 * Remove this workaround when Starlight uses the inferred locales at that stage.
 */
export default function frenchHeadingLabels() {
  return (tree, file) => {
    if (!file.path?.replaceAll('\\', '/').includes('/content/docs/fr/')) return
    const text = (node) =>
      node.type === 'text' ? node.value : (node.children ?? []).map(text).join('')
    const visit = (node) => {
      if (node.type === 'element' && node.properties?.className?.includes('sl-heading-wrapper')) {
        const heading = node.children.find((child) => /^h[1-6]$/.test(child.tagName))
        const anchor = node.children.find((child) => child.tagName === 'a')
        const label = anchor?.children.find((child) =>
          child.properties?.className?.includes('sr-only'),
        )
        if (heading && label)
          label.children = [{ type: 'text', value: `Section intitulée « ${text(heading)} »` }]
      }
      for (const child of node.children ?? []) visit(child)
    }
    visit(tree)
  }
}
