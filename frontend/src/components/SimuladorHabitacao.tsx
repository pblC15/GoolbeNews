'use client'

import { useMemo, useState } from 'react'

const formatEUR = (amount: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)

/** Exemplo informativo. Não constitui proposta de crédito ou confirmação de elegibilidade. */
export default function SimuladorHabitacao() {
  const [price, setPrice] = useState(220000)
  const [financedPercent, setFinancedPercent] = useState(90)
  const [annualRate, setAnnualRate] = useState(3.5)
  const [years, setYears] = useState(35)

  const calculation = useMemo(() => {
    const financed = price * financedPercent / 100
    const entry = price - financed
    const months = years * 12
    const monthlyRate = annualRate / 100 / 12
    const payment = monthlyRate === 0
      ? financed / months
      : financed * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months))
    return { financed, entry, payment, total: payment * months }
  }, [price, financedPercent, annualRate, years])

  return (
    <section aria-labelledby="simulador-habitacao" className="not-prose my-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-900 px-5 py-6 text-white sm:px-7">
        <h2 id="simulador-habitacao" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Simulador de entrada e prestação</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">Veja quanto precisaria de entrada e qual seria a prestação mensal aproximada para comprar a primeira casa em Portugal.</p>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        <fieldset>
          <legend className="mb-3 text-sm font-bold text-slate-800">Preço do imóvel</legend>
          <div className="grid grid-cols-3 gap-2">
            {[180000, 220000, 250000].map((amount) => (
              <button key={amount} type="button" onClick={() => setPrice(amount)} aria-pressed={price === amount}
                className={`rounded-xl border px-2 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:text-base ${price === amount ? 'border-sky-700 bg-sky-50 text-sky-900 ring-1 ring-sky-700' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300'}`}>
                {formatEUR(amount)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-bold text-slate-800">Percentual financiado</legend>
          <div className="grid grid-cols-2 gap-2">
            {[90, 100].map((percent) => (
              <button key={percent} type="button" onClick={() => setFinancedPercent(percent)} aria-pressed={financedPercent === percent}
                className={`rounded-xl border px-3 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${financedPercent === percent ? 'border-sky-700 bg-sky-50 text-sky-900 ring-1 ring-sky-700' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300'}`}>
                {percent}% {percent === 100 ? '(hipotético)' : '(convencional)'}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-slate-800">
            Taxa anual nominal (TAN)
            <span className="mt-2 flex items-center gap-2">
              <input aria-label="Taxa anual nominal" type="number" inputMode="decimal" min="0" max="25" step="0.1" value={annualRate}
                onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v)) setAnnualRate(Math.max(0, Math.min(25, v))) }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-medium text-slate-900" />
              <span className="font-normal text-slate-600">%</span>
            </span>
          </label>
          <label className="block text-sm font-bold text-slate-800">
            Prazo do empréstimo
            <select value={years} onChange={(e) => setYears(Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-medium text-slate-900">
              {[20, 25, 30, 35, 40].map((v) => <option key={v} value={v}>{v} anos</option>)}
            </select>
          </label>
        </div>

        <div aria-live="polite" aria-atomic="true" className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-600">Entrada de capital</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">{formatEUR(calculation.entry)}</p>
          </div>
          <div className="rounded-xl bg-sky-50 p-4">
            <p className="text-xs font-semibold text-sky-800">Prestação mensal</p>
            <p className="mt-1 text-xl font-extrabold text-sky-950 sm:text-2xl">{formatEUR(calculation.payment)}</p>
          </div>
        </div>
        <dl className="space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-slate-600">Montante financiado</dt><dd className="font-bold text-slate-900">{formatEUR(calculation.financed)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-600">Total de prestações no prazo</dt><dd className="font-bold text-slate-900">{formatEUR(calculation.total)}</dd></div>
        </dl>
        {financedPercent === 100 && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-950">
            <strong>Atenção:</strong> financiamento a 100% é apenas uma hipótese. Depende da elegibilidade, da avaliação e aprovação do banco e da vigência legal da garantia pública na data do contrato. A extensão para novos contratos em 2027 precisa ser confirmada.
          </p>
        )}
        <p className="text-xs leading-relaxed text-slate-600">
          Simulação ilustrativa com prestações constantes e taxa nominal fixa apenas para fins de cálculo. Não inclui seguros, comissões, impostos, despesas de escritura ou outros encargos. O valor aprovado pode depender da avaliação do imóvel, da taxa de esforço e das regras de prazo aplicáveis à idade do cliente. Não constitui proposta de crédito.
        </p>
      </div>
    </section>
  )
}
