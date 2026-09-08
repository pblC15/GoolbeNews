// Vários plugins do ecossistema EditorJS publicam declarações de tipos
// desatualizadas ou incompatíveis entre si (ex.: @editorjs/header 2.8.8
// espera uma versão de @editorjs/editorjs diferente da que temos instalada,
// 2.31.6, e o TypeScript acusa erro de atribuição mesmo o código estando
// correto em tempo de execução). @editorjs/embed também não resolve os
// tipos corretamente com moduleResolution "bundler".
//
// Este arquivo "relaxa" a tipagem desses pacotes (tratando-os como `any`)
// só para o TypeScript não travar o build por causa de um problema dos
// pacotes de terceiros — não afeta o comportamento em tempo de execução.
declare module '@editorjs/header'
declare module '@editorjs/paragraph'
declare module '@editorjs/list'
declare module '@editorjs/quote'
declare module '@editorjs/embed'
declare module '@editorjs/marker'
declare module '@editorjs/underline'
declare module '@editorjs/inline-code'
declare module '@editorjs/image'
