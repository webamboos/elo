import React from 'react'
import ReactDOM from 'react-dom/client'

import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import './index.css'

import { RouterProvider } from '@tanstack/router'
import { router } from './routes.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
