import express from "express"
import path from "node:path"
import { fileURLToPath } from "node:url"
import authRoutes from "../routes/auth.routes.js"
import cookieParser from "cookie-parser"
import productRoutes from "../routes/products.routes.js"
import cartRoutes from "../routes/cart.routes.js"


const app = express()

app.use(express.json())
app.use(cookieParser())


app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)


// Serve the built React app (client/dist) from this same server.
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../client/dist")
app.use(express.static(dist))
app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next()
    res.sendFile(path.join(dist, "index.html"))
})

export default app