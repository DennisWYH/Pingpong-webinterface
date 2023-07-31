export function getShareIDFromAPIURL(url: string): string {
  const parts = url.split('/')

  let found = false
  for (const part of parts) {
    if (found) {
      return part
    }
    found = part === 'share'
  }

  return ''
}
