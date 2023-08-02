import type { Node } from '@/types'
import { fileNameExtension } from './filepath'

const maxImageSize = 52428800
const maxVideoPixels = 150000000

const maxTextFileSize = 500 * 1024

export const typeBrowser = 'browser'
export const typeAudio = 'audio'
export const typeImage = 'image'
export const typeVideo = 'video'
export const typeText = 'text'

const previewableMimes = new Map([
  ['application/pdf', typeBrowser],

  ['image/svg+xml', typeText],

  ['audio/mpeg', typeAudio],
  ['audio/mp4', typeAudio],
  ['audio/ogg', typeAudio],
  ['audio/x-vorbis+ogg', typeAudio],
  ['audio/webm', typeAudio],
  ['audio/wav', typeAudio],
  ['audio/x-wav', typeAudio],

  ['video/mp4', typeVideo],
  ['video/ogg', typeVideo],
  ['application/ogg', typeVideo],
  ['video/webm', typeVideo]
])

const previewableExtensions = new Map([
  ['mp3', typeAudio],
  ['wav', typeAudio],

  ['ogg', typeAudio],
  ['mp4', typeVideo],
  ['ogv', typeVideo],
  ['webm', typeVideo],

  ['log', typeText],
  ['txt', typeText],
  ['css', typeText],
  ['go', typeText],
  ['html', typeText],
  ['ini', typeText],
  ['java', typeText],
  ['xml', typeText],
  ['csv', typeText],
  ['conf', typeText],
  ['yml', typeText],
  ['md', typeText],
  ['sh', typeText],
  ['php', typeText],
  ['js', typeText],
  ['ts', typeText],
  ['json', typeText],
  ['vue', typeText]
])

export function previewProvider(node: Node): string | boolean {
  if (!node) {
    console.warn('util.previewProvider: Empty node')
    return false
  }

  if (node.dir) {
    return false
  }

  const mime = node.mime.toLowerCase()
  let [, ext] = fileNameExtension(node)
  ext = ext.toLowerCase()

  let provider = previewableMimes.get(mime) || previewableExtensions.get(ext)
  if (!provider && mime.startsWith('image/')) {
    provider = typeImage
  }
  if (!provider) {
    return false
  }

  switch (provider) {
    case typeImage:
      if (node.size > maxImageSize) {
        return false
      }
    /* NOTE: Falls through to next case */
    case typeVideo:
      if (node.metadata?.width == 0 || node.metadata?.height == 0) {
        return false
      }
      if ((node.metadata?.width || 0) * (node.metadata?.height || 0) > maxVideoPixels) {
        return false
      }
      break
    case typeAudio:
    // Audio has no restrictions besides mime
  }

  const mediaType = node.metadata?.type || ''
  if (mediaType && mediaType !== provider) {
    console.warn('previewable: Unexpected provider for mimetype/extension', provider, ext, mime)
    return false
  }

  if (provider == typeText && node.size > maxTextFileSize) {
    return false
  }

  return provider
}
