// src/components/HeaderLiveInfo.tsx
'use client'
import { useEffect, useState } from 'react'
import { HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi'
import { WiDaySunny, WiDayCloudy, WiCloud } from 'react-icons/wi'

type LocationInfo = { city?: string; country?: string; lat?: number; lon?: number }

function formatTime(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(d)
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d).replace('.', '')
}

/** Ícone de sol/nuvem que muda conforme a temperatura atual */
function WeatherIcon({ temp }: { temp: number }) {
  if (temp >= 28) return <WiDaySunny className="h-5 w-5 text-amber-400" />
  if (temp >= 18) return <WiDayCloudy className="h-5 w-5 text-sky-300" />
  return <WiCloud className="h-5 w-5 text-slate-300" />
}

/**
 * Mostra, no topo do site: localidade, temperatura atual (com ícone que
 * muda conforme a temperatura) e um relógio ao vivo (atualiza a cada
 * segundo). Localização aproximada por IP (ipapi.co) e clima via
 * Open-Meteo — ambos gratuitos, sem chave de API. Se a detecção falhar,
 * simplesmente omite o que não pôde ser carregado — o relógio nunca falha.
 *
 * Observação sobre precisão: geolocalização por IP é aproximada por
 * natureza (aponta a cidade "de referência" do provedor de internet do
 * visitante, não o endereço exato). Para precisão real seria necessário
 * pedir permissão de localização do navegador (ver HeaderLiveInfo.precise.tsx).
 */
export default function HeaderLiveInfo() {
  const [now, setNow] = useState<Date | null>(null)
  const [loc, setLoc] = useState<LocationInfo | null>(null)
  const [temp, setTemp] = useState<number | null>(null)

  // relógio "cronometrado"
  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // localização + temperatura (uma vez, ao carregar)
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const geo = await fetch('https://ipapi.co/json/').then(r => r.json())
        if (cancelled || !geo || geo.error) return
        // usamos o código do país (ex.: "PT"), não region_code — em vários
        // países (como Portugal) region_code vem como número de distrito
        // sem sentido para exibir (ex.: "14")
        setLoc({ city: geo.city, country: geo.country_code, lat: geo.latitude, lon: geo.longitude })
        if (geo.latitude != null && geo.longitude != null) {
          const w = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&current=temperature_2m`
          ).then(r => r.json())
          if (!cancelled) {
            setTemp(typeof w?.current?.temperature_2m === 'number' ? w.current.temperature_2m : null)
          }
        }
      } catch {
        // falha silenciosa
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // evita divergência de hidratação: nada no primeiro render do servidor
  if (!now) return null

  return (
    <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-300 sm:gap-3 sm:text-xs">
      {loc?.city && (
        <span className="flex items-center gap-1">
          <HiOutlineLocationMarker className="h-3.5 w-3.5 text-sky-400" />
          {loc.city}
          {loc.country ? `, ${loc.country}` : ''}
        </span>
      )}

      {temp != null && (
        <>
          <span className="hidden h-3 w-px bg-white/15 sm:block" />
          <span className="flex items-center gap-0.5">
            <WeatherIcon temp={temp} />
            {Math.round(temp)}°C
          </span>
        </>
      )}

      <span className="hidden h-3 w-px bg-white/15 sm:block" />
      <span className="flex items-center gap-1 tabular-nums">
        <HiOutlineClock className="h-3.5 w-3.5 text-sky-400" />
        {formatDate(now)} · {formatTime(now)}
      </span>
    </div>
  )
}