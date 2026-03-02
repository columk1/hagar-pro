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
              label: 'Module 1: Air Regulations',
              autogenerate: { directory: 'curriculum/module-1-air-regulations' },
            },
            {
              label: 'Module 2: VNC Charts',
              autogenerate: { directory: 'curriculum/module-2-vnc-charts' },
            },
            {
              label: 'Module 3: Canadian Airspace & Airspace Regulations',
              items: [
                { label: 'Overview', slug: 'curriculum/module-3-canadian-airspace' },
                {
                  label: 'Lesson 3.1: The Structure of Canadian Airspace',
                  slug: 'curriculum/module-3-canadian-airspace/lesson-3-1-domestic-airspace',
                },
                {
                  label: 'Lesson 3.2: Airspace Classes (A to G) & Flight Rules',
                  slug: 'curriculum/module-3-canadian-airspace/lesson-3-2-airspace-classes-flight-rules',
                },
                {
                  label: 'Quiz: Canadian Airspace',
                  slug: 'curriculum/module-3-canadian-airspace/quiz-canadian-airspace',
                },
              ],
            },
            {
              label: 'Module 4: Map Work',
              autogenerate: { directory: 'curriculum/module-4-map-work' },
            },
            {
              label: 'Module 5: Flight Operations',
              autogenerate: { directory: 'curriculum/module-5-flight-operations' },
            },
            {
              label: 'Module 6: Human Factors',
              autogenerate: { directory: 'curriculum/module-6-human-factors' },
            },
            {
              label: 'Final Module: Examination',
              autogenerate: { directory: 'curriculum/final-module-examination' },
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
