export async function api(path: string, opts: RequestInit = {}) {
    const base = process.env.NEXT_PUBLIC_API_BASE!
    const res = await fetch(base + '/api' + path, { ...opts, cache: 'no-store' })
    
    if (!res.ok) throw new Error('API error')

    return res.json()
}