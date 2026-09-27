import type { Metadata } from 'next'
import Link from 'next/link'
import InstitutionalPage from '@/components/InstitutionalPage'
import { CONTACT_EMAIL, LEGAL_LAST_UPDATE, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: `Regras de uso do site ${SITE_NAME} e dos seus conteúdos.`,
  alternates: { canonical: '/termos-de-uso' },
}

// ⚠️ Modelo de referência. Revise com um profissional jurídico antes de publicar.
export default function TermosPage() {
  return (
    <InstitutionalPage
      current="/termos-de-uso"
      title="Termos de Uso"
      intro={`Ao acessar o ${SITE_NAME}, você concorda com as condições abaixo. Se não concordar, pedimos que não utilize o site.`}
      updatedAt={LEGAL_LAST_UPDATE}
    >
      <div className="legal-body">
        <h2>1. O serviço</h2>
        <p>
          O {SITE_NAME} é um portal de notícias de acesso gratuito. Podemos alterar, suspender ou encerrar qualquer
          parte do site a qualquer momento, sem aviso prévio.
        </p>

        <h2>2. Direitos sobre o conteúdo</h2>
        <p>
          Textos, fotografias, vídeos, marcas e o layout do site pertencem ao {SITE_NAME} ou aos respectivos
          titulares e são protegidos pela Lei de Direitos Autorais (Lei nº 9.610/1998).
        </p>
        <ul>
          <li>Você pode compartilhar o link das notícias livremente, inclusive nas redes sociais.</li>
          <li>Pode citar trechos curtos, desde que indique o {SITE_NAME} como fonte e inclua o link da notícia.</li>
          <li>Não é permitido reproduzir notícias na íntegra, nem usá-las para fins comerciais, sem autorização por escrito.</li>
        </ul>

        <h2>3. Uso adequado</h2>
        <p>Ao usar o site, você se compromete a não:</p>
        <ul>
          <li>tentar acessar áreas restritas, como o painel editorial, sem autorização;</li>
          <li>enviar spam, conteúdo ilegal ou ofensivo pelos formulários do site;</li>
          <li>coletar conteúdo de forma automatizada em volume que prejudique o funcionamento do site;</li>
          <li>interferir na segurança ou na disponibilidade do serviço.</li>
        </ul>

        <h2>4. Precisão das informações</h2>
        <p>
          Trabalhamos para publicar informações corretas e atualizadas, mas notícias refletem o que se sabia no momento
          da publicação e podem ser atualizadas. O conteúdo tem caráter informativo e não substitui aconselhamento
          profissional (jurídico, financeiro, médico ou outro). Se encontrar um erro, avise-nos pela página de{' '}
          <Link href="/contato">Contato</Link>.
        </p>

        <h2>5. Links e conteúdos de terceiros</h2>
        <p>
          As notícias podem conter links, vídeos e publicações incorporadas de outros sites e redes sociais. Não
          controlamos esses serviços e não respondemos pelo conteúdo ou pelas práticas de privacidade deles.
        </p>

        <h2>6. Publicidade</h2>
        <p>
          O site pode exibir anúncios de terceiros. A responsabilidade pelos produtos e serviços anunciados é dos
          respectivos anunciantes.
        </p>

        <h2>7. Newsletter</h2>
        <p>
          A inscrição é gratuita e pode ser cancelada a qualquer momento. O tratamento do seu email segue a nossa{' '}
          <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
        </p>

        <h2>8. Limitação de responsabilidade</h2>
        <p>
          Na extensão permitida por lei, o {SITE_NAME} não se responsabiliza por danos decorrentes do uso do site,
          de indisponibilidades temporárias ou de decisões tomadas com base no conteúdo publicado.
        </p>

        <h2>9. Alterações destes termos</h2>
        <p>
          Estes termos podem ser atualizados. A data da última revisão aparece no topo da página, e o uso contínuo do
          site após uma alteração significa concordância com a nova versão.
        </p>

        <h2>10. Lei aplicável e contato</h2>
        <p>
          Estes termos são regidos pelas leis da República Federativa do Brasil. Dúvidas podem ser enviadas para{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </div>
    </InstitutionalPage>
  )
}
