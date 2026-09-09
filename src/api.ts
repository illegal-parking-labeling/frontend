import type { AiStats, ImageItem, LabelOut, LabelPayload, LeaderboardEntry } from './types'

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${body}`)
  }
  return res.json() as Promise<T>
}

export function uploadImage(file: File): Promise<ImageItem> {
  const formData = new FormData()
  formData.append('file', file)
  return fetch(`${API_BASE}/images`, { method: 'POST', body: formData }).then((r) => handle<ImageItem>(r))
}

export function listImages(status?: string): Promise<ImageItem[]> {
  const query = status ? `?status=${status}` : ''
  return fetch(`${API_BASE}/images${query}`).then((r) => handle<ImageItem[]>(r))
}

export function getImage(id: number | string): Promise<ImageItem> {
  return fetch(`${API_BASE}/images/${id}`).then((r) => handle<ImageItem>(r))
}

export function createLabel(imageId: number | string, payload: LabelPayload): Promise<LabelOut> {
  return fetch(`${API_BASE}/images/${imageId}/labels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => handle<LabelOut>(r))
}

export function updateLabel(
  imageId: number | string,
  labelId: number,
  payload: Partial<LabelPayload>,
): Promise<LabelOut> {
  return fetch(`${API_BASE}/images/${imageId}/labels/${labelId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => handle<LabelOut>(r))
}

export function deleteLabel(imageId: number | string, labelId: number): Promise<void> {
  return fetch(`${API_BASE}/images/${imageId}/labels/${labelId}`, { method: 'DELETE' }).then((r) => {
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
  })
}

export function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return fetch(`${API_BASE}/leaderboard`).then((r) => handle<LeaderboardEntry[]>(r))
}

export function getAiStats(): Promise<AiStats> {
  return fetch(`${API_BASE}/stats/ai`).then((r) => handle<AiStats>(r))
}

export function imageUrl(filename: string): string {
  return `${API_BASE}/uploads/${filename}`
}
