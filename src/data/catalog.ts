import type { ExerciseKind, MuscleGroup } from '../db/model'

/**
 * Übungskatalog (UE-05). Wird beim Anlegen einer Übung als Vorschlag angeboten.
 *
 * Die Faktoren f (Anteil des Körpergewichts, Formel A.3) sind VORLÄUFIG.
 * Sie werden erst ab Phase 2 für Berechnungen genutzt und bis dahin mit
 * Quellen belegt (UE-06). Die Sätze speichern nur Rohdaten, daher kann f
 * später ohne Datenverlust korrigiert werden.
 */
export interface CatalogEntry {
  id: string
  name: { de: string; en: string }
  /** weitere Schreibweisen und Synonyme, sprachunabhängig durchsucht */
  aliases: string[]
  kind: ExerciseKind
  bodyweight: boolean
  /** vorläufig, siehe oben; 0 bei Gewichtsübungen */
  f: number
  primary: MuscleGroup[]
  secondary: MuscleGroup[]
}

type Row = [
  id: string,
  de: string,
  en: string,
  aliases: string,
  kind: 'd' | 'i',
  f: number,
  primary: string,
  secondary: string,
]

// f > 0 bedeutet Körpergewichtsübung.
const ROWS: Row[] = [
  // ── Drücken ────────────────────────────────────────────────
  ['bench-press', 'Bankdrücken', 'Bench press', 'flachbank, langhantel bankdrücken, bench, bankdrucken', 'd', 0, 'chest', 'triceps shoulders'],
  ['incline-bench-press', 'Schrägbankdrücken', 'Incline bench press', 'schrägbank, incline bench, schragbank', 'd', 0, 'chest', 'shoulders triceps'],
  ['dumbbell-bench-press', 'Kurzhantel-Bankdrücken', 'Dumbbell bench press', 'kh bankdrücken, db bench, kurzhantel drücken', 'd', 0, 'chest', 'triceps shoulders'],
  ['chest-press-machine', 'Brustpresse (Maschine)', 'Chest press machine', 'brustpresse, chest press, maschine brust', 'd', 0, 'chest', 'triceps shoulders'],
  ['chest-fly', 'Butterfly', 'Chest fly', 'fliegende, flys, flyes, pec deck, butterfly maschine, kabelzug fly', 'd', 0, 'chest', 'shoulders'],
  ['push-up', 'Liegestütze', 'Push-up', 'pushups, push ups, liegestütz, liegestuetze, pushup', 'd', 0.64, 'chest', 'triceps shoulders abs'],
  ['knee-push-up', 'Knie-Liegestütze', 'Knee push-up', 'knie liegestütz, knee pushups, frauenliegestütze', 'd', 0.49, 'chest', 'triceps shoulders'],
  ['dips', 'Dips', 'Dips', 'barrendips, parallel dips, dip, barren', 'd', 0.95, 'chest', 'triceps shoulders'],
  ['ring-dips', 'Ringdips', 'Ring dips', 'ring dips, ringe dips, turnringe', 'd', 0.95, 'chest', 'triceps shoulders'],
  ['overhead-press', 'Schulterdrücken', 'Overhead press', 'military press, ohp, schulterpresse, frontdrücken, langhantel schulterdrücken', 'd', 0, 'shoulders', 'triceps'],
  ['dumbbell-shoulder-press', 'Kurzhantel-Schulterdrücken', 'Dumbbell shoulder press', 'kh schulterdrücken, arnold press, db shoulder press', 'd', 0, 'shoulders', 'triceps'],
  ['lateral-raise', 'Seitheben', 'Lateral raise', 'seitliches heben, side raise, lateral raises, seitheben kurzhantel', 'd', 0, 'shoulders', ''],
  ['reverse-fly', 'Reverse Butterfly', 'Reverse fly', 'reverse flys, vorgebeugtes seitheben, rear delt fly, face pull', 'd', 0, 'shoulders', 'back'],
  ['pike-push-up', 'Pike-Liegestütze', 'Pike push-up', 'pike pushups, pike push ups', 'd', 0.7, 'shoulders', 'triceps'],
  ['triceps-pushdown', 'Trizepsdrücken am Kabel', 'Triceps pushdown', 'pushdown, kabel trizeps, trizeps kabelzug, rope pushdown', 'd', 0, 'triceps', ''],
  ['skull-crusher', 'French Press', 'Skull crusher', 'stirndrücken, skullcrusher, lying triceps extension', 'd', 0, 'triceps', ''],
  ['overhead-triceps-extension', 'Trizepsstrecken über Kopf', 'Overhead triceps extension', 'überkopf trizeps, triceps extension', 'd', 0, 'triceps', ''],
  ['bench-dips', 'Bankdips', 'Bench dips', 'dips an der bank, bench dip', 'd', 0.5, 'triceps', 'chest shoulders'],

  // ── Ziehen ─────────────────────────────────────────────────
  ['pull-up', 'Klimmzüge', 'Pull-up', 'pullups, pull ups, klimmzug, klimmzuege, obergriff klimmzüge', 'd', 1.0, 'back', 'biceps forearms'],
  ['chin-up', 'Chin-ups', 'Chin-up', 'untergriff klimmzüge, chinups, chin ups', 'd', 1.0, 'back', 'biceps forearms'],
  ['lat-pulldown', 'Latziehen', 'Lat pulldown', 'latzug, lat pull, latissimus ziehen, pulldown', 'd', 0, 'back', 'biceps'],
  ['barbell-row', 'Langhantelrudern', 'Barbell row', 'rudern vorgebeugt, bent over row, lh rudern', 'd', 0, 'back', 'biceps lowerBack'],
  ['dumbbell-row', 'Kurzhantelrudern', 'Dumbbell row', 'einarmiges rudern, kh rudern, one arm row', 'd', 0, 'back', 'biceps'],
  ['seated-cable-row', 'Rudern am Kabel', 'Seated cable row', 'kabelrudern, cable row, rudermaschine, low row', 'd', 0, 'back', 'biceps'],
  ['inverted-row', 'Australian Pull-ups', 'Inverted row', 'umgekehrtes rudern, ring rows, ringrudern, australian pullups', 'd', 0.6, 'back', 'biceps'],
  ['biceps-curl', 'Bizepscurls', 'Biceps curl', 'curls, bizeps curl, kurzhantel curls, langhantel curls, bicep curl', 'd', 0, 'biceps', 'forearms'],
  ['hammer-curl', 'Hammercurls', 'Hammer curl', 'hammer curls, neutralgriff curls', 'd', 0, 'biceps', 'forearms'],
  ['cable-curl', 'Bizepscurls am Kabel', 'Cable curl', 'kabel curls, kabelzug bizeps', 'd', 0, 'biceps', 'forearms'],
  ['farmers-walk', 'Farmer’s Walk', 'Farmer’s walk', 'farmers walk, farmer walk, bauerngang', 'd', 0, 'forearms', 'back abs'],
  ['dead-hang', 'Hängen an der Stange', 'Dead hang', 'dead hang, hängen, passive hang', 'i', 1.0, 'forearms', 'back'],
  ['shrugs', 'Shrugs', 'Shrugs', 'schulterheben, shrug, nackenheben', 'd', 0, 'back', 'forearms'],

  // ── Rumpf ──────────────────────────────────────────────────
  ['plank', 'Unterarmstütz', 'Plank', 'plank, planke, brett', 'i', 0.65, 'abs', 'shoulders'],
  ['side-plank', 'Seitstütz', 'Side plank', 'side plank, seitlicher unterarmstütz', 'i', 0.65, 'abs', 'shoulders'],
  ['crunch', 'Crunches', 'Crunch', 'crunches, bauchpresse, situps, sit ups', 'd', 0.3, 'abs', ''],
  ['hanging-leg-raise', 'Beinheben hängend', 'Hanging leg raise', 'hanging leg raises, beinheben an der stange, knee raises', 'd', 0.35, 'abs', 'forearms'],
  ['ab-wheel', 'Ab Wheel', 'Ab wheel rollout', 'bauchroller, ab roller, rollout', 'd', 0.6, 'abs', 'shoulders lowerBack'],
  ['cable-crunch', 'Crunches am Kabel', 'Cable crunch', 'kabel crunch, kabelzug bauch', 'd', 0, 'abs', ''],
  ['russian-twist', 'Russian Twist', 'Russian twist', 'russian twists, rumpfdrehen', 'd', 0.3, 'abs', ''],
  ['back-extension', 'Hyperextensions', 'Back extension', 'hyperextension, rückenstrecker, rumpfheben, back extensions', 'd', 0.5, 'lowerBack', 'glutes hamstrings'],

  // ── Beine ──────────────────────────────────────────────────
  ['squat', 'Kniebeugen', 'Back squat', 'squat, squats, langhantel kniebeuge, kniebeuge, back squat', 'd', 0, 'quads', 'glutes lowerBack'],
  ['bodyweight-squat', 'Kniebeugen ohne Gewicht', 'Bodyweight squat', 'air squat, kniebeuge ohne gewicht, freie kniebeuge', 'd', 0.75, 'quads', 'glutes'],
  ['front-squat', 'Frontkniebeugen', 'Front squat', 'front squats, frontkniebeuge', 'd', 0, 'quads', 'glutes abs'],
  ['goblet-squat', 'Goblet Squats', 'Goblet squat', 'goblet, kurzhantel kniebeuge', 'd', 0, 'quads', 'glutes'],
  ['leg-press', 'Beinpresse', 'Leg press', 'leg press, beinpresse maschine', 'd', 0, 'quads', 'glutes'],
  ['leg-extension', 'Beinstrecker', 'Leg extension', 'beinstrecken, leg extensions, quadrizeps maschine', 'd', 0, 'quads', ''],
  ['lunge', 'Ausfallschritte', 'Lunge', 'lunges, ausfallschritt, walking lunges', 'd', 0.75, 'quads', 'glutes hamstrings'],
  ['bulgarian-split-squat', 'Bulgarian Split Squats', 'Bulgarian split squat', 'split squat, bulgarische kniebeuge', 'd', 0.8, 'quads', 'glutes'],
  ['deadlift', 'Kreuzheben', 'Deadlift', 'deadlifts, kreuzhebe, kreuz heben', 'd', 0, 'hamstrings', 'glutes lowerBack back forearms'],
  ['romanian-deadlift', 'Rumänisches Kreuzheben', 'Romanian deadlift', 'rdl, romanian deadlift, gestrecktes kreuzheben', 'd', 0, 'hamstrings', 'glutes lowerBack'],
  ['leg-curl', 'Beinbeuger', 'Leg curl', 'beincurls, leg curls, beinbeuger maschine', 'd', 0, 'hamstrings', ''],
  ['hip-thrust', 'Hip Thrusts', 'Hip thrust', 'hip thrust, hüftstoßen, glute bridge, beckenheben', 'd', 0, 'glutes', 'hamstrings'],
  ['calf-raise', 'Wadenheben', 'Calf raise', 'calf raises, wadenheben stehend, waden', 'd', 1.0, 'calves', ''],
  ['wall-sit', 'Wandsitzen', 'Wall sit', 'wall sit, stuhl an der wand', 'i', 0.75, 'quads', 'glutes'],
]

const split = (s: string) => s.split(' ').filter(Boolean) as MuscleGroup[]

export const CATALOG: CatalogEntry[] = ROWS.map(([id, de, en, aliases, kind, f, primary, secondary]) => ({
  id,
  name: { de, en },
  aliases: aliases
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean),
  kind: kind === 'd' ? 'dynamic' : 'isometric',
  bodyweight: f > 0,
  f,
  primary: split(primary),
  secondary: split(secondary),
}))

export const CATALOG_BY_ID = new Map(CATALOG.map((e) => [e.id, e]))
