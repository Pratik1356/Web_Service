export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
export const inputCls = 'w-full border-2 border-ink bg-white px-3 py-2'
export const btnCls = 'border-2 border-ink bg-ink px-5 py-2.5 font-bold text-signal transition-colors hover:bg-signal hover:text-ink disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-signal'

export const money = (price) =>
  price ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: price.currency || 'INR', maximumFractionDigits: 0 }).format(price.amount) : ''

export const bySize = (a, b) => SIZES.indexOf(a.size) - SIZES.indexOf(b.size)

export function Cover({ p, className = '' }) {
  return p?.images?.[0]
    ? <img src={p.images[0]} alt={p.title} className={`bg-ink/10 object-cover ${className}`} />
    : <div className={`display grid place-items-center bg-ink text-6xl text-signal ${className}`}>{p?.title?.[0] ?? '?'}</div>
}

export function Errors({ list }) {
  if (!list?.length) return null
  return (
    <ul role="alert" className="border-2 border-alarm bg-white p-3 text-sm text-alarm">
      {list.map((m, i) => <li key={i}>{m}</li>)}
    </ul>
  )
}
