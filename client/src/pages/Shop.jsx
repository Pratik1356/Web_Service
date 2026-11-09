import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../store'
import { Cover, bySize, money } from '../ui'

export default function Shop() {
  const d = useDispatch()
  const { items, status, error } = useSelector((s) => s.products)
  const role = useSelector((s) => s.auth.user.role)
  useEffect(() => { d(fetchProducts(false)) }, [d])

  return (
    <>
      <h1 className="display mb-8 text-5xl sm:text-7xl">New in</h1>
      {error && <p role="alert" className="mb-4 border-2 border-alarm bg-white p-3 text-alarm">{error}</p>}
      {status === 'loading' && !items.length && <p className="font-bold">Loading…</p>}
      {status === 'ready' && !items.length && !error && (
        <p className="max-w-md">Nothing is on sale yet.{role === 'seller' && <> Publish a product from <Link to="/sell" className="font-bold underline">Sell</Link>.</>}</p>
      )}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => {
          const open = p.sizes.filter((s) => s.stock > 0).sort(bySize)
          return (
            <li key={p._id}>
              <Link to={`/product/${p._id}`} className="group block">
                <div className="relative border-2 border-ink">
                  <Cover p={p} className="aspect-[4/5] w-full" />
                  <span className="absolute bottom-0 left-0 border-r-2 border-t-2 border-ink bg-signal px-3 py-1 font-bold">{money(p.price)}</span>
                </div>
                <h2 className="mt-2 font-bold group-hover:underline">{p.title}</h2>
                <p className="text-sm text-mute">{open.length ? open.map((s) => s.size).join(' ') : 'Sold out'}</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
