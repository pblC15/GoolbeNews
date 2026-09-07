// src/components/EditorClient.tsx
'use client'
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

export type EditorHandle = { getData: () => Promise<{ blocks: any[] }> }

function authHeaders(): HeadersInit | undefined {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : undefined
}

// Tool customizada para upload/inserção de vídeo (arquivo próprio ou URL direta .mp4/.webm)
class VideoTool {
  static get toolbox() {
    return {
      title: 'Vídeo',
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3.4l4.2-2.8A1 1 0 0 1 22 7.4v9.2a1 1 0 0 1-1.55.83L16 14.6V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" fill="currentColor"/></svg>',
    }
  }
  static get isReadOnlySupported() { return true }

  api: any
  data: { url?: string; caption?: string }
  wrapper: HTMLElement | null = null

  constructor({ data, api }: any) {
    this.api = api
    this.data = { url: data?.url || '', caption: data?.caption || '' }
  }

  render() {
    const wrapper = document.createElement('div')
    wrapper.className = 'cdx-video-tool'
    wrapper.style.cssText = 'border:1px dashed #cbd5e1;border-radius:12px;padding:16px;background:#f8fafc;'

    const renderPreview = () => {
      wrapper.innerHTML = ''
      if (this.data.url) {
        const video = document.createElement('video')
        video.src = this.data.url
        video.controls = true
        video.style.cssText = 'width:100%;border-radius:10px;max-height:420px;background:#000;'
        wrapper.appendChild(video)

        const captionInput = document.createElement('input')
        captionInput.placeholder = 'Legenda do vídeo (opcional)'
        captionInput.value = this.data.caption || ''
        captionInput.style.cssText = 'margin-top:8px;width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px;font-size:13px;'
        captionInput.addEventListener('input', () => { this.data.caption = captionInput.value })
        wrapper.appendChild(captionInput)

        const removeBtn = document.createElement('button')
        removeBtn.textContent = 'Remover vídeo'
        removeBtn.style.cssText = 'margin-top:8px;font-size:12px;color:#dc2626;background:none;border:0;cursor:pointer;'
        removeBtn.addEventListener('click', () => { this.data.url = ''; renderPreview() })
        wrapper.appendChild(removeBtn)
      } else {
        const label = document.createElement('label')
        label.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;color:#475569;font-size:13px;'
        label.innerHTML = '<span>📹 Clique para enviar um vídeo (MP4, WebM)</span>'
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'video/mp4,video/webm,video/ogg,video/quicktime'
        input.style.display = 'none'
        input.addEventListener('change', async () => {
          const file = input.files?.[0]
          if (!file) return
          label.innerHTML = '<span>Enviando vídeo...</span>'
          try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/upload`, {
              method: 'POST',
              headers: authHeaders(),
              body: fd,
            })
            const d = await res.json()
            if (!res.ok || !d?.file?.url) throw new Error(d?.error || 'Falha no upload')
            this.data.url = d.file.url
            renderPreview()
          } catch (e: any) {
            alert(e.message || 'Erro ao enviar vídeo')
            renderPreview()
          }
        })
        label.appendChild(input)
        wrapper.appendChild(label)

        const urlRow = document.createElement('div')
        urlRow.style.cssText = 'margin-top:10px;display:flex;gap:6px;'
        const urlInput = document.createElement('input')
        urlInput.placeholder = 'ou cole a URL direta do vídeo (.mp4)'
        urlInput.style.cssText = 'flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:8px;font-size:13px;'
        const urlBtn = document.createElement('button')
        urlBtn.textContent = 'Usar'
        urlBtn.style.cssText = 'border:1px solid #0284c7;color:#0284c7;background:#fff;border-radius:8px;padding:8px 12px;font-size:13px;font-weight:600;cursor:pointer;'
        urlBtn.addEventListener('click', () => {
          if (!urlInput.value.trim()) return
          this.data.url = urlInput.value.trim()
          renderPreview()
        })
        urlRow.appendChild(urlInput)
        urlRow.appendChild(urlBtn)
        wrapper.appendChild(urlRow)
      }
    }

    renderPreview()
    this.wrapper = wrapper
    return wrapper
  }

  save() {
    return { url: this.data.url || '', caption: this.data.caption || '' }
  }

  validate(savedData: any) {
    return !!savedData.url
  }
}

const EditorClient = forwardRef<EditorHandle, { onChange: (data: any) => void; initialBlocks?: any[] }>(({ onChange, initialBlocks = [] }, ref) => {
  const holderRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    async getData() {
      const ed = editorRef.current
      if (!ed) return { blocks: [] }
      try {
        const data = await ed.saver.save()
        return { blocks: data?.blocks ?? [] }
      } catch {
        return { blocks: [] }
      }
    },
  }))

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const [
        { default: EditorJS },
        { default: Header },
        { default: Paragraph },
        { default: List },
        { default: ImageTool },
        { default: Quote },
        { default: Embed },
        { default: Marker },
        { default: Underline },
        { default: InlineCode },
      ] = await Promise.all([
        import('@editorjs/editorjs'),
        import('@editorjs/header'),
        import('@editorjs/paragraph'),
        import('@editorjs/list'),
        import('@editorjs/image'),
        import('@editorjs/quote'),
        import('@editorjs/embed'),
        import('@editorjs/marker'),
        import('@editorjs/underline'),
        import('@editorjs/inline-code'),
      ])
      if (!isMounted || !holderRef.current) return

      const editor = new EditorJS({
        holder: holderRef.current,
        autofocus: false,
        inlineToolbar: ['bold', 'italic', 'underline', 'marker', 'inlineCode', 'link'],
        placeholder: 'Escreva a notícia... use "/" para adicionar imagem, vídeo, citação ou um link do YouTube/Instagram',
        tools: {
          header: { class: Header, config: { placeholder: 'Subtítulo', levels: [2, 3, 4], defaultLevel: 2 } },
          paragraph: { class: Paragraph, inlineToolbar: true },
          list: { class: List, inlineToolbar: true },
          quote: { class: Quote, inlineToolbar: true, config: { quotePlaceholder: 'Citação', captionPlaceholder: 'Autor / fonte' } },
          marker: Marker,
          underline: Underline,
          inlineCode: InlineCode,
          video: VideoTool,
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                instagram: true,
                vimeo: true,
              },
            },
          },
          image: {
            class: ImageTool,
            config: {
              captionPlaceholder: 'Legenda da imagem (opcional)',
              uploader: {
                async uploadByFile(file: File) {
                  const fd = new FormData()
                  fd.append('file', file)
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/upload`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: fd,
                  })
                  const data = await res.json()
                  if (!res.ok || !data?.file?.url) throw new Error(data?.error || 'Falha no upload')
                  return { success: 1, file: { url: data.file.url } }
                },
                async uploadByUrl(url: string) {
                  return { success: 1, file: { url } }
                }
              }
            }
          }
        },
        data: { blocks: initialBlocks.length ? initialBlocks : [{ type: 'paragraph', data: { text: '' } }] },
        async onChange(api) {
          const data = await api.saver.save()
          onChange(data)
        },
      })

      editorRef.current = editor
    })()

    return () => {
      isMounted = false
      const ed = editorRef.current
      if (ed && typeof ed.destroy === 'function') { try { ed.destroy() } catch {} }
      editorRef.current = null
    }
  }, [onChange])

  return (
    <div>
      <p className="mb-3 text-xs text-slate-400">
        Selecione um trecho de texto para negrito, itálico, sublinhado, marcador ou código. Digite <kbd className="rounded border bg-slate-50 px-1">/</kbd> para inserir imagem, vídeo, citação ou link do YouTube/Instagram.
      </p>
      <div ref={holderRef} className="min-h-[300px] rounded border bg-white p-4 text-gray-900 caret-gray-900" />
    </div>
  )
})

export default EditorClient
