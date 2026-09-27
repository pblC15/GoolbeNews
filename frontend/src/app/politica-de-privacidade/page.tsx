import type { Metadata } from 'next'
import Link from 'next/link'
import InstitutionalPage from '@/components/InstitutionalPage'
import { CONTACT_EMAIL, LEGAL_LAST_UPDATE, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: `Como o ${SITE_NAME} coleta, usa e protege os seus dados pessoais, em conformidade com a LGPD.`,
  alternates: { canonical: '/politica-de-privacidade' },
}

// ⚠️ Modelo de referência. Revise com um profissional jurídico antes de publicar,
// especialmente se o site passar a usar novos serviços de terceiros.
export default function PrivacidadePage() {
  return (
    <InstitutionalPage
      current="/politica-de-privacidade"
      title="Política de Privacidade"
      intro={`Esta política explica quais dados o ${SITE_NAME} trata quando você visita o site, para que servem e como exercer os seus direitos, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).`}
      updatedAt={LEGAL_LAST_UPDATE}
    >
      <div className="legal-body">
        <h2>1. Quem é o responsável pelos dados</h2>
        <p>
          O controlador dos dados é o {SITE_NAME}. Dúvidas ou pedidos sobre privacidade podem ser enviados para{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2>2. Dados que tratamos</h2>
        <h3>Dados que você nos fornece</h3>
        <ul>
          <li><strong>Newsletter:</strong> o seu endereço de email, a data da inscrição e a página em que ela foi feita.</li>
          <li><strong>Formulário de contato:</strong> nome, email, assunto e o conteúdo da mensagem.</li>
        </ul>
        <h3>Dados coletados automaticamente</h3>
        <ul>
          <li>
            <strong>Estatística de leitura:</strong> contamos quantas vezes cada notícia é aberta, sem associar essa
            contagem a você.
          </li>
          <li>
            <strong>Localização aproximada e clima:</strong> para exibir cidade e temperatura no topo do site, o seu
            navegador consulta os serviços ipapi.co (localização aproximada pelo endereço IP) e Open-Meteo (previsão do
            tempo). Não guardamos essa informação nos nossos servidores.
          </li>
          <li>
            <strong>Registros técnicos:</strong> endereço IP, tipo de navegador e páginas acessadas podem ser registrados
            pelos servidores de hospedagem para segurança e funcionamento do site.
          </li>
        </ul>

        <h2>3. Para que usamos os dados</h2>
        <ul>
          <li>Enviar a newsletter com novas publicações, a quem se inscreveu (base legal: consentimento).</li>
          <li>Responder a mensagens de contato (base legal: procedimentos a pedido do titular).</li>
          <li>Manter o site seguro e funcionando, e entender quais conteúdos interessam mais (base legal: legítimo interesse).</li>
          <li>Exibir publicidade, quando ativa (ver secção 4).</li>
        </ul>
        <p>Não vendemos dados pessoais.</p>

        <h2>4. Cookies e publicidade</h2>
        <p>
          Cookies são pequenos arquivos guardados no seu navegador. O {SITE_NAME} utiliza ou poderá utilizar o
          Google AdSense para exibir anúncios. Nesse caso:
        </p>
        <ul>
          <li>
            Fornecedores terceiros, incluindo o Google, usam cookies para exibir anúncios com base em visitas anteriores
            a este e a outros sites.
          </li>
          <li>
            O uso de cookies de publicidade permite que o Google e os seus parceiros exibam anúncios com base nas suas
            visitas a este e/ou a outros sites na Internet.
          </li>
          <li>
            Você pode desativar a publicidade personalizada nas{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Configurações de anúncios do Google</a>{' '}
            ou, para fornecedores terceiros, em{' '}
            <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.
          </li>
          <li>
            Saiba mais sobre como o Google usa os dados em{' '}
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
              policies.google.com/technologies/partner-sites
            </a>.
          </li>
        </ul>
        <p>
          Você também pode bloquear ou apagar cookies nas configurações do seu navegador. Algumas funcionalidades podem
          deixar de funcionar corretamente.
        </p>

        <h2>5. Compartilhamento</h2>
        <p>
          Os dados podem ser tratados por fornecedores que nos ajudam a operar o site (hospedagem, envio de emails e
          publicidade), sempre limitados ao necessário para o serviço contratado, e por autoridades quando exigido por lei.
        </p>

        <h2>6. Por quanto tempo guardamos</h2>
        <ul>
          <li>Email da newsletter: até você cancelar a inscrição.</li>
          <li>Mensagens de contato: pelo tempo necessário para responder e acompanhar o assunto.</li>
          <li>Registros técnicos: pelo prazo exigido pela legislação aplicável (Marco Civil da Internet).</li>
        </ul>

        <h2>7. Os seus direitos</h2>
        <p>Pela LGPD, você pode, a qualquer momento:</p>
        <ul>
          <li>confirmar se tratamos os seus dados e acessá-los;</li>
          <li>corrigir dados incompletos ou desatualizados;</li>
          <li>pedir a eliminação dos dados tratados com base no consentimento, como o email da newsletter;</li>
          <li>revogar o consentimento;</li>
          <li>apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).</li>
        </ul>
        <p>
          Para exercer qualquer um desses direitos, escreva para <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{' '}
          ou use a página de <Link href="/contato">Contato</Link>.
        </p>

        <h2>8. Segurança</h2>
        <p>
          Adotamos medidas técnicas e administrativas razoáveis para proteger os dados contra acesso não autorizado,
          perda ou alteração. Nenhum sistema é totalmente imune a falhas; se ocorrer um incidente relevante, os
          titulares afetados e a ANPD serão comunicados conforme a lei.
        </p>

        <h2>9. Menores de idade</h2>
        <p>O site é destinado ao público em geral e não coleta intencionalmente dados de crianças.</p>

        <h2>10. Alterações nesta política</h2>
        <p>
          Esta política pode ser atualizada. A data da última revisão aparece no topo da página. Mudanças relevantes
          serão sinalizadas no site.
        </p>
      </div>
    </InstitutionalPage>
  )
}
