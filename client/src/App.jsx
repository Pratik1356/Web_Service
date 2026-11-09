import { useEffect } from 'react'
import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCart, logout, restore } from './store'
import Auth from './pages/Auth'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Sell from './pages/Sell'

function Layout() {
  const d = useDispatch()
  const { user, status } = useSelector((s) => s.auth)
  const count = useSelector((s) => s.cart.items.reduce((n, i) => n + i.quantity, 0))
  useEffect(() => { if (user) d(fetchCart()) }, [user, d])

  if (status === 'loading') return <p className="p-8 font-bold">Loading…</p>
  if (!user) return <Navigate to="/login" replace />

  const link = ({ isActive }) => `px-2 py-1 font-bold ${isActive ? 'bg-ink text-signal' : 'hover:underline'}`
  return (
    <>
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-b-2 border-ink bg-signal px-4 py-3 sm:px-8">
        <NavLink to="/" className="display text-3xl">Snitch</NavLink>
        <nav className="flex flex-1 items-center gap-2">
          <NavLink to="/" end className={link}>Shop</NavLink>
          <NavLink to="/cart" className={link}>Cart ({count})</NavLink>
          {user.role === 'seller' && <NavLink to="/sell" className={link}>Sell</NavLink>}
        </nav>
        <span className="hidden text-sm sm:block">{user.name}</span>
        <button onClick={() => d(logout())} className="border-2 border-ink px-3 py-1 text-sm font-bold hover:bg-ink hover:text-signal">Sign out</button>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8"><Outlet /></main>
    </>
  )
}

export default function App() {
  const d = useDispatch()
  useEffect(() => { d(restore()) }, [d])
  return (
    <Routes>
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route element={<Layout />}>
        <Route index element={<Shop />} />
        <Route path="product/:id" element={<Product />} />
        <Route path="cart" element={<Cart />} />
        <Route path="sell" element={<Sell />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
