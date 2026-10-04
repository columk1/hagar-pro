// @ts-check
import { isUnifiedProcessor, unified } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeFigureTitle from 'rehype-figure-title'

import frenchHeadingLabels from './scripts/rehype-french-headings.mjs'

// https://astro.build/config
export default defineConfig({
  site: 'https://hagarpro.ca',
  compressHTML: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', { path: 'fr', codes: ['fr-CA', 'fr'] }],
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeFigureTitle, [rehypeExternalLinks, { target: '_blank', rel: [] }]],
    }),
  },
  integrations: [
    starlight({
      title: 'HAGAR Pro',
      description: 'Structured preparation for the Transport Canada HAGAR exam.',
      logo: {
        light: './src/assets/logo-header-light.svg',
        dark: './src/assets/logo-header-dark.svg',
        replacesTitle: true,
      },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/columk1/hagar-pro' }],
      customCss: ['./src/styles/custom.css'],
      components: {
        Head: './src/components/starlight/Head.astro',
        PageFrame: './src/components/starlight/PageFrame.astro',
        PageTitle: './src/components/starlight/PageTitle.astro',
        Footer: './src/components/starlight/Footer.astro',
        SocialIcons: './src/components/starlight/SocialIcons.astro',
      },
      sidebar: [
        {
          label: 'Curriculum',
          translations: { 'fr-CA': 'Programme' },
          items: [
            {
              label: '1. Introduction',
              translations: { 'fr-CA': '1. Introduction' },
              items: [{ autogenerate: { directory: 'curriculum/1-introduction' } }],
              collapsed: true,
            },
            {
              label: '2. Air Regulations',
              translations: { 'fr-CA': '2. Réglementation aérienne' },
              items: [{ autogenerate: { directory: 'curriculum/2-air-regulations' } }],
              collapsed: true,
            },
            {
              label: '3. VNC Charts',
              translations: { 'fr-CA': '3. Cartes VNC' },
              items: [{ autogenerate: { directory: 'curriculum/3-vnc-charts' } }],
              collapsed: true,
            },
            {
              label: '4. Canadian Airspace & Airspace Regulations',
              translations: { 'fr-CA': '4. Espace aérien canadien et réglementation' },
              collapsed: true,
              items: [
                { slug: 'curriculum/4-canadian-airspace/4-1-domestic-airspace' },
                { slug: 'curriculum/4-canadian-airspace/4-2-airspace-classes-flight-rules' },
                { slug: 'curriculum/4-canadian-airspace/4-3-special-use-airspace-class-f' },
                { slug: 'curriculum/4-canadian-airspace/quiz-canadian-airspace' },
              ],
            },
            {
              label: '5. Flight Operations',
              translations: { 'fr-CA': '5. Exploitation aérienne' },
              items: [{ autogenerate: { directory: 'curriculum/5-flight-operations' } }],
              collapsed: true,
            },
            {
              label: '6. Human Factors',
              translations: { 'fr-CA': '6. Facteurs humains' },
              items: [{ autogenerate: { directory: 'curriculum/6-human-factors' } }],
              collapsed: true,
            },
            {
              label: '7. Practice Exam',
              translations: { 'fr-CA': '7. Examen pratique' },
              items: [{ autogenerate: { directory: 'curriculum/7-practice-exam' } }],
              collapsed: true,
            },
          ],
        },
        { slug: 'resources' },
        { slug: 'continue-on-another-device' },
      ],
    }),
    {
      name: 'french-heading-labels',
      hooks: {
        'astro:config:setup': ({ config }) => {
          // Run after Starlight adds its heading-link plugin.
          if (isUnifiedProcessor(config.markdown.processor)) {
            config.markdown.processor.options.rehypePlugins.push(frenchHeadingLabels)
          }
        },
      },
    },
    mdx(),
    react(),
  ],
})
