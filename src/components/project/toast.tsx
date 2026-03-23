// src/components/project/toast.tsx
'use client'

let toastTimeout: ReturnType<typeof setTimeout> | null = null

export function showToast(msg: string, type: 'success' | 'error' = 'error') {
  let el = document.getElementById('global-toast')
  if (!el) {
    el = document.createElement('div')
    el.id = 'global-toast'
    el.style.display = 'none'
    document.body.appendChild(el)
  }
  el.textContent = msg
  el.className = `fixed top-5 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-xl shadow-2xl text-sm font-bold text-center transition-all duration-300 ${
    type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
  }`
  el.style.display = 'block'
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => { if (el) el.style.display = 'none' }, 4000)
}