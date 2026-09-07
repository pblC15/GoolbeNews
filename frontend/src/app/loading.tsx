// frontend/src/app/loading.tsx
export default function LoadingHome() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* === Seção: Destaques Recentes (skeleton) === */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-4 w-20 rounded bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Esquerda — destaque grandão */}
          <article className="overflow-hidden rounded-xl border bg-white">
            <div className="h-80 w-full bg-gray-200" />
            <div className="p-5 space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-7 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          </article>

          {/* Direita — 3 menores empilhados */}
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <article key={i} className="overflow-hidden rounded-xl border bg-white">
                <div className="h-28 w-full bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                  <div className="h-5 w-2/3 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* === Seção: Recentes por Categoria (skeleton) === */}
      <section className="space-y-6">
        <div className="h-6 w-56 bg-gray-200 rounded" />

        <div className="space-y-10">
          {[0, 1, 2].map((cat) => (
            <div key={cat} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div className="h-5 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <article key={i} className="overflow-hidden rounded-xl border bg-white">
                    <div className="h-48 w-full bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                      <div className="h-5 w-3/4 bg-gray-200 rounded" />
                      <div className="h-4 w-full bg-gray-200 rounded" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === Footer (skeleton) === */}
      <footer className="mt-12 border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mx-auto mb-2 h-4 w-64 rounded bg-gray-200" />
          <div className="mx-auto h-3 w-72 rounded bg-gray-200" />
        </div>
      </footer>
    </div>
  )
}
