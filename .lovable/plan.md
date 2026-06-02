# Cadrage — Toggle SP / Tickets sur § 01 Engagement et livraison

## 1. Ancrage

- **Produit** : dashboard Sprint Review, page Review, section § 01 « Story points — Engagement et livraison ».
- **Composant impacté** : `src/components/kpi/SpCompletionBlock.tsx`, alimenté par `sprintMetrics.storyPoints` calculé dans `src/services/dataTransformerV2.js` → `transformStoryPointsV2()`.
- **Point d'insertion** : un toggle Tickets / SP au-dessus (ou en `actions` du `section__head`) du bloc, sur le même modèle visuel que le toggle déjà présent sur le graphe Throughput § 03 (classes `.toggle` + `aria-pressed`).
- **Déjà réutilisable** : pattern de toggle existant, `throughput.values` (tickets fermés par sprint), historique sprints, Monte Carlo capable de calculer un P50 throughput (déjà utilisé pour SP).
- **Manque dans le code aujourd'hui** : pas d'équivalent « tickets engagés » ni d'ajouts mid-sprint comptés en tickets dans `sprintMetrics`. Il faut les exposer.

## 2. Problème & JTBD

En tant que facilitateur de Sprint Review, je veux **lire la même vue « engagé → livré » en SP ou en tickets**, pour comparer les deux lectures sur une équipe qui utilise (ou pas) les Story Points, sans changer le reste de la page.

## 3. Scope / Hors-scope

**Dans le scope**
- Toggle Tickets / SP sur le bloc § 01 uniquement.
- Adapter `SpCompletionBlock` pour afficher des valeurs Tickets *ou* SP selon le mode.
- Exposer les métriques « tickets engagés / livrés / mid-sprint / moyenne précédente / vélocité recommandée » dans `transformStoryPointsV2` (ou un service jumeau).
- Comportement : si le sprint courant n'a aucun SP, le toggle démarre en mode Tickets ; sinon il démarre en mode SP. Les deux options restent visibles et cliquables tant que les données du mode ciblé existent.

**Hors scope (à confirmer)**
- Toggle § 03 Throughput chart : on n'y touche pas.
- Pages Forecast, Shared, HowMany : aucune modification.
- Persistance du choix Tickets/SP entre sessions.
- Nouveaux graphes ou nouvelles cartes au-delà du bloc actuel.

## 4. Règles métier

- **RG-01** : « Tickets engagés » du sprint courant = nombre de tickets dont le sprint de fermeture (ou le dernier sprint de la liste pour les non-fermés) = sprint sélectionné. Même périmètre qu'aujourd'hui pour le calcul SP committed (mêmes exclusions de statuts : `Backlog`, `A affiner`, `A cadrer`).
- **RG-02** : « Tickets livrés » = tickets engagés ET terminés (status match `termin|done|fini|résolu|closed`). Cohérent avec `throughput.currentValue`.
- **RG-03** : « Mid-sprint tickets » = `midSprintAdditions.length` du sprint courant. « Mid-sprint livrés » = ceux avec `isFinished = true`.
- **RG-04** : « Engagement initial tickets » = engagés − mid-sprint tickets ; « initial livrés » = livrés − mid-sprint livrés. Même formule que SP.
- **RG-05** : Complétion (%) = livrés / engagés × 100, arrondi entier. Si engagés = 0 → 0 %.
- **RG-06** : « Moyenne sprints précédents » en tickets = moyenne des `throughput.values` des sprints précédents non vides (même filtre que SP : `committed > 0` transposé en `engaged > 0`).
- **RG-07** : « Vélocité recommandée tickets » = P50 Monte Carlo throughput si dispo (≥ 2 sprints), sinon fallback moyenne arrondie.
- **RG-08** : Mode par défaut = `SP` si `currentCommitted > 0`, sinon `Tickets`. Si aucun des deux n'a de données → empty state actuel inchangé.

## 5. Critères d'acceptation

**AC-01 — Affichage du toggle**
- [ ] *Given* sprint chargé *When* je vois § 01 *Then* un toggle Tickets / SP est visible, avec `aria-pressed` cohérent.
- [ ] *Given* sprint sans SP *When* la page s'ouvre *Then* le toggle est positionné sur Tickets par défaut.
- [ ] *Given* sprint avec SP *When* la page s'ouvre *Then* le toggle est positionné sur SP par défaut.

**AC-02 — Bascule des chiffres**
- [ ] *Given* toggle = Tickets *When* je regarde le bloc *Then* hero, barre, 2 cartes (Engagement initial, Complétion totale), ligne moyenne et ligne vélocité affichent des nombres de tickets, sans unité « sp ».
- [ ] *Given* toggle = SP *When* je regarde le bloc *Then* comportement actuel strictement inchangé (régression zéro).

**AC-03 — Cohérence des données tickets**
- [ ] La valeur « livrés » en mode Tickets du sprint courant = `throughput.currentValue`.
- [ ] La carte « Engagement initial » exclut bien les mid-sprint tickets.
- [ ] La moyenne précédente en tickets = moyenne arithmétique des `throughput.values` des sprints précédents non vides.

**AC-04 — Empty state**
- [ ] *Given* ni SP ni tickets engagés *Then* le bloc § 01 ne s'affiche pas (comportement actuel `{storyPoints && …}` étendu).

## 6. Plan technique

**Fichiers touchés**
- `src/services/dataTransformerV2.js` → enrichir `transformStoryPointsV2` (ou ajouter `transformCompletionV2`) pour renvoyer aussi un bloc `tickets: { currentCommitted, currentDelivered, currentCompletion, initialCommitted, initialDelivered, initialCompletion, midSprintCount, midSprintDeliveredCount, avgDelivered, avgCompletion, previousSprintsCount, recommendedVelocity }`. ⚠️ **Décision proposée par cohérence avec l'existant** : on garde un seul objet `storyPoints` retourné, on lui ajoute une sous-clé `tickets`. *Dette signalée* : la clé s'appellera toujours `storyPoints` côté store alors qu'elle contiendra aussi des tickets — renommer plus tard si on factorise.
- `src/components/kpi/SpCompletionBlock.tsx` → ajout d'une prop `mode: 'sp' | 'tickets'` et d'un second jeu de props (ou un objet `metrics` discriminé). Les libellés « sp » deviennent dynamiques (`sp` / `tickets`). **Reco** : passer un seul objet `metrics` au lieu de doubler 10 props — plus propre, casse l'API actuelle (acceptable, un seul call-site).
- `src/pages/ReviewPage.tsx` → un `useState<'sp' | 'tickets'>` initialisé selon RG-08, le toggle dans `actions` du `section__head`, et choix du jeu de métriques passé à `SpCompletionBlock`.

**Ce qu'on ne touche pas**
- `throughput`, `cycleTime`, `bugs`, les KPI § 02, les graphes § 03, le toggle existant § 03.

**ADR léger** : nouveau toggle = même classes CSS `.toggle` que § 03 (pas de nouveau composant générique pour l'instant — si un 3ᵉ usage apparaît, on factorisera).

## 7. Hypothèses & risques

Hypothèses que je prends, **corrige-moi maintenant sinon j'avance dessus** :
1. **H-01** : « Tickets engagés » = tous les tickets rattachés au sprint courant après exclusion des statuts `Backlog/A affiner/A cadrer` — c'est la même base que le calcul SP committed actuel. Si tu voulais exclure les bugs (comme pour le cycle time moyen), dis-le.
2. **H-02** : Le toggle ne persiste pas entre sessions (pas de localStorage).
3. **H-03** : Mode par défaut = SP si dispo, sinon Tickets (RG-08). Alternative possible : toujours démarrer en SP, masquer/disable le bouton SP si vide — j'ai écarté car moins lisible.
4. **H-04** : Hors-scope confirmé : § 03 et autres pages intactes.

**Risques**
- Confusion utilisateur entre le toggle § 01 et celui du graphe § 03 → atténuer par un libellé clair (« Mesurer en : Tickets / SP ») au-dessus du toggle, à valider à l'implémentation.
- Si le throughput service exclut déjà certains tickets différemment du SP committed, les chiffres pourront ne pas matcher exactement `throughput.currentValue` → à vérifier au moment du build (test sur un CSV réel).

---

Quand tu valides ce cadrage, colle-le dans le **Project Knowledge** (section « Formalisation de la fonctionnalité en cours ») avant de lancer le build. C'est lui qui deviendra la source de vérité du développement.

*Used the spec-driven skill.*
