// frontend/src/lib/ads.ts
//
// Configuração central do Google AdSense.
//
// O client ID (ca-pub-...) é o mesmo em todo o site e já está configurado.
// Os "slots" abaixo são placeholders — crie os blocos de anúncio
// correspondentes no painel do AdSense (Anúncios > Por unidade de anúncio)
// e substitua cada valor pelo ID gerado lá (ex.: "1234567890"). Enquanto
// forem placeholders, o Google não preenche esses espaços com anúncios
// reais (o layout fica reservado, mas em branco).

export const ADSENSE_CLIENT_ID = 'ca-pub-3330048375656420'

export const AD_SLOTS = {
  // Home: logo abaixo da manchete principal, antes das últimas notícias.
  homeTop: 'REPLACE_HOME_TOP_SLOT_ID',
  // Home: no meio da grelha de "Últimas notícias" (a cada 6 notícias).
  homeFeed: 'REPLACE_HOME_FEED_SLOT_ID',
  // Página de categoria: depois da grelha de notícias da categoria.
  categoryFeed: 'REPLACE_CATEGORY_FEED_SLOT_ID',
  // Notícia: logo no início do corpo do texto (alta visibilidade).
  postTop: 'REPLACE_POST_TOP_SLOT_ID',
  // Notícia: no final do corpo do texto, antes de partilhar/newsletter.
  postBottom: 'REPLACE_POST_BOTTOM_SLOT_ID',
} as const
