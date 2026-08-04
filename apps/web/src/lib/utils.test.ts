import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('une classes truthy com espaço', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('ignora valores falsos', () => {
    expect(cn('a', false, 'b', null, undefined, 'c')).toBe('a b c')
  })

  it('retorna string vazia sem argumentos válidos', () => {
    expect(cn(false, null, undefined)).toBe('')
  })
})
