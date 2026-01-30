# BellePoule Modern

🤺 **Logiciel moderne de gestion de compétitions d'escrime**

Réécriture complète et moderne du logiciel [BellePoule](http://betton.escrime.free.fr/) original créé par Yannick Le Roux. Cette version utilise des technologies web modernes tout en conservant toutes les fonctionnalités essentielles pour la gestion des tournois d'escrime.

![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

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

## 🚀 Installation

### Depuis les sources

```bash
# Cloner le dépôt
git clone https://github.com/klinnex/bellepoule-modern.git
cd bellepoule-modern

# Installer les dépendances
npm install

# Lancer en mode développement
npm start

# Construire pour production
npm run package
```

## 🛠️ Technologies

- **Electron** - Framework desktop cross-platform
- **React 19** - Interface utilisateur
- **TypeScript** - Typage statique
- **SQLite** (better-sqlite3) - Base de données embarquée portable
- **Webpack** - Bundler

## 📁 Structure du projet

```
bellepoule-modern/
├── src/
│   ├── main/           # Process principal Electron
│   ├── renderer/       # Interface React
│   ├── shared/         # Code partagé (types, utils)
│   └── database/       # Couche base de données
├── resources/          # Icônes et ressources
└── dist/              # Build de production
```

## 📄 Licence

Ce projet est sous licence **GPL-3.0**, la même licence que le BellePoule original.

## 🙏 Remerciements

- **Yannick Le Roux** - Créateur du BellePoule original
