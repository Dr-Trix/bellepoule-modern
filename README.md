# BellePoule Modern

🤺 **Logiciel moderne de gestion de compétitions d'escrime**

Réécriture complète et moderne du logiciel [BellePoule](http://betton.escrime.free.fr/) original créé par Yannick Le Roux. Cette version utilise des technologies web modernes tout en conservant toutes les fonctionnalités essentielles pour la gestion des tournois d'escrime.

![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Build](https://github.com/klinnex/bellepoule-modern/actions/workflows/build.yml/badge.svg)

## 📥 Téléchargement

**➡️ [Télécharger la dernière version](https://github.com/klinnex/bellepoule-modern/releases/tag/latest)**

| Plateforme | Fichier | Notes |
|------------|---------|-------|
| **Windows** | `BellePoule.Modern-X.X.X-build.XX-portable.exe` | Version portable, pas d'installation requise |
| **macOS** | `BellePoule.Modern-X.X.X-build.XX.dmg` | Glisser dans Applications |
| **Linux** | `BellePoule.Modern-X.X.X-build.XX.AppImage` | Rendre exécutable avec `chmod +x` |

> 💡 Les exécutables sont automatiquement mis à jour à chaque modification du code. Le numéro de build est incrémenté automatiquement.

## ✨ Fonctionnalités

### Gestion des tireurs
- ✅ Inscription et enregistrement des tireurs
- ✅ Import de fichiers FFE (.fff, .csv) et XML BellePoule
- ✅ Import de classements FFE
- ✅ Pointage (appel) des tireurs
- ✅ Gestion des statuts (présent, absent, forfait, abandon, exclu)
- ✅ Modification des fiches tireurs (nom, club, classement, etc.)

### Phase de poules
- ✅ Génération automatique des poules
- ✅ Répartition en serpentine par classement
- ✅ Séparation automatique par club/ligue/nation
- ✅ Ordre des matchs selon les règles FIE
- ✅ Calcul automatique V/M, indice, TD, TR
- ✅ Classement selon les règles FIE officielles
- ✅ **Vue "Matches"** : Liste ordonnée des matchs évitant qu'un tireur combatte deux fois d'affilée
- ✅ **Changement de poule** : Déplacer un tireur vers une autre poule
- ✅ **Tours multiples** : 1, 2 ou 3 tours de poules configurables

### Phase de tableau
- ✅ Génération du tableau à élimination directe
- ✅ Placement par tête de série (seeding FIE)
- ✅ Gestion des exempts (byes)
- ✅ Propagation automatique des gagnants
- ✅ **Optionnel** : Possibilité de désactiver l'élimination directe

### Paramètres de compétition
- ✅ **Tours de poules** : 1 à 3 tours avant le tableau
- ✅ **Élimination directe** : Activée ou désactivée
- ✅ **Score max poules** : 3, 4, 5 ou 10 touches
- ✅ **Score max tableau** : 5, 10 ou 15 touches

### Armes supportées
- ⚔️ **Épée**
- 🤺 **Fleuret** 
- ⚔️ **Sabre**
- 🔴 **Sabre Laser** - Support des matchs nuls avec attribution de victoire

### Autres fonctionnalités
- ✅ Multi-plateformes (Windows, macOS, Linux)
- ✅ Base de données portable (SQLite)
- ✅ **Autosave** : Sauvegarde automatique toutes les 2 minutes
- ✅ **Sauvegarde à la fermeture** : Protection contre les pertes de données
- ✅ Export XML compatible BellePoule classic
- ✅ Interface en français
- ✅ **Version visible** : Menu Aide > À propos
- ✅ **Signaler un bug** : Menu Aide > Signaler un bug (Ctrl+Shift+I)
- ✅ **Mises à jour automatiques** : Notification au démarrage si nouvelle version disponible

## ⚙️ Paramètres de compétition

Pour configurer la formule de votre compétition :

1. Ouvrez une compétition
2. Cliquez sur **⚙️ Propriétés** (en haut à droite)
3. Dans la section **"Formule de compétition"** :

| Paramètre | Options | Description |
|-----------|---------|-------------|
| **Tours de poules** | 1, 2 ou 3 | Nombre de phases de poules avant le tableau |
| **Élimination directe** | Activée / Désactivée | Si désactivée, le classement final est basé uniquement sur les poules |
| **Score max poules** | 3, 4, 5 ou 10 | Touches pour gagner un match de poule |
| **Score max tableau** | 5, 10 ou 15 | Touches pour gagner un match de tableau |

### Exemple de formules

| Formule | Tours | Élim. directe | Usage typique |
|---------|-------|---------------|---------------|
| Standard FIE | 1 | ✅ Oui | Compétitions officielles |
| 2 tours + tableau | 2 | ✅ Oui | Grands effectifs |
| Poules uniquement | 1-3 | ❌ Non | Entraînements, petits effectifs |

## 🐛 Signaler un bug / Suggestion

Pour signaler un bug ou proposer une amélioration :

1. Dans l'application : **Menu Aide > 📝 Signaler un bug / Suggestion** (ou `Ctrl+Shift+I`)
2. Sélectionnez le type : 🐛 Bug ou ✨ Suggestion
3. Décrivez le problème ou votre idée
4. Cliquez sur **"Créer sur GitHub"**

Les informations suivantes sont automatiquement incluses :
- Version et numéro de build
- Système d'exploitation
- Date et heure

> 💡 Vous aurez besoin d'un compte GitHub pour soumettre l'issue.

## 🚀 Développement

### Prérequis
- Node.js 20+
- npm 9+

### Installation depuis les sources

```bash
# Cloner le dépôt
git clone https://github.com/klinnex/bellepoule-modern.git
cd bellepoule-modern

# Installer les dépendances
npm install

# Lancer en mode développement
npm start

# Construire les exécutables localement
npm run package
```

### Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Lance l'application en mode développement |
| `npm run build` | Compile TypeScript et bundle React |
| `npm run package` | Crée les exécutables pour la plateforme courante |

## 🛠️ Technologies

- **Electron 40** - Framework desktop cross-platform
- **React 19** - Interface utilisateur
- **TypeScript 5** - Typage statique
- **sql.js** - SQLite en JavaScript pur (pas de compilation native)
- **Webpack 5** - Bundler
- **GitHub Actions** - CI/CD automatique

## 📁 Structure du projet

```
bellepoule-modern/
├── src/
│   ├── main/           # Process principal Electron
│   │   ├── main.ts     # Point d'entrée, menus, IPC handlers
│   │   └── preload.ts  # Bridge sécurisé renderer <-> main
│   ├── renderer/       # Interface React
│   │   ├── App.tsx     # Composant principal
│   │   ├── components/ # Composants React (FencerList, PoolView, etc.)
│   │   └── styles/     # CSS
│   ├── shared/         # Code partagé
│   │   ├── types/      # Types TypeScript
│   │   └── utils/      # Calculs poules, tableaux, règles FIE
│   └── database/       # Couche base de données SQLite
├── .github/
│   └── workflows/      # GitHub Actions (build automatique)
├── package.json
├── tsconfig.json
└── webpack.renderer.config.js
```

## 🔄 CI/CD

Le projet utilise GitHub Actions pour :
- ✅ Compiler automatiquement à chaque push
- ✅ Incrémenter automatiquement le numéro de build
- ✅ Builder pour Windows, macOS et Linux en parallèle
- ✅ Publier les exécutables dans [GitHub Releases](https://github.com/klinnex/bellepoule-modern/releases/tag/latest)

## 📄 Licence

Ce projet est sous licence **GPL-3.0**, la même licence que le BellePoule original.

## 🙏 Remerciements

- **Yannick Le Roux** - Créateur du BellePoule original
- **Communauté escrime** - Pour les retours et suggestions
