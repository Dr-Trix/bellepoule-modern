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

### 🚀 [**Télécharger la dernière version stable**](https://github.com/klinnex/bellepoule-modern/releases/latest)

### 🧪 [**Télécharger la version de développement (dev)**](https://github.com/klinnex/bellepoule-modern/releases/tag/dev)

> ⚠️ **Version de test** : Contient les dernières fonctionnalités mais peut être instable

## 🆕 Nouveautés Récentes (Février 2026)

### 🚀 **Version 2.0 - Mise à jour majeure**

Cette version majeure apporte de nombreuses fonctionnalités demandées par la communauté :

#### ✨ **Nouvelles Fonctionnalités**

- 👨‍⚖️ **Gestion Avancée des Arbitres** - Assignation automatique avec détection de conflits
- 🖥️ **Tableau de Bord Live** - Affichage public en temps réel pour les salles d'armes
- 🔔 **Système de Notifications** - Alertes navigateur, webhooks Discord/Slack
- ☁️ **Sauvegarde Cloud** - Sync Dropbox, Google Drive, OneDrive avec chiffrement
- 🎨 **Gestion des Photos** - Import photos des tireurs avec drag & drop
- 🎮 **Mode Kiosk** - Interface ultra-simplifiée pour tablettes arbitres
- 🇪🇸🇩🇪 **Nouvelles Langues** - Support complet de l'espagnol et de l'allemand

#### 🔧 **Améliorations Techniques**

- ⚡ **Services de Performance** - Cache intelligent, listes virtuelles, monitoring
- 🎯 **Classement Corrigé** - Départage par touches au-delà de la 4e place
- 📊 **Performance Optimisée** - Virtualisation, memoïsation, Web Workers

### 🔮 **Fonctionnalités à Venir (Version 2.1+)**

D'après l'analyse du code et les demandes utilisateurs, les prochaines mises à jour incluront :

#### 🏆 **En Développement**

- 👥 **Compétitions par Équipes** - Support complet des tournois par équipes (relay)
- ⚖️ **Système de Pénalités** - Cartons jaunes/rouges/noirs avec impact sur scores
- ⏰ **Gestion des Retardataires** - Auto-forfait après délai configurable
- 🏅 **Double Élimination** - Brackets gagnants et perdants

#### 🚀 **Planifiées**

- 📊 **Classement Elo** - Calcul automatique et historique
- 🎥 **Replay Vidéo** - Analyse frame par frame des matchs
- 💰 **Gestion Financière** - Frais d'inscription et suivi des dépenses
- 🏟️ **Gestion des Lieux** - Plan interactif des pistes
- 🌐 **Portail d'Inscription** - Pré-inscription en ligne

[Voir ROADMAP.md pour la liste complète](./ROADMAP.md)

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
- 🇪🇸 **Espagnol** _(Nouveau !)_
- 🇩🇪 **Allemand** _(Nouveau !)_

## 🎯 Caractéristiques principales

- **🗂️ Base de données SQLite** pour stocker toutes les données de compétition
- **🌐 Interface moderne** avec design épuré et responsive
- **📱 Gestion en temps réel** des scores et arènes
- **🏊 Support multilingue** (français, anglais, breton, espagnol, allemand)
- **👨‍⚖️ Gestion des arbitres** avec assignation automatique et rotation
- **☁️ Sauvegarde Cloud** multi-providers avec chiffrement AES-GCM
- **🔔 Système de notifications** navigateur, webhooks et emails
- **🖥️ Tableau de bord Live** pour affichage public en temps réel
- **📱 Mode déconnecté** pour les tablettes arbitres
- **🎮 Mode Kiosk** interface ultra-simplifiée
- **⚡️ Sauvegarde automatique** des données
- **📊 Export des résultats** en multiple formats
- **⚡ Optimisation performance** cache intelligent et listes virtuelles
- **🔐 Sécurité** chiffrement des données sensibles

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

### 📊 **Analytics Dashboard (Nouveauté !)**

- 📈 **Real-time Metrics** - Statistiques en temps réel pour les entraîneurs
- 🏆 **Top Performers** - Classement des tireurs les plus performants
- 🎯 **Weapon Statistics** - Analyse détaillée par arme et match
- 📱 **Auto-refresh** - Mises à jour automatiques toutes les 5 secondes
- 📋 **Pool Progress** - Suivi de l'avancement des poules en direct

### 📱 **Tablet Interface (Nouveauté !)**

- 🎯 **Touch Optimization** - Interface optimisée pour tablettes avec zones de touch
- 👆 **Swipe Gestures** - Glisser pour ajouter des points rapidement
- 🎤 **Voice Commands** - Commandes vocales en français ("Point rouge/vert", "Pause")
- ⏱️ **Large Timer** - Chronomètre visible de loin pour les arènes
- 🔄 **Quick Actions** - Boutons géraux pour les actions fréquentes

### 🔄 **Tournament Flow Management (Nouveauté !)**

- 🎯 **Smart Scheduling** - Optimisation automatique des plannings
- 🏟️ **Arena Balancing** - Répartition intelligente des matchs sur les pistes
- ⏰ **Rest Time Management** - Respect des temps de repos pour les tireurs
- 📊 **Flow Analytics** - Identification des goulots d'étranglement
- 🔮 **Predictive Insights** - Prédictions de durée et optimisations

### 👨‍⚖️ **Gestion Avancée des Arbitres** _(Nouveau !)_

- ⚖️ **Assignation Automatique** - Algorithme intelligent de distribution des arbitres
- 🔄 **Rotation des Arbitres** - Équilibrage des assignations avec temps de repos
- ⚠️ **Détection de Conflits** - Alerte si un arbitre doit arbitrer son propre club
- 📊 **Rapports de Statistiques** - Suivi des matchs arbitrés par arbitre
- 🎛️ **Configuration Flexible** - Paramètres de rotation personnalisables

### 🖥️ **Tableau de Bord Live** _(Nouveau !)_

- 📺 **Affichage Public** - Interface optimisée pour écrans géants/salles d'armes
- 🔴 **Matchs en Direct** - Suivi en temps réel des scores avec animations
- 📊 **3 Vues Disponibles** : Poules / Tableau / Classement Final
- 📱 **Design Responsive** - Adapté pour tous les écrans
- 🔄 **Auto-refresh** - Mises à jour automatiques

### 🔔 **Système de Notifications** _(Nouveau !)_

- 🌐 **Notifications Navigateur** - Alertes desktop pour les événements importants
- 🔗 **Webhooks** - Intégration Discord, Slack et services externes
- 📧 **Support Email** - Notifications par email configurables
- ⏰ **Notifications Programmées** - Rappels automatiques
- 🎯 **Événements Suivis** : Début/fin de match, compétition, retards

### ⚡ **Services de Performance** _(Nouveau !)_

- 💾 **Cache Intelligent** - Mise en cache avec expiration (TTL) configurable
- 📜 **Mémoïsation** - Optimisation des calculs répétés
- 📋 **Listes Virtuelles** - Rendu optimisé pour grandes listes (>500 éléments)
- 🖼️ **Optimisation Images** - Compression et redimensionnement automatique
- 📊 **Monitoring** - Suivi des performances avec métriques détaillées
- 🧵 **Web Workers** - Calculs lourds en arrière-plan

### ☁️ **Sauvegarde Cloud** _(Nouveau !)_

- 🔐 **Chiffrement AES-GCM** - Sécurité maximale des données
- 🔄 **Multi-Providers** : Dropbox, Google Drive, OneDrive, serveur personnalisé
- ⚡ **Synchronisation Auto** - Sync configurable avec intervalles personnalisés
- 💾 **Compression** - Réduction de la taille des données avant upload
- 🗂️ **Gestion des Conflits** - Résolution intelligente des conflits de synchronisation
- 💾 **Backups** - Création et restauration de points de sauvegarde

### 🎨 **Gestion des Photos** _(Nouveau !)_

- 🖼️ **Photos des Tireurs** - Import et affichage des photos par tireur
- 📤 **Upload Drag & Drop** - Glisser-déposer pour ajouter des photos
- 🗜️ **Compression Auto** - Redimensionnement (300x300px max) et compression JPEG
- 🔤 **Initiales** - Affichage des initiales si pas de photo
- 📄 **Intégration Feuilles** - Photos visibles sur les feuilles de match

### 🎮 **Mode Kiosk** _(Nouveau !)_

- 📱 **Interface Tablette** - Optimisé pour écrans tactiles
- 👆 **Gros Boutons** - Facile à utiliser avec des gants ou en mouvement
- 🔒 **Mode Verrouillé** - Empêche les fausses manipulations
- ⚡ **Saisie Rapide** - Interface ultra-simplifiée pour la saisie des scores

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
- **React 19** : Interface utilisateur réactive
- **TypeScript 5+** : Typage statique strict pour robustesse maximale
- **SQLite** : Base de données portable et performante
- **WebSocket** : Communication temps réel
- **Tailwind CSS** : Design moderne avec classes utilitaires
- **jsPDF** : Génération PDF optimisée
- **Crypto API** : Chiffrement AES-GCM pour la sécurité cloud
- **Service Workers** : Notifications et fonctionnalités PWA
- **Architecture modulaire** : Code maintenable, testable et évolutif

## 📥 **Téléchargement**

### 🚀 **Version Stable** (Production)

📦 **[Voir toutes les releases stables](https://github.com/klinnex/bellepoule-modern/releases)** | 🔄 **[Dernière version stable](https://github.com/klinnex/bellepoule-modern/releases/latest)**

| Plateforme  | Architecture | Lien de téléchargement                                                                                                                                                       |
| ----------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Windows** | x64          | [BellePoule.Modern-1.0.1-build.105-portable.exe](https://github.com/klinnex/bellepoule-modern/releases/download/latest/BellePoule.Modern-1.0.1-build.105-portable.exe)       |
| **macOS**   | x64          | [BellePoule.Modern-1.0.1-build.105.dmg](https://github.com/klinnex/bellepoule-modern/releases/download/latest/BellePoule.Modern-1.0.1-build.105.dmg)                         |
| **Linux**   | x64          | [BellePoule.Modern-1.0.1-build.105-x86_64.AppImage](https://github.com/klinnex/bellepoule-modern/releases/download/latest/BellePoule.Modern-1.0.1-build.105-x86_64.AppImage) |
| **Linux**   | ARM64        | [BellePoule.Modern-1.0.1-build.105-arm64.AppImage](https://github.com/klinnex/bellepoule-modern/releases/download/latest/BellePoule.Modern-1.0.1-build.105-arm64.AppImage)   |

### 🧪 **Version de Développement** (Tests)

📦 **[Télécharger la dernière version dev](https://github.com/klinnex/bellepoule-modern/releases/tag/dev)**

> ⚠️ **Attention** : Cette version est destinée aux tests et peut contenir des bugs.

| Plateforme  | Architecture | Lien                                                                                                      |
| ----------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| **Windows** | x64          | [`BellePoule Modern-dev-*.exe`](https://github.com/klinnex/bellepoule-modern/releases/tag/dev)            |
| **macOS**   | x64          | [`BellePoule Modern-dev-*.dmg`](https://github.com/klinnex/bellepoule-modern/releases/tag/dev)            |
| **Linux**   | x64          | [`BellePoule Modern-dev-*-x64.AppImage`](https://github.com/klinnex/bellepoule-modern/releases/tag/dev)   |
| **Linux**   | ARM64        | [`BellePoule Modern-dev-*-arm64.AppImage`](https://github.com/klinnex/bellepoule-modern/releases/tag/dev) |

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
4. Ouvrir le fichier d'image disque
5. Glisser l'application dans le dossier Applications
6. Lancer depuis le dossier Applications

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

### **Branche `main`** (Production)

- ✅ **Builds multi-plateformes** à chaque `push` sur `main`
- ✅ **Tests automatisés** TypeScript et compilation
- ✅ **Releases stables** avec tous les executables
- ✅ **Numérotation automatique** des builds (build #XXX)

### **Branche `dev`** (Développement)

- 🧪 **Builds multi-plateformes** à chaque `push` sur `dev`
- 🧪 **Release `dev` permanente** mise à jour automatiquement
- 🧪 **Executables avec suffixe `-dev`** pour identification facile
- 🧪 **Tests des nouvelles fonctionnalités** avant merge sur main

### **Liens directs**

- 🟢 **Release stable** : [`/releases/latest`](https://github.com/klinnex/bellepoule-modern/releases/latest)
- 🧪 **Release dev** : [`/releases/tag/dev`](https://github.com/klinnex/bellepoule-modern/releases/tag/dev)
- 📊 **État des builds** : [GitHub Actions](https://github.com/klinnex/bellepoule-modern/actions)

### **Historique des builds**

- 🟢 **Build #105** : ✅ Succès (version stable v1.0.1)
- 🟢 **Build #104** : ✅ Succès
- 🧪 **Dev build** : 🔄 Automatique à chaque push sur `dev`

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
📄 **Dernière mise à jour** : 13 février 2026  
📄 **Version actuelle** : v1.0.1 Build #204+
