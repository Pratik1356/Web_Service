import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createProduct, fetchProducts, setPublished } from '../store'
import { Cover, Errors, SIZES, btnCls, bySize, inputCls, money } from '../ui'

function NewProduct() {
  const d = useDispatch()
  const blank = { title: '', description: '', amount: '', currency: 'INR', sizes: {}, files: [] }
  const [f, setF] = useState(blank)
  const [errs, setErrs] = useState([])
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const toggle = (s) => setF((x) => {
    const sizes = { ...x.sizes }
    if (s in sizes) delete sizes[s]; else sizes[s] = 1
    return { ...x, sizes }
  })

  const submit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    setDone(false)
    const sizes = Object.entries(f.sizes).map(([size, stock]) => ({ size, stock: Number(stock) }))
    const bad = []
    if (!/^[A-Za-z -]{2,100}$/.test(f.title.trim())) bad.push('Title must be 2–100 letters, spaces or hyphens (the API rejects digits).')
    if (f.description.trim().length < 20 || f.description.trim().length > 500) bad.push('Description must be 20–500 characters.')
    if (!(Number(f.amount) >= 0) || f.amount === '') bad.push('Enter a price of 0 or more.')
    if (!sizes.length) bad.push('Select at least one size.')
    if (f.files.length > 5) bad.push('Upload at most 5 images.')
    if (f.files.some((x) => x.size > 1024 * 1024)) bad.push('Each image must be 1 MB or smaller.')
    if (bad.length) return setErrs(bad)

    const fd = new FormData()
    fd.append('title', f.title.trim())
    fd.append('description', f.description.trim())
    fd.append('price', JSON.stringify({ amount: Number(f.amount), currency: f.currency }))
    fd.append('sizes', JSON.stringify(sizes))
    f.files.forEach((x) => fd.append('images', x))

    setBusy(true)
    const r = await d(createProduct(fd))
    setBusy(false)
    if (r.error) return setErrs(r.payload.errors?.map((x) => x.msg) ?? [r.payload.message])
    setErrs([]); setDone(true); setF(blank); form.reset()
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4 border-2 border-ink bg-white p-5">
      <h2 className="display text-3xl">New product</h2>
      <label className="block"><span className="mb-1 block text-sm font-bold">Title</span>
        <input value={f.title} onChange={(e) => set('title', e.target.value)} className={inputCls} required /></label>
      <label className="block"><span className="mb-1 block text-sm font-bold">Description (20–500 characters)</span>
        <textarea value={f.description} onChange={(e) => set('description', e.target.value)} rows={4} className={inputCls} required /></label>
      <div className="flex gap-3">
        <label className="flex-1"><span className="mb-1 block text-sm font-bold">Price</span>
          <input type="number" min="0" step="any" value={f.amount} onChange={(e) => set('amount', e.target.value)} className={inputCls} required /></label>
        <label><span className="mb-1 block text-sm font-bold">Currency</span>
          <select value={f.currency} onChange={(e) => set('currency', e.target.value)} className={inputCls}><option>INR</option><option>USD</option></select></label>
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-bold">Sizes and stock</legend>
        <div className="space-y-2">
          {SIZES.map((s) => (
            <div key={s} className="flex items-center gap-3">
              <button type="button" aria-pressed={s in f.sizes} onClick={() => toggle(s)}
                className={`w-14 border-2 border-ink py-1 font-bold ${s in f.sizes ? 'bg-ink text-signal' : 'bg-white'}`}>{s}</button>
              {s in f.sizes && (
                <label className="flex items-center gap-2 text-sm">Stock
                  <input type="number" min="0" value={f.sizes[s]} onChange={(e) => setF((x) => ({ ...x, sizes: { ...x.sizes, [s]: e.target.value } }))} className="w-20 border-2 border-ink px-2 py-1" />
                </label>
              )}
            </div>
          ))}
        </div>
      </fieldset>
      <label className="block"><span className="mb-1 block text-sm font-bold">Images (up to 5, 1 MB each)</span>
        <input type="file" accept="image/*" multiple onChange={(e) => set('files', [...e.target.files])} className="block w-full text-sm" /></label>
      <Errors list={errs} />
      {done && <p role="status" className="font-bold">Product created as a draft. Publish it from the list below.</p>}
      <button disabled={busy} className={btnCls}>{busy ? 'Saving…' : 'Create product'}</button>
    </form>
  )
}

export default function Sell() {
  const d = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const { items, status, error } = useSelector((s) => s.products)
  const isSeller = user.role === 'seller'
  useEffect(() => { if (isSeller) d(fetchProducts(true)) }, [isSeller, d])

  if (!isSeller) return (
    <div className="max-w-md border-2 border-ink bg-white p-5">
      <h1 className="display mb-2 text-3xl">Seller access needed</h1>
      <p>This is a buyer account. To sell, create a new account and choose “Sell” on the sign-up form.</p>
    </div>
  )

  const toggle = (p) => d(setPublished({ id: p._id, published: !p.published }))
  return (
    <div className="space-y-12">
      <h1 className="display text-5xl sm:text-7xl">Sell</h1>
      <NewProduct />
      <section>
        <h2 className="display mb-4 text-3xl">Your products</h2>
        {error && <p role="alert" className="mb-3 text-alarm">{error}</p>}
        {status === 'ready' && !items.length && <p>No products yet. Create your first one above.</p>}
        <ul className="divide-y-2 divide-ink border-y-2 border-ink">
          {items.map((p) => (
            <li key={p._id} className="flex flex-wrap items-center gap-4 py-4">
              <Cover p={p} className="h-20 w-16 shrink-0 border-2 border-ink text-3xl" />
              <div className="min-w-48 flex-1">
                <p className="font-bold">{p.title} <span className="font-normal text-mute">· {money(p.price)}</span></p>
                <p className="text-sm text-mute">{[...p.sizes].sort(bySize).map((s) => `${s.size}: ${s.stock}`).join('  ') || 'No sizes'}</p>
              </div>
              <span className={`border-2 border-ink px-2 py-0.5 text-sm font-bold ${p.published ? 'bg-signal' : 'bg-white text-mute'}`}>{p.published ? 'Published' : 'Draft'}</span>
              <button onClick={() => toggle(p)} className="border-2 border-ink px-3 py-1.5 text-sm font-bold hover:bg-ink hover:text-signal">{p.published ? 'Unpublish' : 'Publish'}</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
