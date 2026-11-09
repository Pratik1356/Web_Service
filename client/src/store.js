import { configureStore, createSlice, createAction, isAnyOf } from '@reduxjs/toolkit'
import { api, setToken, thunk } from './api'

export const signedOut = createAction('signedOut')

/* ---------- auth ---------- */
const roleOf = (t) => {
  try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role }
  catch { return 'user' }
}
// The API returns the role only inside the JWT, so read it from there.
const start = ({ data }) => {
  setToken(data.accessToken)
  localStorage.removeItem('snitch:out')
  return { ...data.user, role: roleOf(data.accessToken) }
}

export const restore = thunk('auth/restore', async () => {
  if (localStorage.getItem('snitch:out')) throw new Error('signed out')
  return start(await api('/auth/refresh', { method: 'POST' }))
})
export const login = thunk('auth/login', async (body) => start(await api('/auth/login', { method: 'POST', body })))
export const register = thunk('auth/register', async (body) => start(await api('/auth/register', { method: 'POST', body })))

// The API has no logout route, so signing out only forgets the session locally.
export const logout = () => (dispatch) => {
  setToken(null)
  localStorage.setItem('snitch:out', '1')
  dispatch(signedOut())
}

const auth = createSlice({
  name: 'auth',
  initialState: { user: null, status: 'loading', error: null },
  reducers: { clearError: (s) => { s.error = null } },
  extraReducers: (b) => {
    b.addCase(restore.fulfilled, (s, a) => { s.user = a.payload; s.status = 'ready' })
      .addCase(restore.rejected, (s) => { s.status = 'ready' })
      .addCase(signedOut, () => ({ user: null, status: 'ready', error: null }))
      .addMatcher(isAnyOf(login.pending, register.pending), (s) => { s.error = null })
      .addMatcher(isAnyOf(login.fulfilled, register.fulfilled), (s, a) => { s.user = a.payload })
      .addMatcher(isAnyOf(login.rejected, register.rejected), (s, a) => { s.error = a.payload })
  },
})
export const { clearError } = auth.actions

/* ---------- products ---------- */
export const fetchProducts = thunk('products/fetch', async (asSeller) =>
  (await api(asSeller ? '/products/seller' : '/products')).data.products)
export const createProduct = thunk('products/create', async (form) =>
  (await api('/products', { method: 'POST', form })).data.product)
export const setPublished = thunk('products/publish', async ({ id, published }) => {
  await api(`/products/${published ? 'list' : 'unlist'}/${id}`, { method: 'PATCH' })
  return { id, published }
})

const products = createSlice({
  name: 'products',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s) => { s.status = 'loading'; s.error = null })
      .addCase(fetchProducts.fulfilled, (s, a) => { s.items = a.payload; s.status = 'ready' })
      .addCase(fetchProducts.rejected, (s, a) => { s.status = 'ready'; s.error = a.payload?.message })
      .addCase(createProduct.fulfilled, (s, a) => { s.items.unshift(a.payload) })
      .addCase(setPublished.fulfilled, (s, { payload }) => {
        const p = s.items.find((x) => x._id === payload.id)
        if (p) p.published = payload.published
      })
      .addCase(signedOut, () => products.getInitialState())
  },
})

/* ---------- cart ---------- */
export const fetchCart = thunk('cart/fetch', async () => (await api('/cart')).data.cart.products)
export const addToCart = thunk('cart/add', async (body, { dispatch }) => {
  const r = await api('/cart', { method: 'POST', body })
  dispatch(fetchCart())
  return r.message
})

const cart = createSlice({
  name: 'cart',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCart.pending, (s) => { s.status = 'loading' })
      .addCase(fetchCart.fulfilled, (s, a) => { s.items = a.payload; s.status = 'ready' })
      .addCase(fetchCart.rejected, (s) => { s.status = 'ready' })
      .addCase(signedOut, () => cart.getInitialState())
  },
})

export default configureStore({ reducer: { auth: auth.reducer, products: products.reducer, cart: cart.reducer } })
