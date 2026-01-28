import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'livepriceofgold-ph-proxy',
      configureServer(server) {
        server.middlewares.use('/api/livepriceofgold/philippines-gold', async (_req, res) => {
          try {
            const sourceUrl = 'https://www.livepriceofgold.com/philippines-gold-price-per-gram.html'
            const upstream = await fetch(sourceUrl, {
              headers: {
                // Some sites block empty UA; keep it simple.
                'User-Agent': 'Mozilla/5.0 (Vite Dev Server) GoldCalculator/1.0',
                Accept: 'text/html',
              },
            })

            if (!upstream.ok) {
              res.statusCode = 502
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ error: `Upstream error: ${upstream.status}`, sourceUrl }))
              return
            }

            const html = await upstream.text()

            const extractRate = (label) => {
              const idx = html.indexOf(label)
              if (idx === -1) return null
              const slice = html.slice(idx, idx + 600)
              const match = slice.match(/([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?)/)
              if (!match) return null
              return Number(match[1].replace(/,/g, ''))
            }

            const rates = {
              gold: {
                '24': extractRate('24K Gram'),
                '22': extractRate('22K Gram'),
                '18': extractRate('18K Gram'),
              },
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            // Light caching to avoid hammering upstream during dev.
            res.setHeader('Cache-Control', 'no-store')
            res.end(
              JSON.stringify({
                sourceUrl,
                fetchedAt: new Date().toISOString(),
                rates,
              }),
            )
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      },
    },
  ],
})
