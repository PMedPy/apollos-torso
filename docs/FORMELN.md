# ApollosTorso — Formeln

Alle Formeln der App mit Lesehilfe. Die Nummern (A.1, A.2, …) werden in Lastenheft, Code und Tests verwendet.

**Regel (NF-06):** Jede Formel hat eine Funktion in `src/lib/` und Unit-Tests. Neue oder geänderte Formeln werden zuerst hier eingetragen.

| Formel | Funktion | Status |
|---|---|---|
| A.1 Geschätztes 1RM | `estimate1RM` in `src/lib/formulas.ts` | umgesetzt (P0) |
| A.2 Nötige Wiederholungen | `repsToBeat` in `src/lib/formulas.ts` | umgesetzt (P0) |
| A.3 Effektive Last | `effectiveLoad` in `src/lib/formulas.ts` | umgesetzt (P0) |
| A.4 Aktueller Bestwert | – | P2 |
| A.5 Volumen | – | P2 |
| A.6 Ermüdungsfaktor | – | P3 |
| A.7 Schätzung a, b | – | P5 |
| A.8 Live-Ziel | – | P5 |
| A.9 Isometrisch | – | P2 |
| A.10 Deload | – | P2 |
| A.11 Top-Übungsmetrik | – | P3 |
| A.12 Sätze pro Muskelgruppe | – | P3 |
| A.13 Markov-Empfehlung | – | P5 |
| A.14 Fokus-Bonus | – | P5 |

Parameter, die als **Platzhalter** markiert sind, werden später anhand eigener Daten oder Literatur festgelegt. Ihre aktuellen Werte stehen in `src/lib/defaults.ts`.

### A.1 Geschätztes 1RM (Epley)

$$\widehat{1RM} = L \cdot \left(1 + \frac{r}{30}\right)$$

```latex
\widehat{1RM} = L \cdot \left(1 + \frac{r}{30}\right)
```

*So liest du das:* L ist die (effektive) Last, r die Wiederholungen. Jede Wiederholung über die erste hinaus ist so viel wert wie rund 3,3 % mehr Gewicht. Gewicht und Wiederholungen werden in **eine** Stärkezahl übersetzt.

### A.2 Nötige Wiederholungen für den Bestwert

$$r_{\text{nötig}} = 30 \cdot \left(\frac{\widehat{1RM}_{\text{best}}}{L} - 1\right)$$

```latex
r_{\text{nötig}} = 30 \cdot \left(\frac{\widehat{1RM}_{\text{best}}}{L} - 1\right)
```

*So liest du das:* A.1 nach r umgestellt. Der Bruch fragt, wie viel schwerer der Bestwert ist als die aufgelegte Last, und rechnet diesen Überschuss in Wiederholungen um. Angezeigt wird die nächste ganze Zahl, die den Bestwert übertrifft.

### A.3 Effektive Last

$$L_{\text{eff}} = f \cdot m_{\text{KG}} + m_{\text{Zusatz}}$$

```latex
L_{\text{eff}} = f \cdot m_{\text{KG}} + m_{\text{Zusatz}}
```

*So liest du das:* Anteil f des Körpergewichts, den man bei der Übung tatsächlich bewegt, plus Zusatzgewicht. Bei Gewichtsübungen ist f = 0, die Last ist dann nur das Gewicht. m_KG ist das Körpergewicht am Tag des Trainings (KG-03).

### A.4 Aktueller Bestwert mit zeitlichem Zerfall

$$\text{Best}_{\text{aktuell}} = \max_i \; \widehat{1RM}_i \cdot e^{-\Delta t_i / \tau}$$

```latex
\text{Best}_{\text{aktuell}} = \max_i \; \widehat{1RM}_i \cdot e^{-\Delta t_i / \tau}
```

*So liest du das:* Für jeden früheren Satz i wird das 1RM umso stärker abgewertet, je länger er her ist (Δt). τ ist die „Vergessensgeschwindigkeit“: Nach der Zeit τ zählt ein Wert noch etwa 37 %. Das Maximum davon ist der aktuelle Bestwert. **τ: Platzhalter**, einstellbar.

### A.5 Volumen

$$V = \sum_{s} L_{\text{eff},s} \cdot r_s$$

```latex
V = \sum_{s} L_{\text{eff},s} \cdot r_s
```

*So liest du das:* Die Summe läuft über alle Sätze s (einer Übung, eines Trainings, einer Woche). Jeder Satz trägt Last mal Wiederholungen bei: die insgesamt bewegte „Arbeit“.

### A.6 Ermüdungsfaktor

$$F = \min\left(e^{\,a \cdot S_{\text{gesamt}} \;+\; b \cdot S_{\text{lokal}}},\; F_{\max}\right)$$

```latex
F = \min\left(e^{\,a \cdot S_{\text{gesamt}} \;+\; b \cdot S_{\text{lokal}}},\; F_{\max}\right)
```

$$\widehat{1RM}_{\text{frisch}} = \widehat{1RM}_{\text{gemessen}} \cdot F$$

```latex
\widehat{1RM}_{\text{frisch}} = \widehat{1RM}_{\text{gemessen}} \cdot F
```

*So liest du das:* S_gesamt zählt alle Sätze vorher im Training (systemische Ermüdung), S_lokal die Sätze vorher auf denselben Muskelgruppen, gewichtet mit 1 (Haupt-Tag) bzw. 0,5 (Neben-Tag). Die Exponentialfunktion sorgt dafür, dass sich beide Effekte **multiplizieren**. Am Trainingsanfang ist S = 0, also F = 1. F_max begrenzt den Bonus. **a, b: Platzhalter** (klein, bis zur Schätzung in P5), **F_max: Platzhalter** (z.B. 1,15).

### A.7 Schätzung von a und b

$$\ln\frac{\widehat{1RM}_{\text{gemessen}}}{\widehat{1RM}_{\text{frisch}}} = -\left(a \cdot S_{\text{gesamt}} + b \cdot S_{\text{lokal}}\right)$$

```latex
\ln\frac{\widehat{1RM}_{\text{gemessen}}}{\widehat{1RM}_{\text{frisch}}} = -\left(a \cdot S_{\text{gesamt}} + b \cdot S_{\text{lokal}}\right)
```

*So liest du das:* Der Logarithmus macht aus dem Produkt in A.6 eine Summe, dadurch wird die Schätzung zu einer linearen Regression. Links steht, um wie viel Prozent (ungefähr) man schwächer war als frisch, rechts, wie viel davon die Vorbelastung erklärt. Als „frischer“ Referenzwert dient der aktuelle Bestwert der Übung. Voraussetzung ist Variation: Steht eine Übung immer an erster Stelle, lässt sich ihr Ermüdungseffekt nicht schätzen. a und b werden gemeinsam über alle Übungen geschätzt.

### A.8 Live-Ziel im Training

$$\text{Ziel}_{\text{jetzt}} = \frac{\text{Best}_{\text{frisch}}}{F_{\text{jetzt}}}$$

```latex
\text{Ziel}_{\text{jetzt}} = \frac{\text{Best}_{\text{frisch}}}{F_{\text{jetzt}}}
```

*So liest du das:* Die Umkehrung von A.6. Gespeichert und verglichen wird auf der frischen Skala, angezeigt auf der jetzigen. Nach sechs Sätzen Rücken verlangt die App für den Bizeps-Bestwert realistisch weniger. Aus dem Ziel werden die nötigen Wiederholungen nach A.2 berechnet.

### A.9 Isometrische Übungen (Vorschlag)

$$t_{\text{nötig}} = t_{\text{best}}\big|_{L \ge L_{\text{eff}}}$$

```latex
t_{\text{nötig}} = t_{\text{best}}\big|_{L \ge L_{\text{eff}}}
```

*So liest du das:* Ziel ist die längste bisherige Haltezeit unter mindestens derselben Last. Der senkrechte Strich heißt „unter der Bedingung“. Noch offen, ob es zusätzlich eine kombinierte Kennzahl aus Last und Zeit geben soll.

### A.10 Deload

$$\text{Ziel}_{\text{Deload}} = d \cdot \text{Ziel}, \quad d \in [0, 1]$$

```latex
\text{Ziel}_{\text{Deload}} = d \cdot \text{Ziel}, \quad d \in [0, 1]
```

*So liest du das:* d = 0,85 heißt „85 % des Ziels“, nicht „15 % weniger als …“ in einer anderen Bezugsgröße. **d: Platzhalter**, einstellbar.

### A.11 Top-Übungsmetrik

$$\Delta\% = \frac{x_{\text{heute}} - \bar{x}_{3}}{\bar{x}_{3}} \cdot 100, \qquad \bar{x}_3 = \frac{1}{3}\sum_{j=1}^{3} x_j$$

```latex
\Delta\% = \frac{x_{\text{heute}} - \bar{x}_{3}}{\bar{x}_{3}} \cdot 100, \qquad \bar{x}_3 = \frac{1}{3}\sum_{j=1}^{3} x_j
```

*So liest du das:* x ist der beste ermüdungsbereinigte 1RM-Wert einer Übung in einem Training. x̄₃ ist der Durchschnitt (Summe geteilt durch Anzahl) der letzten drei Trainings mit dieser Übung. Δ% ist die relative Abweichung: positiv = Pfeil hoch.

### A.12 Sätze pro Muskelgruppe pro Woche

$$S_m = \sum_{s \,\in\, \text{Woche}} w_{s,m}, \qquad w_{s,m} = \begin{cases} 1 & m \text{ ist Haupt-Tag} \\ 0{,}5 & m \text{ ist Neben-Tag} \\ 0 & \text{sonst} \end{cases}$$

```latex
S_m = \sum_{s \,\in\, \text{Woche}} w_{s,m}, \qquad w_{s,m} = \begin{cases} 1 & m \text{ ist Haupt-Tag} \\ 0{,}5 & m \text{ ist Neben-Tag} \\ 0 & \text{sonst} \end{cases}
```

*So liest du das:* Jeder Satz der Woche „spendet“ jeder Muskelgruppe m einen Punkt, einen halben oder nichts, je nachdem, wie stark seine Übung diese Gruppe trifft. Die Summe ist das Wochenvolumen der Gruppe in Sätzen.

### A.13 Markov-Empfehlung

$$z_j = \ln\left(n_{i \to j} + 1\right), \qquad p_j = \frac{e^{z_j / T}}{\sum_k e^{z_k / T}}$$

```latex
z_j = \ln\left(n_{i \to j} + 1\right), \qquad p_j = \frac{e^{z_j / T}}{\sum_k e^{z_k / T}}
```

*So liest du das:* n(i→j) zählt, wie oft Übung j bisher direkt auf die aktuelle Übung i folgte. Das +1 ist Glättung, damit nie gesehene Übergänge nicht unmöglich werden. Der Softmax macht aus den Logits Wahrscheinlichkeiten: Die Exponentialfunktion macht alles positiv, die Division durch die Summe normiert auf 1. Die Temperatur T regelt den Mut: Kleines T wählt fast immer das Häufigste, großes T streut. Templates aus den letzten 10 Trainings (TP-03) entstehen, indem man wiederholt die wahrscheinlichste nächste Übung nimmt. **T: Platzhalter.**

### A.14 Fokus-Bonus

$$z'_j = z_j + g(k) \cdot \left(\beta_M \cdot m_j + \beta_T \cdot t_j\right), \qquad g(k) = e^{-(k-1)/\kappa}$$

```latex
z'_j = z_j + g(k) \cdot \left(\beta_M \cdot m_j + \beta_T \cdot t_j\right), \qquad g(k) = e^{-(k-1)/\kappa}
```

*So liest du das:* Zum Markov-Logit kommt ein Bonus. m_j sagt, wie gut Übung j die Fokus-Muskelgruppen trifft (1 / 0,5 / 0), t_j ist 1, wenn die Übungsart passt. β_M und β_T sind die Stärken. g(k) fällt mit der Position k im Training: an erster Stelle voller Bonus, danach weniger, κ bestimmt wie schnell. Ein Plus im Logit ist nach dem Softmax ein **Mal** bei der Wahrscheinlichkeit, denn e^(z+β) = e^z · e^β. Bei β = ln 2 verdoppelt sich die Chance. **β_M, β_T, κ: Platzhalter.**
