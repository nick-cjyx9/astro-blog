export interface ApiSuccess<T> {
  ok: true
  data: T
  status: number
}
export interface ApiFailure {
  ok: false
  error: string
  status: number
}
export type ApiResult<T> = ApiSuccess<T> | ApiFailure

async function fetchJson<T>(url: string, timeoutMs = 6000): Promise<ApiResult<T>> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    const status = res.status
    if (!res.ok) return { ok: false, error: 'error', status }
    const data = (await res.json()) as T
    return { ok: true, data, status }
  } catch (e) {
    const isAbort = e instanceof DOMException && e.name === 'AbortError'
    return { ok: false, error: isAbort ? 'timeout' : 'network', status: 0 }
  } finally {
    clearTimeout(timer)
  }
}

export interface HitokotoResp {
  id?: number
  uuid?: string
  hitokoto: string
  from?: string
  from_who?: string
  creator?: string
  created_at?: string
  length?: number
  [k: string]: unknown
}

export async function getHitokoto(category: string = 'a'): Promise<ApiResult<HitokotoResp>> {
  const url = `https://v1.hitokoto.cn/?c=${encodeURIComponent(category)}`
  const raw = await fetchJson<HitokotoResp>(url)
  return raw
}
