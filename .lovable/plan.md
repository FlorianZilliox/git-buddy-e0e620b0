# Harmoniser l'empty state Review ↔ Forecast

## Constat

Quand aucune donnée CSV n'est chargée, les deux pages affichent un message différent :

- **Forecast** : layout centré épuré avec icône Material Symbols `upload_file`, titre `h-section` « Aucune donnée », sous-texte `dek` « Importez vos CSV depuis la page Admin. »
- **Review** : bloc `empty-state` avec emoji 📊, titre « Pas encore de données », texte « Commencez par charger vos fichiers CSV. » et un bouton « Aller à la préparation ».

## Changement

Remplacer l'empty state de `src/pages/ReviewPage.tsx` (lignes 46-59) par exactement le même bloc que `ForecastPage.tsx` (lignes 36-44) :

```tsx
if (!csvLoaded || !sprintMetrics) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <span className="material-symbols-outlined text-5xl text-ink-mute mb-4">upload_file</span>
      <h2 className="h-section mb-2">Aucune donnée</h2>
      <p className="dek">Importez vos CSV depuis la page Admin.</p>
    </div>
  )
}
```

Le bouton « Aller à la préparation » et le `useNavigate` deviennent inutiles dans ce cas — on les retire de l'empty state (le `useNavigate` reste importé seulement s'il est utilisé ailleurs ; ici il ne l'est pas, donc on supprime aussi l'import et l'appel `useNavigate()`).

## Hors scope

- Aucune modification de Forecast (la page de référence).
- Aucun changement sur le rendu quand les données sont chargées.
