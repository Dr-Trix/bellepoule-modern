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
| **Windows** | `BellePoule Modern-1.0.0-portable.exe` | Version portable, pas d'installation requise |
| **macOS** | `BellePoule Modern-1.0.0.dmg` | Glisser dans Applications |
| **Linux** | `BellePoule Modern-1.0.0.AppImage` | Rendre exécutable avec `chmod +x` |

> 💡 Les exécutables sont automatiquement mis à jour à chaque modification du code.

## ✨ Fonctionnalités

### Gestion des tireurs
- ✅ Inscription et enregistrement des tireurs
- ✅ Import de fichiers FFE (.fff) et classements
- ✅ Pointage (appel) des tireurs
- ✅ Gestion des statuts (présent, absent, forfait, exclu)

### Phase de poules
- ✅ Génération automatique des poules
- ✅ Répartition en serpentine par classement
- ✅ Séparation automatique par club/ligue/nation
- ✅ Ordre des matchs selon les règles FIE
- ✅ Calcul automatique V/M, indice, TD, TR
- ✅ Classement selon les règles FIE officielles

### Phase de tableau
- ✅ Génération du tableau à élimination directe
- ✅ Placement par tête de série (seeding FIE)
- ✅ Gestion des exempts (byes)
- ✅ Propagation automatique des gagnants

### Autres fonctionnalités
- ✅ Multi-plateformes (Windows, macOS, Linux)
- ✅ Base de données portable (SQLite)
- ✅ Export XML compatible BellePoule classic
- ✅ Interface en français

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
- ✅ Builder pour Windows, macOS et Linux en parallèle
- ✅ Publier les exécutables dans [GitHub Releases](https://github.com/klinnex/bellepoule-modern/releases/tag/latest)

## 📄 Licence

Ce projet est sous licence **GPL-3.0**, la même licence que le BellePoule original.

## 🙏 Remerciements

- **Yannick Le Roux** - Créateur du BellePoule original
- **Communauté escrime** - Pour les retours et suggestions
