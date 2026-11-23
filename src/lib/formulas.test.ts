import { describe, expect, it } from 'vitest'
import { effectiveLoad, estimate1RM, repsToBeat } from './formulas'

describe('A.1 estimate1RM (Epley)', () => {
  it('rechnet das Handbeispiel: 100 kg × 6 Wdh = 120 kg', () => {
    expect(estimate1RM(100, 6)).toBeCloseTo(120)
  })

  it('30 Wiederholungen verdoppeln die Last', () => {
    expect(estimate1RM(50, 30)).toBeCloseTo(100)
  })

  it('gibt 0 zurück, wenn keine Wiederholung oder keine Last vorliegt', () => {
    expect(estimate1RM(100, 0)).toBe(0)
    expect(estimate1RM(0, 10)).toBe(0)
  })
})

describe('A.2 repsToBeat', () => {
  it('ist die Umkehrung von A.1: Bestwert 120 bei 100 kg → 7 Wdh (6 wären nur Gleichstand)', () => {
    expect(repsToBeat(120, 100)).toBe(7)
  })

  it('rundet auf die nächste ganze Wiederholung, die übertrifft', () => {
    // 30 · (110/100 − 1) = 3 → exakt 3 ist Gleichstand, also 4
    expect(repsToBeat(110, 100)).toBe(4)
    // 30 · (112/100 − 1) = 3,6 → 4
    expect(repsToBeat(112, 100)).toBe(4)
  })

  it('ergibt mindestens 1, auch wenn die Last schon über dem Bestwert liegt', () => {
    expect(repsToBeat(100, 120)).toBe(1)
  })

  it('ohne Bestwert genügt 1 Wiederholung', () => {
    expect(repsToBeat(0, 80)).toBe(1)
  })

  it('das Ergebnis schlägt den Bestwert tatsächlich', () => {
    const best = 97.3
    const load = 72.5
    const r = repsToBeat(best, load)
    expect(estimate1RM(load, r)).toBeGreaterThan(best)
    expect(estimate1RM(load, r - 1)).toBeLessThanOrEqual(best)
  })
})

describe('A.3 effectiveLoad', () => {
  it('Dips (f ≈ 1) mit 80 kg Körpergewicht und 10 kg Gürtel → 90 kg', () => {
    expect(effectiveLoad(1, 80, 10)).toBe(90)
  })

  it('Gewichtsübung (f = 0) → nur das Gewicht', () => {
    expect(effectiveLoad(0, 80, 60)).toBe(60)
  })

  it('Teilanteil des Körpergewichts ohne Zusatz', () => {
    expect(effectiveLoad(0.5, 80, 0)).toBe(40)
  })
})
