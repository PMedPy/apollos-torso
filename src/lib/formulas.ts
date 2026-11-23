/**
 * Formeln aus docs/FORMELN.md (Lastenheft, Anhang A).
 *
 * Jede Funktion trägt die Nummer ihrer Formel. Jede Formel hat Tests in
 * formulas.test.ts (NF-06). Die übrigen Formeln kommen in den Phasen dazu,
 * in denen sie gebraucht werden.
 */

/**
 * A.1 – Geschätztes 1RM nach Epley: L · (1 + r/30)
 *
 * Bei r = 1 ist das Ergebnis etwas größer als L (Eigenheit der Formel).
 * r = 0 bedeutet „kein gültiger Satz“ und ergibt 0.
 */
export function estimate1RM(load: number, reps: number): number {
  if (reps <= 0 || load <= 0) return 0
  return load * (1 + reps / 30)
}

/**
 * A.2 – Nötige Wiederholungen, um den Bestwert bei Last L zu übertreffen.
 *
 * Gibt die kleinste ganze Zahl r zurück, für die estimate1RM(L, r) > best gilt.
 * Ohne Bestwert (best ≤ 0) genügt 1 Wiederholung.
 */
export function repsToBeat(best1RM: number, load: number): number {
  if (load <= 0) return Number.POSITIVE_INFINITY
  if (best1RM <= 0) return 1
  const exact = 30 * (best1RM / load - 1)
  // „übertreffen“ heißt echt größer: bei exakt ganzzahligem Ergebnis +1.
  // Das kleine Epsilon fängt Rundungsfehler ab (z.B. 5.9999999 statt 6).
  const reps = Math.floor(exact + 1e-9) + 1
  return Math.max(1, reps)
}

/**
 * A.3 – Effektive Last: f · m_KG + m_Zusatz
 *
 * Bei Gewichtsübungen ist f = 0, die Last ist dann nur das Gewicht.
 */
export function effectiveLoad(
  bodyweightFactor: number,
  bodyWeightKg: number,
  addedWeightKg: number,
): number {
  return bodyweightFactor * bodyWeightKg + addedWeightKg
}
