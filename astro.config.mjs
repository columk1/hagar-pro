// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import rehypeFigureTitle from 'rehype-figure-title'

// https://astro.build/config
export default defineConfig({
  markdown: {
    rehypePlugins: [rehypeFigureTitle],
  },
  integrations: [
    starlight({
      title: 'HAGAR Prep',
      description: 'HPAC/ACVL-aligned study curriculum for the Transport Canada HAGAR exam.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/columk1/hagar-prep' }],
      customCss: ['./src/styles/custom.css'],
      components: {
        Head: './src/components/starlight/Head.astro',
        PageFrame: './src/components/starlight/PageFrame.astro',
        PageTitle: './src/components/starlight/PageTitle.astro',
        Footer: './src/components/starlight/Footer.astro',
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
                  label: '3.4 Map Work & Locating Features',
                  slug: 'curriculum/3-canadian-airspace/3-4-map-work-locating-features',
                },
                {
                  label: '3.5 Magnetic Variation and Navigation',
                  slug: 'curriculum/3-canadian-airspace/3-5-magnetic-variation-navigation',
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
        { label: 'Continue on Another Device', slug: 'continue-on-another-device' },
      ],
    }),
    mdx(),
    react(),
  ],
})
