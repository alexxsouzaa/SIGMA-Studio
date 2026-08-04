import { afterEach, describe, expect, it, vi } from 'vitest'
import { exportCSV, exportJSON } from './export'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function mockBrowserDownload() {
  const click = vi.fn()
  vi.spyOn(document, 'createElement').mockImplementation(() => ({
    click,
    href: '',
    download: '',
  }) as unknown as HTMLAnchorElement)
  return click
}

describe('exportCSV', () => {
  it('gera CSV com BOM, cabeçalho e linhas', () => {
    const createObjectURL = vi.fn((_obj: Blob | MediaSource) => 'blob:test')
    URL.createObjectURL = createObjectURL as typeof URL.createObjectURL
    URL.revokeObjectURL = vi.fn()
    const click = mockBrowserDownload()

    exportCSV('relatorio.csv', ['Nome', 'Valor'], [['A', 1], ['B', 2]])

    const blob = createObjectURL.mock.calls[0][0] as Blob
    return blob.arrayBuffer().then((buf) => {
      const bytes = new Uint8Array(buf)
      expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xef, 0xbb, 0xbf])
      const csv = new TextDecoder('utf-8').decode(buf).replace('\ufeff', '')
      expect(csv).toContain('Nome,Valor')
      expect(csv).toContain('A,1')
      expect(csv).toContain('B,2')
      expect(click).toHaveBeenCalledTimes(1)
    })
  })

  it('faz escape de vírgulas, aspas e quebras de linha', () => {
    const createObjectURL = vi.fn((_obj: Blob | MediaSource) => 'blob:test')
    URL.createObjectURL = createObjectURL as typeof URL.createObjectURL
    URL.revokeObjectURL = vi.fn()
    mockBrowserDownload()

    exportCSV('esc.csv', ['Nome'], [[`Silva, "Jr"`]])

    const blob = createObjectURL.mock.calls[0][0] as Blob
    return blob.text().then((csv) => {
      expect(csv).toContain('"Silva, ""Jr"""')
    })
  })

  it('trata valores nulos como string vazia', () => {
    const createObjectURL = vi.fn((_obj: Blob | MediaSource) => 'blob:test')
    URL.createObjectURL = createObjectURL as typeof URL.createObjectURL
    URL.revokeObjectURL = vi.fn()
    mockBrowserDownload()

    exportCSV('nulos.csv', ['Nome', 'Valor'], [['A', null]])

    const blob = createObjectURL.mock.calls[0][0] as Blob
    return blob.text().then((csv) => {
      expect(csv).toContain('A,')
    })
  })
})

describe('exportJSON', () => {
  it('serializa dados com indentação', () => {
    const createObjectURL = vi.fn((_obj: Blob | MediaSource) => 'blob:test')
    URL.createObjectURL = createObjectURL as typeof URL.createObjectURL
    URL.revokeObjectURL = vi.fn()
    const click = mockBrowserDownload()

    exportJSON('dados.json', { a: 1 })

    const blob = createObjectURL.mock.calls[0][0] as Blob
    return blob.text().then((json) => {
      expect(json).toBe('{\n  "a": 1\n}')
      expect(click).toHaveBeenCalledTimes(1)
    })
  })
})
