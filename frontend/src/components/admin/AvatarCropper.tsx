'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { HiOutlineZoomIn, HiOutlineZoomOut } from 'react-icons/hi'

/** Tamanho da área de enquadramento na tela (px) e da imagem final gerada */
const VIEW = 264
const OUTPUT = 400
const MAX_ZOOM = 4

type Props = {
  file: File
  onCancel: () => void
  /** recebe a foto já recortada (quadrada, 400x400) */
  onConfirm: (blob: Blob) => void | Promise<void>
}

/**
 * Janela para posicionar a foto antes de enviar: arrastar para mover,
 * controle deslizante (ou roda do mouse) para aproximar, setas do teclado
 * para ajuste fino. O recorte é feito no navegador e só a parte visível
 * dentro do círculo é enviada ao servidor.
 */
export default function AvatarCropper({ file, onCancel, onConfirm }: Props) {
  const [src, setSrc] = useState<string>('')
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [busy, setBusy] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // escala para a imagem cobrir todo o quadro com zoom 1
  const base = nat ? VIEW / Math.min(nat.w, nat.h) : 1
  const dw = nat ? nat.w * base * zoom : VIEW
  const dh = nat ? nat.h * base * zoom : VIEW

  // impede que apareçam bordas vazias dentro do quadro
  const clamp = useCallback(
    (x: number, y: number, w = dw, h = dh) => ({
      x: Math.min(0, Math.max(VIEW - w, x)),
      y: Math.min(0, Math.max(VIEW - h, y)),
    }),
    [dw, dh]
  )

  function onLoad() {
    const img = imgRef.current
    if (!img) return
    const w = img.naturalWidth, h = img.naturalHeight
    setNat({ w, h })
    const b = VIEW / Math.min(w, h)
    // começa centralizada
    setPos({ x: (VIEW - w * b) / 2, y: (VIEW - h * b) / 2 })
  }

  // zoom mantendo fixo o ponto no centro do quadro
  function applyZoom(next: number) {
    if (!nat) return
    const z = Math.min(MAX_ZOOM, Math.max(1, next))
    const ratio = z / zoom
    const c = VIEW / 2
    const nx = c - (c - pos.x) * ratio
    const ny = c - (c - pos.y) * ratio
    setZoom(z)
    setPos(clamp(nx, ny, nat.w * base * z, nat.h * base * z))
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y }
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current
    if (!d) return
    setPos(clamp(d.x + e.clientX - d.px, d.y + e.clientY - d.py))
  }
  function onPointerUp() {
    drag.current = null
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 25 : 8
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step],
    }
    if (moves[e.key]) {
      e.preventDefault()
      const [mx, my] = moves[e.key]
      setPos(clamp(pos.x + mx, pos.y + my))
    } else if (e.key === '+' || e.key === '=') applyZoom(zoom + 0.1)
    else if (e.key === '-') applyZoom(zoom - 0.1)
  }

  // Esc fecha a janela
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onCancel() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onCancel, busy])

  // roda do mouse aproxima/afasta (listener não-passivo para impedir o scroll da página)
  const viewRef = useRef<HTMLDivElement>(null)
  // guarda os valores da renderização atual para o listener abaixo
  const live = useRef({ zoom, applyZoom })
  live.current = { zoom, applyZoom }
  useEffect(() => {
    const el = viewRef.current
    if (!el) return
    const h = (e: WheelEvent) => {
      e.preventDefault()
      live.current.applyZoom(live.current.zoom - e.deltaY * 0.002)
    }
    el.addEventListener('wheel', h, { passive: false })
    return () => el.removeEventListener('wheel', h)
  }, [])

  async function confirm() {
    const img = imgRef.current
    if (!img || !nat) return
    setBusy(true)
    try {
      const scale = base * zoom
      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT
      canvas.height = OUTPUT
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, -pos.x / scale, -pos.y / scale, VIEW / scale, VIEW / scale, 0, 0, OUTPUT, OUTPUT)
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.92))
      if (!blob) throw new Error('Não foi possível processar a imagem.')
      await onConfirm(blob)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="cropper-title">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h2 id="cropper-title" className="text-lg font-black">Posicionar foto</h2>
        <p className="mt-1 text-sm text-slate-500">Arraste para mover e use o controle para aproximar. Só o que está dentro do círculo aparece.</p>

        <div
          ref={viewRef}
          tabIndex={0}
          aria-label="Área de posicionamento da foto. Use as setas para mover e + ou - para aproximar."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          className="relative mx-auto mt-5 cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-slate-900 outline-none focus-visible:ring-4 focus-visible:ring-sky-300 active:cursor-grabbing"
          style={{ width: VIEW, height: VIEW }}
        >
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={src}
              alt=""
              onLoad={onLoad}
              draggable={false}
              className="pointer-events-none absolute left-0 top-0 max-w-none"
              style={{ width: dw, height: dh, transform: `translate(${pos.x}px, ${pos.y}px)`, visibility: nat ? 'visible' : 'hidden' }}
            />
          )}
          {/* máscara circular: escurece tudo o que fica fora da foto final */}
          <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/80" style={{ boxShadow: '0 0 0 9999px rgba(15,23,42,.55)' }} />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button type="button" onClick={() => applyZoom(zoom - 0.2)} aria-label="Afastar" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
            <HiOutlineZoomOut className="h-5 w-5" />
          </button>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => applyZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="flex-1 accent-sky-600"
          />
          <button type="button" onClick={() => applyZoom(zoom + 0.2)} aria-label="Aproximar" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
            <HiOutlineZoomIn className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className="rounded-xl border px-4 py-2 text-sm">Cancelar</button>
          <button type="button" onClick={confirm} disabled={busy || !nat} className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60">
            {busy ? 'Enviando...' : 'Usar esta foto'}
          </button>
        </div>
      </div>
    </div>
  )
}
