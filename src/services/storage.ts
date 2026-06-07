import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

// Ported from web/lib/firebase/storage.ts. The web took `File` objects from a
// dropzone; on mobile we take local URIs (from expo-image-picker) and turn them
// into a Blob before upload. Storage paths and the <5MB rule (storage.rules) are
// unchanged — same backend bucket.

function contentTypeFromUri(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase()
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'gif') return 'image/gif'
  return 'image/jpeg'
}

async function uriToBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri)
  return await res.blob()
}

export async function uploadImageFromUri(
  uri: string,
  path: string,
  onProgress?: (p: number) => void,
): Promise<string> {
  const blob = await uriToBlob(uri)
  const storageRef = ref(storage, path)
  const task = uploadBytesResumable(storageRef, blob, { contentType: contentTypeFromUri(uri) })
  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve(url)
      },
    )
  })
}

export async function uploadBusinessImages(
  businessId: string,
  uris: string[],
  type: 'logo' | 'cover' | 'gallery',
  onProgress?: (p: number) => void,
): Promise<string[]> {
  const urls: string[] = []
  for (let i = 0; i < uris.length; i++) {
    const ext = uris[i].split('.').pop() ?? 'jpg'
    const path = `businesses/${businessId}/${type}/${Date.now()}_${i}.${ext}`
    const url = await uploadImageFromUri(uris[i], path, (p) => {
      const overall = Math.round((i / uris.length + p / 100 / uris.length) * 100)
      onProgress?.(overall)
    })
    urls.push(url)
  }
  return urls
}

export async function uploadPostImages(
  postId: string,
  uris: string[],
  onProgress?: (p: number) => void,
): Promise<string[]> {
  const urls: string[] = []
  for (let i = 0; i < uris.length; i++) {
    const ext = uris[i].split('.').pop() ?? 'jpg'
    const path = `posts/${postId}/${Date.now()}_${i}.${ext}`
    const url = await uploadImageFromUri(uris[i], path, (p) => {
      onProgress?.(Math.round((i / uris.length + p / 100 / uris.length) * 100))
    })
    urls.push(url)
  }
  return urls
}

export async function deleteStorageFile(url: string) {
  try {
    const fileRef = ref(storage, url)
    await deleteObject(fileRef)
  } catch {
    // Ignore if it no longer exists.
  }
}
