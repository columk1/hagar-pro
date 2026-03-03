// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@astrojs/mdx'
import rehypeFigureTitle from 'rehype-figure-title'

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeFigureTitle],
  },
  integrations: [
    starlight({
      title: 'HAGAR Prep',
      description: 'HPAC/ACVL-aligned study curriculum for the Transport Canada HAGAR exam.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
      customCss: ['./src/styles/tailwind.css'],
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
            { label: 'Overview', slug: 'curriculum' },
            {
              label: 'Chapter 1: Air Regulations',
              autogenerate: { directory: 'curriculum/module-1-air-regulations' },
              collapsed: true,
            },
            {
              label: 'Chapter 2: VNC Charts',
              autogenerate: { directory: 'curriculum/module-2-vnc-charts' },
              collapsed: true,
            },
            {
              label: 'Chapter 3: Canadian Airspace & Airspace Regulations',
              collapsed: true,
              items: [
                { label: 'Overview', slug: 'curriculum/module-3-canadian-airspace' },
                {
                  label: 'Lesson 3.1: Canadian Domestic Airspace & Uncontrolled Airspace',
                  slug: 'curriculum/module-3-canadian-airspace/lesson-3-1-domestic-airspace',
                },
                {
                  label: 'Lesson 3.2: Controlled Airspace (Classes A through E)',
                  slug: 'curriculum/module-3-canadian-airspace/lesson-3-2-airspace-classes-flight-rules',
                },
                {
                  label: 'Lesson 3.3: Special Use Airspace (Class F)',
                  slug: 'curriculum/module-3-canadian-airspace/lesson-3-3-special-use-airspace-class-f',
                },
                {
                  label: 'Lesson 3.4: Map Work & Locating Features',
                  slug: 'curriculum/module-3-canadian-airspace/lesson-3-4-map-work-locating-features',
                },
                {
                  label: 'Lesson 3.5: Magnetic Variation and Navigation',
                  slug: 'curriculum/module-3-canadian-airspace/lesson-3-5-magnetic-variation-navigation',
                },
                {
                  label: 'Quiz: Canadian Airspace',
                  slug: 'curriculum/module-3-canadian-airspace/quiz-canadian-airspace',
                },
              ],
            },
            {
              label: 'Chapter 4: Flight Operations',
              autogenerate: { directory: 'curriculum/module-4-flight-operations' },
              collapsed: true,
            },
            {
              label: 'Chapter 5: Human Factors',
              autogenerate: { directory: 'curriculum/module-5-human-factors' },
              collapsed: true,
            },
            {
              label: 'Chapter 6: Human Factors',
              autogenerate: { directory: 'curriculum/module-6-human-factors' },
              collapsed: true,
            },
            {
              label: 'Final Chapter: Examination',
              autogenerate: { directory: 'curriculum/final-module-examination' },
              collapsed: true,
            },
            { label: 'Progress Sync', slug: 'progress-sync' },
          ],
        },
      ],
    }),
    mdx(),
    react(),
  ],
})
