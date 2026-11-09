import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, fetchProducts } from '../store'
import { Cover, bySize, btnCls, money } from '../ui'

export default function Product() {
  const { id } = useParams()
  const d = useDispatch()
  const { items, status } = useSelector((s) => s.products)
  const p = items.find((x) => x._id === id)
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [img, setImg] = useState(0)
  const [msg, setMsg] = useState(null)
  useEffect(() => { if (!p) d(fetchProducts(false)) }, [p, d])

  if (!p) return status === 'ready' ? <p>Product not found. <Link to="/" className="font-bold underline">Back to shop</Link></p> : <p className="font-bold">Loading…</p>

  const stock = p.sizes.find((s) => s.size === size)?.stock ?? 0
  const add = async () => {
    setMsg(null)
    const r = await d(addToCart({ productId: p._id, quantity: qty, size }))
    setMsg(r.error ? { bad: true, text: r.payload.errors?.[0]?.msg ?? r.payload.message } : { text: 'Added to cart' })
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <div className="border-2 border-ink"><Cover p={{ ...p, images: [p.images?.[img]].filter(Boolean) }} className="aspect-[4/5] w-full" /></div>
        {p.images?.length > 1 && (
          <div className="mt-3 flex gap-2">
            {p.images.map((src, i) => (
              <button key={src} onClick={() => setImg(i)} aria-label={`Photo ${i + 1}`} className={`h-16 w-14 border-2 ${i === img ? 'border-ink' : 'border-transparent opacity-60'}`}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-6">
        <Link to="/" className="text-sm underline">← Shop</Link>
        <h1 className="display text-4xl sm:text-5xl">{p.title}</h1>
        <p className="inline-block border-2 border-ink bg-signal px-3 py-1 text-xl font-bold">{money(p.price)}</p>
        <p className="max-w-prose">{p.description}</p>

        <fieldset>
          <legend className="mb-2 font-bold">Size</legend>
          <div className="flex flex-wrap gap-2">
            {[...p.sizes].sort(bySize).map((s) => (
              <button key={s.size} disabled={s.stock < 1} onClick={() => { setSize(s.size); setQty(1); setMsg(null) }} aria-pressed={size === s.size}
                className={`min-w-14 border-2 border-ink px-3 py-2 font-bold disabled:text-mute disabled:line-through disabled:opacity-50 ${size === s.size ? 'bg-ink text-signal' : 'bg-white hover:bg-signal'}`}>
                {s.size}
              </button>
            ))}
          </div>
          {size && <p className="mt-2 text-sm text-mute">{stock} in stock</p>}
        </fieldset>

        <div className="flex items-center gap-3">
          <span className="font-bold">Quantity</span>
          <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease" className="h-9 w-9 border-2 border-ink font-bold">−</button>
          <span className="w-6 text-center font-bold">{qty}</span>
          <button onClick={() => setQty(Math.min(stock || 1, qty + 1))} aria-label="Increase" className="h-9 w-9 border-2 border-ink font-bold">+</button>
        </div>

        <button disabled={!size} onClick={add} className={btnCls}>{size ? 'Add to cart' : 'Pick a size'}</button>
        {msg && <p role="status" className={msg.bad ? 'text-alarm' : 'font-bold'}>{msg.text} {!msg.bad && <Link to="/cart" className="underline">View cart</Link>}</p>}
      </div>
    </div>
  )
}
