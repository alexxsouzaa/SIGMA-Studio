export function exportCSV(filename: string, headers: string[], rows: (string | number | null)[][]) {
  const esc = (v: string | number | null) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportPDF(title: string, bodyHTML: string) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, 'Segoe UI', system-ui, sans-serif; padding: 32px; color: #18181b; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .meta { font-size: 12px; color: #71717a; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #71717a; padding: 8px 10px; border-bottom: 1px solid #e4e4e7; }
    td { padding: 8px 10px; border-bottom: 1px solid #f4f4f5; color: #18181b; }
    .footer { margin-top: 24px; font-size: 11px; color: #a1a1aa; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">Gerado em ${new Date().toLocaleString('pt-BR')}</div>
  ${bodyHTML}
  <div class="footer">SIGMA Studio</div>
</body>
</html>`)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 300)
}
