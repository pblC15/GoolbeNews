import type { Metadata } from 'next'
import InstitutionalPage from '@/components/InstitutionalPage'
import ContactForm from '@/components/ContactForm'
import { CONTACT_EMAIL, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contato',
  description: `Fale com a redação do ${SITE_NAME}: sugestões de pauta, correções, parcerias e dúvidas.`,
  alternates: { canonical: '/contato' },
}

export default function ContatoPage() {
  return (
    <InstitutionalPage
      current="/contato"
      title="Contato"
      intro="Tem uma sugestão de pauta, encontrou um erro numa notícia ou quer propor uma parceria? Escreva para a redação."
    >
      <div className="grid gap-10 pt-6 xl:grid-cols-[1fr_240px]">
        <ContactForm />
        <div className="space-y-6 text-sm leading-6 text-slate-600">
          <div>
            <p className="font-bold text-slate-900">Email</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sky-700 underline underline-offset-2">{CONTACT_EMAIL}</a>
          </div>
          <div>
            <p className="font-bold text-slate-900">Correções</p>
            <p>Indique o link da notícia e o trecho que precisa ser revisto. Correções confirmadas são feitas no próprio texto.</p>
          </div>
          <div>
            <p className="font-bold text-slate-900">Prazo de resposta</p>
            <p>Normalmente respondemos em até 3 dias úteis.</p>
          </div>
        </div>
      </div>
    </InstitutionalPage>
  )
}
