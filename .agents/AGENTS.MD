## Overview

This is an educational resource for hang glider and paraglider pilots studying for the HAGAR exam in Canada.

## Development

- Always assume there is a dev server running at http://localhost:4321

## Style

- Never use barrel imports.
- Always use the '@' alias for imports from the src directory.

## Content

Make use of Astro Starlight's built-in markdown components like Asides (https://starlight.astro.build/guides/authoring-content/#asides) and Footnotes..

### Aside

Aside blocks are indicated using a pair of triple colons ::: to wrap your content, and can be of type note, tip, caution or danger. Generally we mostly use:

- :::note for important tangential info.
- :::tip[Did you know?] for info that is not directly examinable.

#### Example:

```markdown
:::note
Content
:::
```
