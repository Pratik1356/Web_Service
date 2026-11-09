# Snitch client

React 19 · Vite · Tailwind v4 · Redux Toolkit · React Router

```bash
# terminal 1
cd server && npm install && npm run dev      # API on :3000
# terminal 2
cd client && npm install && npm run dev      # app on :5173
```

Vite proxies `/api` to `localhost:3000`, so no CORS changes are needed.
To use the seller pages, set `role: "seller"` on a user in MongoDB, then sign in again.
