import type { APIRoute } from 'astro'
import { ImageResponse, GoogleFont, cache } from 'cf-workers-og/html'

// Import the PNG file
import logo from '@/assets/logo.png'

export const prerender = false

export const GET: APIRoute = async ({ request, locals }) => {
  if ((locals as any)?.runtime?.ctx) {
    cache.setExecutionContext((locals as any).runtime.ctx)
  }

  const searchParams = new URL(request.url).searchParams

  const title = searchParams.get('title') || 'HAGAR Pro'
  const description =
    searchParams.get('description') || 'Structured preparation for the Transport Canada HAGAR exam'

  // Use title for main text unless it's the default "HAGAR Pro"
  const mainText = title === 'HAGAR Pro' ? description : title

  // Combine the request origin with the local path Astro generated for the image
  const origin = new URL(request.url).origin
  const logoUrl = new URL(logo.src, origin).toString()

  const html = createOGImage(mainText, logoUrl)

  return ImageResponse.create(html, {
    width: 1200,
    height: 630,
    fonts: [new GoogleFont('Inter', { weight: 400 })],
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

function createOGImage(mainText: string, logoUrl: string): string {
  return `
    <div style="
      display: flex;
      flex-direction: row;
      width: 1200px;
      height: 630px;
      background: #000;
      color: white;
      font-family: 'Inter', sans-serif;
    ">
      <!-- Left Side: Full height logo (Strict 600px width) -->
      <div style="
        display: flex;
        width: 600px;
        height: 630px;
      ">
        <img src="${logoUrl}" width="600" height="630" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>

      <!-- Right Side: Centered Title & Description (Strict 600px width) -->
      <div style="
        display: flex;
        flex-direction: column;
        width: 600px;
        height: 630px;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 50px;
      ">
        <div style="
          font-size: 42px;
          font-weight: 400;
          opacity: 0.9;
          line-height: 1.3;
        ">
          ${mainText}
        </div>
      </div>
    </div>
  `
}
