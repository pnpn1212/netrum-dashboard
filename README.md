# 🚀 Netrum Node Public Endpoints Dashboard

A unified, rate-limit-safe dashboard for monitoring Netrum nodes using public APIs.

## ✨ Features

- Real-time monitoring of Netrum Lite Nodes
- Active nodes overview across the network
- Detailed node metrics & mining status
- Live mining log tracking
- Token claim status visibility
- Rate-limit safe API handling (30s rule)
- Modern Web3 UI with glassmorphism & dark theme
- Responsive layout (desktop & mobile)

## 🧩 Implemented Public Endpoints

### Lite Node Server
- `/lite/nodes/stats`
- `/lite/nodes/active`
- `/lite/nodes/id/{node_id}`

### Registration
- `/register/status`

### Task Provider
- `/polling/node-stats/{node_id}`

### Metrics & Sync
- `/metrics/requirements`
- `/metrics/check-cooldown/{node_id}`
- `/metrics/node-status/{node_id}`

### Mining
- `/mining/status/{node_id}`
- `/mining/cooldown/{node_id}`

### Live Mining Log
- `/live-log/status/{node_address}`

### Claim Tokens
- `/claim/status/{node_address}`
- `/claim/history/{node_address}`

## 🛡 Rate Limit Protection

- Each endpoint is called no more than once every 30 seconds
- No automatic polling
- Safe error handling without application crashes
- Guarded inputs to prevent unnecessary requests

## 🛠 Tech Stack

- React + Vite
- TailwindCSS
- Public Netrum APIs

## 🚀 Run Locally

```bash
npm install
npm run dev
