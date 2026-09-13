// front/src/app/categoria/[slug]/page.tsx
import PostCard from '@/components/PostCard'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 60
export const dynamicParams = true

type Post = {
  id: number | string
  title: string
  slug: string
  excerpt?: string
  cover_url?: string
  category_name?: string
}

async function fetchCategoryPosts(slug: string): Promise<Post[]> {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'

  // 1) tente pela query comum
  let res = await fetch(`${base}/api/posts?category=${encodeURIComponent(slug)}`, {
    next: { revalidate }
  })
  if (res.ok) {
    const data = await res.json()
    // pode vir como array direto, ou { posts: [...] }
    return Array.isArray(data) ? data : (data?.posts ?? [])
  }

  // 2) fallback para endpoint RESTful
  res = await fetch(`${base}/api/categories/${encodeURIComponent(slug)}/posts`, {
    next: { revalidate }
  })
  if (res.ok) {
    const data = await res.json()
    return Array.isArray(data) ? data : (data?.posts ?? [])
  }

  return []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const posts = await fetchCategoryPosts(slug)
  const name = posts[0]?.category_name || slug
  const title = `Notícias de ${name}`
  const description = `Acompanhe as últimas notícias de ${name} no GoolbeNews.`
  return {
    title,
    description,
    alternates: { canonical: `/categoria/${slug}` },
    openGraph: { title, description, type: 'website' },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const posts = await fetchCategoryPosts(slug)

  // Se você prefere 404 quando não há posts:
  // if (!posts.length) notFound()

  // Ou uma mensagem amigável:
  if (!posts.length) {
    return (
      <div className="py-10 text-center text-sm text-gray-600">
        Nenhum post encontrado na categoria <span className="font-semibold">{slug}</span>.
      </div>
    )
  }

  // Tenta exibir o nome da categoria a partir do primeiro post (se vier)
  const heading = posts[0]?.category_name || slug

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold capitalize">{heading}</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  )
}

// (Opcional) Pré-gerar algumas categorias
export async function generateStaticParams() {
  // Se tiver um endpoint de categorias, pode listar slugs aqui:
  // const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'
  // const res = await fetch(`${base}/api/categories`, { cache: 'no-store' })
  // const cats = res.ok ? await res.json() : []
  // return cats.slice(0, 20).map((c: any) => ({ slug: c.slug }))

  return [] // deixe vazio se não tiver endpoint de categorias
}
