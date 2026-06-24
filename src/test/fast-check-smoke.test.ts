import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

describe('fast-check smoke test', () => {
  it('verifies fast-check library is properly configured', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        expect(a + b).toBe(b + a)
      })
    )
  })
})
