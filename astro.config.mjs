// @ts-check
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeFigureTitle from 'rehype-figure-title'

// https://astro.build/config
export default defineConfig({
  markdown: {
    rehypePlugins: [rehypeFigureTitle, [rehypeExternalLinks, { target: '_blank', rel: [] }]],
  },
  integrations: [
    starlight({
      title: 'HAGAR Pro',
      description: 'HPAC/ACVL-aligned study curriculum for the Transport Canada HAGAR exam.',
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
            { label: 'Introduction', slug: 'introduction' },
            {
              label: '1. Air Regulations',
              autogenerate: { directory: 'curriculum/1-air-regulations' },
              collapsed: true,
            },
            {
              label: '2. VNC Charts',
              autogenerate: { directory: 'curriculum/2-vnc-charts' },
              collapsed: true,
            },
            {
              label: '3. Canadian Airspace & Airspace Regulations',
              collapsed: true,
              items: [
                {
                  label: '3.1 Canadian Domestic Airspace & Uncontrolled Airspace',
                  slug: 'curriculum/3-canadian-airspace/3-1-domestic-airspace',
                },
                {
                  label: '3.2 Controlled Airspace (Classes A through E)',
                  slug: 'curriculum/3-canadian-airspace/3-2-airspace-classes-flight-rules',
                },
                {
                  label: '3.3 Special Use Airspace (Class F)',
                  slug: 'curriculum/3-canadian-airspace/3-3-special-use-airspace-class-f',
                },
                {
                  label: 'Quiz: Canadian Airspace',
                  slug: 'curriculum/3-canadian-airspace/quiz-canadian-airspace',
                },
              ],
            },
            {
              label: '4. Flight Operations',
              autogenerate: { directory: 'curriculum/4-flight-operations' },
              collapsed: true,
            },
            {
              label: '5. Human Factors',
              autogenerate: { directory: 'curriculum/5-human-factors' },
              collapsed: true,
            },
            {
              label: '6. Practice Exam',
              autogenerate: { directory: 'curriculum/6-practice-exam' },
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
