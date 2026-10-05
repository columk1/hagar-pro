export type Locale = 'en' | 'fr'

export const localeFromLang = (lang?: string | null): Locale =>
  lang?.toLowerCase().startsWith('fr') ? 'fr' : 'en'

/** Client-side counterpart for links; server-rendered links use astro:i18n. */
export const localizePath = (locale: Locale, path = ''): string => {
  const clean = path.replace(/^\/+/, '').replace(/^fr(?:\/|$)/, '')
  return `/${locale === 'fr' ? 'fr/' : ''}${clean}`
}

const french = {
  Curriculum: 'Programme',
  '1. Introduction': '1. Introduction',
  '2. Air Regulations': '2. Réglementation aérienne',
  '3. VNC Charts': '3. Cartes VNC',
  '4. Canadian Airspace & Airspace Regulations': '4. Espace aérien canadien et réglementation',
  '5. Flight Operations': '5. Exploitation aérienne',
  '6. Human Factors': '6. Facteurs humains',
  '7. Practice Exam': '7. Examen pratique',
  'Section progress overview': 'Aperçu de la progression par section',
  'Lesson Progress': 'Progression de la leçon',
  Completed: 'Terminée',
  'Not completed': 'Non terminée',
  'Lesson Completed': 'Leçon terminée',
  'Mark Complete': 'Marquer comme terminée',
  'Support on Ko-fi': 'Soutenir le projet sur Ko-fi',
  'Resume Progress': 'Reprendre la progression',
  'Completed lessons:': 'Leçons terminées :',
  'Copy Link': 'Copier le lien',
  Copied: 'Copié',
  'Copy failed': 'Échec de la copie',
  'Syncing Progress': 'Synchronisation de la progression',
  'Applying progress data...': 'Importation de la progression…',
  'If this page does not redirect automatically, go to':
    'Si cette page ne vous redirige pas automatiquement, consultez le',
  'Imported one completed lesson. Redirecting...': 'Une leçon terminée importée. Redirection…',
  'Imported {count} completed lessons. Redirecting...':
    '{count} leçons terminées importées. Redirection…',
  'Unable to import progress data from this link.':
    'Impossible d’importer la progression à partir de ce lien.',
  'No sync data found in this URL.': 'Ce lien ne contient aucune donnée de progression.',
  'Check Answers': 'Vérifier les réponses',
  Reset: 'Réinitialiser',
  Submit: 'Soumettre',
  'Score:': 'Note :',
  Question: 'Question',
  'No answer selected. Correct answer: {answer}.':
    'Aucune réponse sélectionnée. Bonne réponse : {answer}.',
  'Correct.': 'Bonne réponse.',
  'Incorrect. Correct answer:': 'Mauvaise réponse. Bonne réponse :',
  'Ready to Begin?': 'Prêt à commencer?',
  'When you click': 'Lorsque vous cliquez sur',
  'Start Exam': 'Commencer l’examen',
  ', the system will dynamically generate your randomized 40-question practice test with a balanced spread across all subjects.':
    ', le système génère un examen pratique aléatoire de 40 questions réparties de façon équilibrée entre les sujets.',
  'Before you start:': 'Avant de commencer :',
  'Find a quiet space where you can focus without interruptions.':
    'Installez-vous dans un endroit calme où vous pourrez vous concentrer sans interruption.',
  'Have your map and navigation tools ready.': 'Préparez votre carte et vos outils de navigation.',
  'Set a timer for': 'Réglez une minuterie à',
  '2.5 hours': '2 h 30',
  'right when you click start to practice your official pacing.':
    'au moment de commencer pour vous exercer à respecter le temps prévu à l’examen officiel.',
  'Exam in progress. You have': 'Examen en cours. Vous disposez de',
  'to answer all questions.': 'pour répondre à toutes les questions.',
  'Map reading': 'Lecture de carte',
  'Map plotting {count}': 'Travail sur carte {count}',
  'Map Work': 'Travail sur carte',
  'Vancouver VNC reference map': 'Carte VNC de Vancouver de référence',
  'Result:': 'Résultat :',
  Pass: 'Réussite',
  Fail: 'Échec',
  'Class A': 'Classe A',
  'Class B': 'Classe B',
  'Class C': 'Classe C',
  'Class D': 'Classe D',
  'Class E': 'Classe E',
  'Class F (CYR / Special-use)': 'Classe F (CYR / usage spécial)',
  'Class G': 'Classe G',
  Class: 'Classe',
  'VFR flight is not permitted.': 'Le vol VFR est interdit.',
  'IFR only.': 'Vol IFR uniquement.',
  'HG/PG operations are not permitted in Class A.':
    'Le vol en deltaplane ou en parapente est interdit en classe A.',
  'VFR entry requires ATC clearance.': 'Une autorisation ATC est requise pour entrer en VFR.',
  'ATC clearance and required equipment are mandatory before any authorized entry.':
    'L’autorisation ATC et l’équipement requis sont obligatoires avant toute entrée autorisée.',
  'Flight visibility: 3 SM.': 'Visibilité en vol : 3 SM.',
  'Cloud clearance: 500 ft vertical and 1 SM horizontal.':
    'Distance des nuages : 500 pi verticalement et 1 SM horizontalement.',
  'Two-way radio and ATC clearance required before entry.':
    'Radio émetteur-récepteur et autorisation ATC requises avant d’entrer.',
  'Maintain visual reference to ground/water.':
    'Gardez des repères visuels à la surface (sol ou eau).',
  'Can be denied entry.': 'L’entrée peut être refusée.',
  'Establish two-way communications before entry.':
    'Établissez une communication bilatérale avant d’entrer.',
  'Comply with tower instructions.': 'Respectez les instructions de la tour.',
  "Can't be denied entry if requirements are met.":
    'L’entrée ne peut pas être refusée si les exigences sont respectées.',
  'No ATC clearance required for VFR transit.':
    'Aucune autorisation ATC requise pour transiter en VFR.',
  'Remain outside controlled areas unless entry requirements are met.':
    'Restez à l’extérieur des zones contrôlées si vous ne respectez pas les conditions d’entrée.',
  'Requirements depend on the CYR type and published restrictions.':
    'Les exigences dépendent du type de CYR et des restrictions publiées.',
  'Entry may be prohibited or require prior authorization.':
    'L’entrée peut être interdite ou nécessiter une autorisation préalable.',
  'Check NOTAMs/CFS and chart notes before flight.':
    'Consultez les NOTAM, le CFS et les notes de la carte avant le vol.',
  "Can't enter an active CYR without authorization":
    'L’entrée dans une CYR active est interdite sans autorisation.',
  'Can enter an active CYA with caution.':
    'L’entrée dans une CYA active est permise avec prudence.',
  'Above 1,000 ft AGL: 1 SM visibility, 500 ft vertical and 2,000 ft horizontal from cloud.':
    'Au-dessus de 1 000 pi AGL : visibilité de 1 SM, distance des nuages de 500 pi verticalement et de 2 000 pi horizontalement.',
  'At or below 1,000 ft AGL (day): 2 SM visibility, clear of cloud.':
    'À 1 000 pi AGL ou moins (jour) : visibilité de 2 SM, hors des nuages.',
  'Uncontrolled airspace: no ATC clearance required.':
    'Espace aérien non contrôlé : aucune autorisation ATC requise.',
  'Maintain visual reference to ground/water and avoid restricted/prohibited areas.':
    'Gardez des repères visuels à la surface et évitez les zones réglementées ou interdites.',
  'Canadian domestic airspace model': 'Modèle de l’espace aérien intérieur canadien',
  'Aerodromes and Air Navigation (AARN) Airspace Model':
    'Modèle d’espace aérien — Aérodromes et navigation aérienne (AARN)',
  'Use the class buttons below to view VFR minima and HG/PG-focused operating requirements.':
    'Sélectionnez une classe ci-dessous pour consulter les minimums VFR et les exigences applicables au deltaplane et au parapente.',
  'Static airspace chart image': 'Illustration de l’espace aérien',
  'Layered Class A B C D E F and G domestic airspace diagram':
    'Schéma des couches de l’espace aérien intérieur des classes A, B, C, D, E, F et G',
  'Select airspace class details': 'Sélectionner une classe d’espace aérien',
  'Selected airspace requirements': 'Exigences de la classe sélectionnée',
  'VFR minima': 'Minimums VFR',
  'HG / PG pilot requirements': 'Exigences pour les pilotes de deltaplane et de parapente',
  'True Heading (TH)': 'Cap vrai (CV)',
  'Magnetic Heading (MH)': 'Cap magnétique (CM)',
  MH: 'CM',
  TH: 'CV',
  'MH = TH - Variation': 'CM = CV − Déclinaison',
  'MH = TH + Variation': 'CM = CV + Déclinaison',
  'TH = MH + Variation': 'CV = CM + Déclinaison',
  'TH = MH - Variation': 'CV = CM − Déclinaison',
  'Magnetic Variation Tool': 'Outil de déclinaison magnétique',
  'Heading conversion controls': 'Commandes de conversion du cap',
  Conversion: 'Conversion',
  'Conversion direction': 'Sens de la conversion',
  'True to Magnetic': 'Vrai vers magnétique',
  'Magnetic to True': 'Magnétique vers vrai',
  'Magnetic variation': 'Déclinaison magnétique',
  'Variation direction': 'Sens de la déclinaison',
  West: 'Ouest',
  East: 'Est',
  'Variation in degrees': 'Déclinaison en degrés',
  'Enter 0 to 359 degrees.': 'Entrez une valeur de 0 à 359 degrés.',
  Result: 'Résultat',
  'True north and magnetic north diagram': 'Schéma du nord vrai et du nord magnétique',
  'Compass showing true north and magnetic north offset':
    'Compas illustrant l’écart entre le nord vrai et le nord magnétique',
  'Magnetic North (': 'Nord magnétique (',
  'True Heading (': 'Cap vrai (',
  'Magnetic Heading (': 'Cap magnétique (',
  'Flight note:': 'Remarque en vol :',
  'A compass is most reliable in steady, level flight. Turns and acceleration can cause errors.':
    'Un compas est plus fiable en vol rectiligne et en palier. Les virages et les accélérations peuvent entraîner des erreurs.',
  '&copy; OpenStreetMap contributors &copy; CARTO':
    '&copy; Contributeurs OpenStreetMap &copy; CARTO',
  'Leaflet failed to load. Ensure the package is installed and reload.':
    'Impossible de charger la carte. Rechargez la page.',
  'Move your cursor over the chart to inspect coordinates.':
    'Déplacez le curseur sur la carte pour consulter les coordonnées.',
  'VNC chart viewer': 'Visionneuse de carte VNC',
  'VNC Chart Viewer + Virtual Plotter': 'Carte VNC et rapporteur virtuel',
  'Click Point A, then Point B to draw a route and measure its distance. A third click resets the route with a new Point A.':
    'Cliquez sur le point A, puis sur le point B pour tracer une route et mesurer sa distance. Un troisième clic crée un nouveau point A et réinitialise la route.',
  'Coordinate finder': 'Repérage des coordonnées',
  Plotter: 'Rapporteur',
  'True Track:': 'Route vraie :',
  '| Magnetic Track (': '| Route magnétique (',
  '| Distance:': '| Distance :',
  'Set two points to calculate true track and distance.':
    'Placez deux points pour calculer la route vraie et la distance.',
  'Clear Plotter': 'Effacer le tracé',
  'A JavaScript library for interactive maps': 'Bibliothèque JavaScript de cartes interactives',
  'Zoom in': 'Zoom avant',
  'Zoom out': 'Zoom arrière',
  deg: '°',
  NM: 'NM',
  Untitled: 'Sans titre',
} satisfies Record<string, string>

export type UiKey = keyof typeof french

/** Missing French strings fail visibly during development/build instead of silently leaking English. */
export const ui =
  (locale: Locale) =>
  (text: UiKey, values: Record<string, string | number> = {}): string => {
    const translated = locale === 'fr' ? french[text] : text
    if (translated === undefined) throw new Error(`Missing French UI translation: ${text}`)
    return translated.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match))
  }
