export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'
export function getToken(){ return typeof window !== 'undefined' ? localStorage.getItem('token') : null }
export async function adminApi(path:string, opts:RequestInit={}){
  const token=getToken()
  const headers:any={...(opts.headers||{}), ...(token?{Authorization:`Bearer ${token}`}:{})}
  if(opts.body && !(opts.body instanceof FormData)) headers['Content-Type']='application/json'
  const res=await fetch(`${API_BASE}/api${path}`,{...opts,headers,cache:'no-store'})
  const data=await res.json().catch(()=>({}))
  if(res.status===401 && typeof window!=='undefined'){ localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href='/admin/login' }
  if(!res.ok) throw new Error(data.error||'Erro na API')
  return data
}
