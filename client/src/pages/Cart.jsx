import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCart, fetchProducts } from '../store'
import { Cover, money } from '../ui'

export default function Cart() {
  const d = useDispatch()
  const { items, status } = useSelector((s) => s.cart)
  const products = useSelector((s) => s.products.items)
  useEffect(() => { d(fetchCart()); d(fetchProducts(false)) }, [d])

  // The cart API returns product ids only, so join them with the product list.
  const rows = items.map((i) => ({ ...i, p: products.find((x) => x._id === (i.product?._id ?? i.product)) }))
  const totals = rows.reduce((t, r) => {
    if (r.p) t[r.p.price.currency] = (t[r.p.price.currency] ?? 0) + r.p.price.amount * r.quantity
    return t
  }, {})

  return (
    <>
      <h1 className="display mb-8 text-5xl sm:text-7xl">Cart</h1>
      {status === 'loading' && !items.length && <p className="font-bold">Loading…</p>}
      {status === 'ready' && !items.length && <p>Your cart is empty. <Link to="/" className="font-bold underline">Find something to wear</Link></p>}
      <ul className="max-w-2xl divide-y-2 divide-ink border-y-2 border-ink">
        {rows.map((r) => (
          <li key={`${r.product}-${r.size}`} className="flex items-center gap-4 py-4">
            {r.p ? <Cover p={r.p} className="h-24 w-20 shrink-0 border-2 border-ink text-3xl" /> : <div className="h-24 w-20 shrink-0 bg-ink/10" />}
            <div className="flex-1">
              <p className="font-bold">{r.p ? <Link to={`/product/${r.p._id}`} className="hover:underline">{r.p.title}</Link> : 'Item no longer available'}</p>
              <p className="text-sm text-mute">Size {r.size} · Qty {r.quantity}</p>
            </div>
            {r.p && <p className="font-bold">{money({ amount: r.p.price.amount * r.quantity, currency: r.p.price.currency })}</p>}
          </li>
        ))}
      </ul>
      {items.length > 0 && (
        <p className="mt-6 max-w-2xl text-right text-2xl font-bold">
          Total {Object.entries(totals).map(([currency, amount]) => money({ amount, currency })).join(' + ')}
        </p>
      )}
    </>
  )
}
