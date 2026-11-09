import { createAsyncThunk } from '@reduxjs/toolkit'

// Access token lives in memory only; the refresh token is an httpOnly cookie.
let token = null
export const setToken = (t) => { token = t }

export async function api(path, { method = 'GET', body, form } = {}, retry = true) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const res = await fetch(`/api${path}`, {
    method, headers, credentials: 'include',
    body: form ?? (body ? JSON.stringify(body) : undefined),
  })

  // Access token expired (15 min) -> rotate with the refresh cookie and retry once.
  if (res.status === 401 && retry && path !== '/auth/refresh') {
    const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    if (r.ok) {
      token = (await r.json()).data.accessToken
      return api(path, { method, body, form }, false)
    }
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw Object.assign(new Error(data.message || `Request failed (${res.status})`), { errors: data.errors })
  }
  return data
}

// createAsyncThunk wrapper that keeps the backend's `errors` array on failure.
export const thunk = (type, fn) =>
  createAsyncThunk(type, async (arg, tapi) => {
    try { return await fn(arg, tapi) }
    catch (e) { return tapi.rejectWithValue({ message: e.message, errors: e.errors }) }
  })
