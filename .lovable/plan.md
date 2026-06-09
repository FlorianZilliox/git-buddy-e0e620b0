## Plan : rendre le bloc « Aucune donnée » cliquable (ReviewPage)

### Objectif
Quand aucune donnée n'est chargée sur la page Review, le bloc « Aucune donnée » doit devenir un lien cliquable redirigeant vers `/admin` pour éviter une dead end.

### Changements

**Fichier : `src/pages/ReviewPage.tsx`**

Dans le `return` de l'empty state (`if (!csvLoaded || !sprintMetrics)`), transformer le bloc statique en un lien cliquable vers la page Admin :

```text
Avant :
  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
    <span className="material-symbols-outlined text-5xl text-ink-mute mb-4">upload_file</span>
    <h2 className="h-section mb-2">Aucune donnée</h2>
    <p className="dek">Importez vos CSV depuis la page Préparation.</p>
  </div>

Après :
  <Link to="/admin" className="...">
    <span className="material-symbols-outlined text-5xl text-ink-mute mb-4">upload_file</span>
    <h2 className="h-section mb-2">Aucune donnée</h2>
    <p className="dek">Importez vos CSV depuis la page Préparation.</p>
  </Link>
```

- Importer `Link` depuis `react-router-dom`.
- Conserver le style visuel actuel (icône, titre, sous-titre).
- Le lien doit être perceptible comme cliquable (curseur + optionnel feedback hover).

### Vérification
- Build OK.
- En preview, sur `/review` sans données chargées, le bloc « Aucune donnée » redirige vers `/admin` au clic.