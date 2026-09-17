// frontend/src/app/ads.txt/route.ts
//
// Arquivo exigido pelo Google AdSense para autorizar este domínio a exibir
// os anúncios da conta ca-pub-3330048375656420 (evita "inventário não
// autorizado" no painel do AdSense). f08c47fec0942fa0 é o ID de sistema
// público e fixo do próprio Google, usado em todos os sites que usam AdSense.
export async function GET() {
  const body = 'google.com, pub-3330048375656420, DIRECT, f08c47fec0942fa0\n'
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
