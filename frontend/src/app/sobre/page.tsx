import type { Metadata } from 'next'
import Link from 'next/link'
import InstitutionalPage from '@/components/InstitutionalPage'
import { SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Sobre nós',
  description: `Conheça o ${SITE_NAME}: quem somos, como trabalhamos e os princípios editoriais que seguimos.`,
  alternates: { canonical: '/sobre' },
}

// ⚠️ Revise este texto com as informações reais do projeto (fundação, equipe, cidade).
export default function SobrePage() {
  return (
    <InstitutionalPage
      current="/sobre"
      title="Sobre nós"
      intro={`O ${SITE_NAME} é um portal de notícias que organiza os fatos do dia com contexto e sem ruído, para quem quer se informar bem em pouco tempo.`}
    >
      <div className="legal-body">
        <h2>O que fazemos</h2>
        <p>
          Publicamos notícias sobre o Brasil e o mundo, política, economia, tecnologia, esporte e cultura. Cada texto
          procura responder ao que aconteceu, por que importa e o que pode vir a seguir, em linguagem direta.
        </p>

        <h2>Como trabalhamos</h2>
        <ul>
          <li><strong>Apuração antes da pressa.</strong> Preferimos confirmar uma informação a publicá-la primeiro.</li>
          <li><strong>Fontes identificadas.</strong> Sempre que possível indicamos de onde vem cada dado ou declaração.</li>
          <li><strong>Separação entre notícia e opinião.</strong> Textos opinativos são sinalizados como tal.</li>
          <li><strong>Correções à vista.</strong> Quando erramos, corrigimos no próprio texto.</li>
        </ul>

        <h2>Quem escreve</h2>
        <p>
          Cada notícia é assinada pelo autor responsável, com a sua área de cobertura indicada no final do texto. A
          assinatura de uma matéria não muda depois de publicada.
        </p>

        <h2>Independência</h2>
        <p>
          O {SITE_NAME} poderá exibir publicidade para manter o projeto. Anunciantes não interferem no conteúdo
          editorial, e conteúdo patrocinado, quando existir, será identificado de forma clara.
        </p>

        <h2>Fale com a gente</h2>
        <p>
          Sugestões, críticas e pedidos de correção são bem-vindos na página de <Link href="/contato">Contato</Link>.
        </p>
      </div>
    </InstitutionalPage>
  )
}
