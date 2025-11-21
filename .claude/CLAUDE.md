# Code Conventions - JS Interview Prep

## Vue/Nuxt
- Composition API + script setup only (no Options API)
- Auto-imports enabled (composables, components, Vue APIs)
- Use composables for reusable logic
- Use `useState` for shared state

## TypeScript
- Strict mode: type props, emits, returns
- No `any` (justified exceptions only)

## Styling
- **Priority**: Nuxt UI components → TailwindCSS 4 utilities → custom CSS
- Refer to [Nuxt UI docs](https://ui.nuxt.com) before creating components

## i18n
- Default locale: **French**
- EN available via `/en` prefix
- Use `$t()` for translations

## State Management
- **localStorage**: favorites, progress, preferences
- **Nuxt Content**: source of truth for questions
- **Composables**: useFavorites, useQuestionProgress, useQuizMode, useAnswerRevealState

## Critical Constraints
1. **SSR enabled**: use `onMounted` for `window`/`localStorage`
2. **Base URL**: all links aware of `/interview-training/`
3. **i18n**: prioritize French
4. **Nuxt Content**: use `queryContent()` to fetch questions
5. **Performance**: favor static generation (prerendered pages)

## DX
- **Language**: Reply in French
- **Philosophy**: DX First • Content First • Type Safe • Performance

## Resources
[Nuxt 4](https://nuxt.com) • [Content](https://content.nuxt.com) • [UI](https://ui.nuxt.com) • [Tailwind](https://tailwindcss.com)

Full docs: `/CLAUDE.md` • Roadmap: `/documentation/ROADMAP.md`
