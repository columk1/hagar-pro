// Starlight 0.42 no longer ships declarations for these virtual modules.
// Keep component overrides wired through Starlight's virtual imports.
declare module 'virtual:starlight/components/EditLink' {
  const component: typeof import('@astrojs/starlight/components/EditLink.astro').default
  export default component
}

declare module 'virtual:starlight/components/LastUpdated' {
  const component: typeof import('@astrojs/starlight/components/LastUpdated.astro').default
  export default component
}

declare module 'virtual:starlight/components/Pagination' {
  const component: typeof import('@astrojs/starlight/components/Pagination.astro').default
  export default component
}

declare module 'virtual:starlight/components/MobileMenuToggle' {
  const component: typeof import('@astrojs/starlight/components/MobileMenuToggle.astro').default
  export default component
}

declare module 'virtual:starlight/user-config' {
  const config: import('@astrojs/starlight/types').StarlightConfig
  export default config
}
