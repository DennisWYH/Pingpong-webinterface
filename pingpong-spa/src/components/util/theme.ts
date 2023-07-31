import { useColorMode } from '@vueuse/core'

export const colorMode = useColorMode({
  emitAuto: true,
  attribute: 'theme',
  onChanged: onColorModeChange
})

export function onColorModeChange(theme: string) {
  if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme = 'dark'
  }
  document.documentElement.setAttribute('data-bs-theme', theme)
}
