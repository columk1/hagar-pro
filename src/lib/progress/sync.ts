import type { ProgressState } from '../stores/progressStore'
import { sanitizeProgressState } from '../stores/progressStore'
import { compress, decompress } from 'lz-utils'

type SyncPayload = {
  v: 1
  progress: ProgressState
}

const encodeBase64Url = (value: string): string => {
  if (typeof globalThis.btoa !== 'function') {
    throw new Error('Base64 encoding is not available in this environment')
  }

  return globalThis
    .btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

const decodeBase64Url = (value: string): string => {
  if (typeof globalThis.atob !== 'function') {
    throw new Error('Base64 decoding is not available in this environment')
  }

  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const withPadding = `${padded}${'='.repeat((4 - (padded.length % 4)) % 4)}`

  return decodeURIComponent(escape(globalThis.atob(withPadding)))
}

const compressData = async (data: string): Promise<string> => {
  try {
    const compressed = compress(data)
    console.log(`Original size: ${data.length}, LZ compressed size: ${compressed.length}`)
    return compressed
  } catch (error) {
    console.log('LZ compression failed:', error)
    return data
  }
}

const decompressData = async (compressedData: string): Promise<string> => {
  try {
    const decompressed = decompress(compressedData)
    return decompressed
  } catch (error) {
    console.log('LZ decompression failed:', error)
    return compressedData
  }
}

export const serializeProgress = async (progressState: Partial<ProgressState>): Promise<string> => {
  const payload: SyncPayload = {
    v: 1,
    progress: sanitizeProgressState(progressState),
  }

  const jsonString = JSON.stringify(payload)
  const compressed = await compressData(jsonString)
  return encodeBase64Url(compressed)
}

export const deserializeProgress = async (encodedProgress: string): Promise<ProgressState> => {
  const decoded = decodeBase64Url(encodedProgress)
  const decompressed = await decompressData(decoded)
  const parsed = JSON.parse(decompressed) as Partial<SyncPayload>

  if (parsed.v !== 1 || !parsed.progress) {
    throw new Error('Invalid sync payload version')
  }

  return sanitizeProgressState(parsed.progress)
}

export const createSyncLink = async (
  origin: string,
  progressState: Partial<ProgressState>,
): Promise<string> => {
  const url = new URL('/sync', origin)
  url.searchParams.set('data', await serializeProgress(progressState))
  return url.toString()
}
