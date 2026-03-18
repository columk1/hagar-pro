// @ts-check
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeFigureTitle from 'rehype-figure-title'

// https://astro.build/config
export default defineConfig({
  site: 'https://hagarpro.ca',
  markdown: {
    rehypePlugins: [rehypeFigureTitle, [rehypeExternalLinks, { target: '_blank', rel: [] }]],
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
          items: [
            {
              label: '1. Introduction',
              autogenerate: { directory: 'curriculum/1-introduction' },
              collapsed: true,
            },
            {
              label: '2. Air Regulations',
              autogenerate: { directory: 'curriculum/2-air-regulations' },
              collapsed: true,
            },
            {
              label: '3. VNC Charts',
              autogenerate: { directory: 'curriculum/3-vnc-charts' },
              collapsed: true,
            },
            {
              label: '4. Canadian Airspace & Airspace Regulations',
              collapsed: true,
              items: [
                {
                  label: '4.1 Canadian Domestic Airspace & Uncontrolled Airspace',
                  slug: 'curriculum/4-canadian-airspace/4-1-domestic-airspace',
                },
                {
                  label: '4.2 Controlled Airspace (Classes A through E)',
                  slug: 'curriculum/4-canadian-airspace/4-2-airspace-classes-flight-rules',
                },
                {
                  label: '4.3 Special Use Airspace (Class F)',
                  slug: 'curriculum/4-canadian-airspace/4-3-special-use-airspace-class-f',
                },
                {
                  label: 'Quiz: Canadian Airspace',
                  slug: 'curriculum/4-canadian-airspace/quiz-canadian-airspace',
                },
              ],
            },
            {
              label: '5. Flight Operations',
              autogenerate: { directory: 'curriculum/5-flight-operations' },
              collapsed: true,
            },
            {
              label: '6. Human Factors',
              autogenerate: { directory: 'curriculum/6-human-factors' },
              collapsed: true,
            },
            {
              label: '7. Practice Exam',
              autogenerate: { directory: 'curriculum/7-practice-exam' },
              collapsed: true,
            },
          ],
        },
        { label: 'Resources', slug: 'resources' },
        { label: 'Continue on Another Device', slug: 'continue-on-another-device' },
      ],
    }),
    mdx({
      rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: [] }]],
    }),
    react(),
  ],
})
