import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearError, login, register } from '../store'
import { btnCls, inputCls } from '../ui'

export default function Auth({ mode }) {
  const isReg = mode === 'register'
  const d = useDispatch()
  const { user, error } = useSelector((s) => s.auth)
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'user' })
  const [busy, setBusy] = useState(false)
  useEffect(() => { d(clearError()) }, [mode, d])

  if (user) return <Navigate to="/" replace />

  const fieldErr = (p) => error?.errors?.find((e) => e.path === p)?.msg
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    await d(isReg ? register(f) : login({ email: f.email, password: f.password }))
    setBusy(false)
  }
  const field = (name, label, type = 'text') => (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      <input type={type} required value={f[name]} onChange={(e) => setF({ ...f, [name]: e.target.value })} className={inputCls}
        autoComplete={name === 'password' ? (isReg ? 'new-password' : 'current-password') : name} />
      {fieldErr(name) && <span className="mt-1 block text-sm text-alarm">{fieldErr(name)}</span>}
    </label>
  )

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="flex flex-col justify-between bg-signal p-8 md:p-12">
        <h1 className="display text-6xl sm:text-8xl">Snitch</h1>
        <p className="mt-16 max-w-xs text-lg font-medium">Streetwear in sizes XS to XXL. Sign in to browse the drop and fill your cart.</p>
      </section>
      <section className="flex items-center p-8 md:p-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <h2 className="display text-4xl">{isReg ? 'Create account' : 'Sign in'}</h2>
          {isReg && field('name', 'Name')}
          {isReg && (
            <fieldset>
              <legend className="mb-1 text-sm font-bold">I want to</legend>
              <div className="flex gap-2">
                {[['user', 'Buy'], ['seller', 'Sell']].map(([v, l]) => (
                  <label key={v} className={`flex-1 cursor-pointer border-2 border-ink px-3 py-2 text-center font-bold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 ${f.role === v ? 'bg-ink text-signal' : 'bg-white'}`}>
                    <input type="radio" name="role" value={v} checked={f.role === v} onChange={() => setF({ ...f, role: v })} className="sr-only" />{l}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {field('email', 'Email', 'email')}
          {field('password', 'Password', 'password')}
          {error && !error.errors?.length && <p role="alert" className="border-2 border-alarm bg-white p-3 text-sm text-alarm">{error.message}</p>}
          <button disabled={busy} className={`${btnCls} w-full`}>{busy ? 'Please wait…' : isReg ? 'Create account' : 'Sign in'}</button>
          <p className="text-sm">
            {isReg ? 'Already have an account? ' : 'New here? '}
            <Link to={isReg ? '/login' : '/register'} className="font-bold underline">{isReg ? 'Sign in' : 'Create an account'}</Link>
          </p>
        </form>
      </section>
    </div>
  )
}
