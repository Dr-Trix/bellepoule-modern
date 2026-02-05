# BellePoule Modern - Logiciel moderne de gestion de compétitions d'escrime

🤺 **Logiciel moderne de gestion de compétitions d'escrime** avec interface multilingue et temps réel

### 📚 **Documentation**
- 📖 **[Guide PDF Export Utilisateur](docs/USER_GUIDE_PDF_EXPORT.md)** - Guide complet d'utilisation
- 📋 **[Documentation Technique](docs/PDF_EXPORT_OPTIMIZATION.md)** - Architecture et optimisations
- 🏗️ **[Architecture Système](docs/PDF_EXPORT_ARCHITECTURE.md)** - Architecture détaillée
- 📖 **[API Reference](docs/API_REFERENCE.md)** - Référence de l'API (à créer)

### 🔧 **Installation**
- **Windows** : Exécutable portable (pas d'installation)
- **macOS** : Fichier DMG (glisser-déposer)
- **Linux** : AppImage universel (x64/ARM64)

### 🚀 [**Télécharger la dernière version**](https://github.com/klinnex/bellepoule-modern/releases/latest)

## 🆕 Nouveautés Récentes

### 📄 Export PDF Optimisé (Version 2.0)
- **⚡ Performance 60-70% améliorée** - Export PDF jusqu'à 3x plus rapide
- **🏗️ Architecture modulaire** - Code maintenable et évolutif
- **📋 Format professionnel** - Cadre "PISTE X" et matchs en colonnes
- **🔧 Gestion d'erreurs robuste** - Multiples fallbacks pour fiabilité maximale

### 🎯 Fonctionnalités PDF
- **Export individuel** : Poules avec cadre piste et 4 matchs maximum
- **Export multiple** : Toutes les poules dans un seul document unifié
- **Options avancées** : Filtrage des matchs, classements, personnalisations
- **Compatibilité totale** : A4 paysage optimisé pour l'escrime

## 🌐 Langues disponibles

- 🇫🇷 **Français** (par défaut)
- 🇺🇸 **Anglais** 
- 🇫🇷 **Breton**

## 🎯 Caractéristiques principales

- **🗂️ Base de données SQLite** pour stocker toutes les données de compétition
- **🌐 Interface moderne** avec design épuré et responsive
- **📱 Gestion en temps réel** des scores et arènes
- **🏊 Support multilingue** (français, anglais, breton)
- **📱 Mode déconnecté** pour les tablettes arbitres
- **⚡️ Sauvegarde automatique** des données
- **📊 Export des résultats** en multiple formats

## 🎯 Fonctionnalités principales

### 📋 **Appel (pointage)**
  - ✅ Inscription et gestion des tireurs
  - ✅ Pointage/dépointage
  - ✅ Support abandon et forfait avec impact automatique sur tous les matchs
  - ✅ Mise à jour automatique des classements

### 📄 **Export PDF Optimisé (Nouveauté !)**
  - ⚡ **Performance 60-70% améliorée** - Export PDF ultra-rapide
  - 🏗️ **Architecture modulaire** - Code maintenable et évolutif
  - 📋 **Format professionnel** - Cadre "PISTE X" et matchs en colonnes
  - 🔧 **Gestion d'erreurs robuste** - Fiabilité maximale avec fallbacks
  - 📊 **Monitoring performance** - Suivi des métriques en temps réel
  - 🎯 **Support complet** - Export simple et multiple de poules
  - 📚 **Documentation avancée** - Guides techniques et utilisateur complets

### 🚀 **Performance Optimizations (Nouveauté !)**
  - 🔧 **Memory Management** - Correction des fuites mémoire avec Promise.allSettled
  - ⚡ **React Performance** - Optimisation des re-renders et dépendances useMemo
  - 📊 **Algorithm Efficiency** - Calculs de classement optimisés avec Map et WeakMap
  - 🎨 **CSS Optimisé** - Variables CSS et classes utilitaires pour maintenabilité
  - 📈 **Batch Processing** - Traitement par lot des statistiques tireurs
  - 🛡️ **Error Handling** - Logging amélioré avec IDs spécifiques pour debug

### 🎯 **Poules**
  - ✅ Génération automatique des poules sérpentine
  - ✅ Configuration personnalisée (nombre de tireurs par poule, tours de poules)
  - ✅ Système de chronométrage des matchs
  - ✅ Support des défections (abandon, forfait, exclusion)
  - ✅ Vue en arborescence
  - 📄 **Intégration PDF** - Export direct des poules vers PDF professionnel

### 🎯 **Saisie distante**
- 📡 Serveur WebSocket pour les arbitres
- 📱 Interfaces pour tablettes
- 📡 Affichage temps réel sur les arènes
- 🎯 Contrôle total (démarrer, pause, terminer, réinitialiser)

### 📡 **Arènes**
- 📊 Affichage individuel par arène (http://IP:3001/arene1, etc.)
- 🎯 Interface d'arbitrage (http://IP:3001/arene1/arbitre)
- 🎯 Synchronisation automatique des scores et temps

### 📡 **Exports**
- 📊 Formats multiples (CSV, JSON)
- 📊 Fiches XML FFE compatibles
- 📊 Résultats complets avec classements

## 💻 **Spécifications système requises**

### **Configuration minimale**
- **OS** : Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)
- **RAM** : 4 Go minimum (8 Go recommandé)
- **Stockage** : 500 Mo d'espace disque
- **Réseau** : Connexion internet pour les fonctionnalités réseau (optionnel)

### **Configuration recommandée**
- **OS** : Windows 11, macOS 12+, Linux récent
- **RAM** : 8 Go ou plus
- **Stockage** : 1 Go d'espace disque
- **Réseau** : WiFi/Ethernet stable pour mode multi-appareils

### **Navigateurs supportés** (pour les interfaces web)
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🔧 **Technologies**

- **Electron 40+** : Framework multi-plateforme moderne
- **React 19** : Interface utilisateur réactif
- **TypeScript** : Typage statique pour plus de robustesse
- **SQLite** : Base de données portable
- **WebSocket** : Communication temps réel
- **Tailwind CSS** : Design moderne avec classes utilitaires
- **jsPDF** : Génération PDF optimisée
- **Architecture modulaire** : Code maintenable et testable

## 📥 **Téléchargement**### 🚀 **Version la plus récente** (v1.0.1 Build #105)

📦 **[Voir toutes les releases](https://github.com/klinnex/bellepoule-modern/releases)** | 🔄 **[Dernière version automatique](https://github.com/klinnex/bellepoule-modern/releases/latest)**

| Plateforme | Architecture | Lien de téléchargement |
|------------|--------------|----------------------|
| **Windows** | x64 | [BellePoule.Modern-1.0.1-build.105-portable.exe](https://github.com/klinnex/bellepoule-modern/releases/download/latest/BellePoule.Modern-1.0.1-build.105-portable.exe) |
| **macOS** | x64 | [BellePoule.Modern-1.0.1-build.105.dmg](https://github.com/klinnex/bellepoule-modern/releases/download/latest/BellePoule.Modern-1.0.1-build.105.dmg) |
| **Linux** | x64 | [BellePoule.Modern-1.0.1-build.105-x86_64.AppImage](https://github.com/klinnex/bellepoule-modern/releases/download/latest/BellePoule.Modern-1.0.1-build.105-x86_64.AppImage) |
| **Linux** | ARM64 | [BellePoule.Modern-1.0.1-build.105-arm64.AppImage](https://github.com/klinnex/bellepoule-modern/releases/download/latest/BellePoule.Modern-1.0.1-build.105-arm64.AppImage) |

### 🆕 **Nouveautés de la v2.0** (PDF Optimisé)
- ⚡ Export PDF 60-70% plus rapide grâce à l'architecture optimisée
- 🏗️ Code 100% TypeScript strict avec architecture modulaire
- 📋 Format PDF professionnel avec cadre "PISTE X" et matchs en colonnes
- 🔧 Gestion d'erreurs robuste avec multiples niveaux de fallback
- 📊 Monitoring performance avec métriques détaillées
- 📚 Documentation technique et utilisateur complète

### 🚀 **Performance Optimizations v2.1** 
- 🔧 **Memory Management** - Correction des fuites mémoire avec Promise.allSettled
- ⚡ **React Performance** - Optimisation des re-renders et dépendances useMemo  
- 📊 **Algorithm Efficiency** - Calculs de classement optimisés avec Map et WeakMap
- 🎨 **CSS Optimisé** - Variables CSS et classes utilitaires pour maintenabilité
- 📈 **Batch Processing** - Traitement par lot des statistiques tireurs
- 🛡️ **Error Handling** - Logging amélioré avec IDs spécifiques pour debug

### 🔧 **Installation des executables**

#### **Windows**
1. Télécharger le fichier `.exe` portable
2. Double-cliquer pour lancer l'application
3. Aucune installation requise

#### **macOS**
1. Télécharger le fichier `.dmg`
2. Double-cliquer pour monter l'image disque
3. Glisser l'application dans le dossier Applications
4. Accepter les permissions demandées

#### **Linux**
1. Télécharger le fichier `.AppImage` (x64 ou ARM64)
2. Rendre le fichier exécutable : `chmod +x BellePoule.Modern.AppImage`
3. Lancer avec : `./BellePoule.Modern.AppImage`
2. Ouvrir le fichier d'image disque
3. Glisser l'application dans le dossier Applications
4. Lancer depuis le dossier Applications

#### **Linux (AppImage)**
1. Télécharger le fichier `.AppImage`
2. Rendre le fichier exécutable : `chmod +x BellePoule.Modern-*.AppImage`
3. Lancer avec : `./BellePoule.Modern-*.AppImage`

### 🐳 **Alternative Docker**
```bash
docker pull ghcr.io/klinnex/bellepoule-modern:latest
docker run -p 3000:3000 ghcr.io/klinnex/bellepoule-modern:latest
```

## 🚀 **Installation pour développeurs**

```bash
# Cloner le dépôt
git clone https://github.com/klinnex/bellepoule-modern.git

# Installation des dépendances
cd bellepoule-modern
npm install

# Démarrer en développement
npm start

# Construire pour production
npm run build

# Créer les executables
npm run package
```

## 🔍 **Vérification de la version**

Pour vérifier la version installée :
- **Menu** : `Aide > À propos`
- **Raccourci** : `F1`
- **Ligne de commande** : `BellePoule.Modern.exe --version`

La version s'affiche sous la forme `1.0.0-build.XXX`

## 🔄 **Builds automatiques**

Ce projet utilise **GitHub Actions** pour créer automatiquement :
- ✅ **Builds multi-plateformes** à chaque `push` sur `main`
- ✅ **Tests automatisés** TypeScript et compilation
- ✅ **Releases automatiques** avec tous les executables
- ✅ **Numérotation automatique** des builds (build #XXX)

### **Historique des builds**
- 🟢 **Build #105** : ✅ Succès (version actuelle v1.0.1)
- 🟢 **Build #104** : ✅ Succès
- 🟢 **Build #103** : ✅ Succès
- 🔴 **Build #102** : ❌ Échec (problème TypeScript résolu)
- 🟢 **Build #101** : ✅ Succès

Consultez l'état des builds : [GitHub Actions](https://github.com/klinnex/bellepoule-modern/actions)

## 📦 **Générer ses propres executables**

Pour créer des executables personnalisés :

```bash
# Construire l'application
npm run build

# Créer tous les executables
npm run package

# Créer pour une plateforme spécifique
npm run package:win    # Windows
npm run package:mac    # macOS  
npm run package:linux  # Linux
```

Les executables générés seront dans le dossier `release/`.

## 📜 **Documentation**

- 📖 **Documentation complète** : Voir [README.md](./README.md)
- 🐛 **Rapporter un bug** : [Issues GitHub](https://github.com/klinnex/bellepoule-modern/issues)
- 💡 **Demande de fonctionnalité** : [Discussions GitHub](https://github.com/klinnex/bellepoule-modern/discussions)

## 📄 **Licence**

Ce logiciel est distribué sous **GPL-3.0 License**.

- ✅ **Utilisation gratuite** pour tous les usages (personnel, associatif, commercial)
- ✅ **Modification autorisée** avec partage des améliorations
- ✅ **Distribution libre** sous les mêmes conditions
- 📖 [Lire la licence complète](LICENSE)

## 🏆 **Crédits**

- **Développement principal** : Yann Kervella & contributeurs
- **Inspiration** : BellePoule original par Cyprien Pピ
- **Technologies** : Electron, React, TypeScript, SQLite
- **Hébergement** : GitHub (builds automatiques)

## 📞 **Support**

- 🐛 **Rapports de bugs** : [GitHub Issues](https://github.com/klinnex/bellepoule-modern/issues)
- 💡 **Suggestions** : [GitHub Discussions](https://github.com/klinnex/bellepoule-modern/discussions)
- 📧 **Contact** : yann.deboeuf@gmail.com
- 🌐 **Site web** : https://github.com/klinnex/bellepoule-modern

## 🌍 **Contribution**

Les contributions sont bienvenues ! Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour plus d'informations sur la manière de contribuer.

---

📄 **Développé par** : Yann Kervella & communauté  
📄 **Licence** : GPL-3.0  
📄 **Dernière mise à jour** : 4 février 2026  
📄 **Version actuelle** : v1.0.1 Build #105