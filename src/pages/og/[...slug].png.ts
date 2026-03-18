import { readFile } from 'node:fs/promises'

import { Resvg } from '@resvg/resvg-js'
import { getCollection } from 'astro:content'
import satori from 'satori'

export const prerender = true

export async function getStaticPaths() {
  const docs = await getCollection('docs')

  return docs.map((doc) => {
    // 1. Astro 5 uses doc.id (file path), older uses doc.slug
    let slug = doc.slug || doc.id

    // 2. Strip file extensions if using doc.id (e.g. '.md', '.mdx')
    slug = slug.replace(/\.(md|mdx)$/, '')

    // 3. Remove any leading or trailing slashes
    slug = slug.replace(/^\/|\/$/g, '')

    // 4. Starlight root index is often empty string or 'index'
    if (!slug) slug = 'index'

    // 5. Remove trailing '/index' for nested folder indices
    // (e.g., 'curriculum/index' -> 'curriculum')
    if (slug !== 'index' && slug.endsWith('/index')) {
      slug = slug.replace(/\/index$/, '')
    }

    return {
      params: { slug },
      props: {
        title: doc.data.title,
        description: doc.data.description,
      },
    }
  })
}

export async function GET({ props }: { props: { title?: string; description?: string } }) {
  const titleText = props.title === 'HAGAR Pro' ? props.description : props.title

  // Fetch font and logo
  const fontRes = await fetch(
    'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-400-normal.woff',
  )
  const fontData = await fontRes.arrayBuffer()

  const logoBase64 = await readFile('public/images/logo.png', 'base64')
  const logoDataUrl = `data:image/png;base64,${logoBase64}`

  // 1. Add "as any" to bypass strict ReactNode typings
  const ast = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'row',
        width: 1200,
        height: 630,
        background: '#000',
        color: 'white',
        fontFamily: 'Inter',
      },
      children: [
        // Left Image Container
        {
          type: 'div',
          props: {
            style: { display: 'flex', width: 600, height: 630 },
            children: {
              type: 'img',
              props: { src: logoDataUrl, style: { width: 600, height: 630, objectFit: 'cover' } },
            },
          },
        },
        // Right Text Container
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              width: 600,
              height: 630,
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              padding: 50,
            },
            children: {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontSize: 42,
                  fontWeight: 400,
                  opacity: 0.9,
                  lineHeight: 1.3,
                },
                children: titleText,
              },
            },
          },
        },
      ],
    },
  } as any

  // Build the SVG
  const svg = await satori(ast, {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Inter', data: fontData, weight: 400, style: 'normal' }],
  })

  // Convert SVG to PNG
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  const pngBuffer = resvg.render().asPng()

  // 2. Convert Node Buffer to standard Web Uint8Array
  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
