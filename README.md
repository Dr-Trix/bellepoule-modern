# BellePoule Modern - Logiciel moderne de gestion de compétitions d'escrime

🤺 **Logiciel moderne de gestion de compétitions d'escrime** avec interface multilingue et temps réel

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

### 🎯 **Poules**
- ✅ Génération automatique des poules sérpentine
- ✅ Configuration personnalisée (nombre de tireurs par poule, tours de poules)
- ✅ Système de chronométrage des matchs
- ✅ Support des armes (épée, fleuret, sabre, sabre laser)

### 🎯 **Tableau d'élimination**
- ✅ Placement automatisé selon le classement
- ✅ Gestion complète des matchs
- ✅ Support des défections (abandon, forfait, exclusion)
- ✅ Vue en arborescence

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

## 🔧 **Technologies**

- **Electron 40+** : Framework multi-plateforme moderne
- **React 19** : Interface utilisateur réactif
- **TypeScript** : Typage statique pour plus de robustesse
- **SQLite** : Base de données portable
- **WebSocket** : Communication temps réel
- **Sassite CSS** : Design moderne avec classes utilitaires

## 🚀 **Installation**

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
```

## 📜 **Documentation**

Voir [README.md](./README.md) pour la documentation complète.

---

## 🌍 **Contribution**

Les contributions sont bienvenues ! Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour plus d'informations. informations sur la manière de contribuer.

---
<br>

📄 **Commencé par** : Yann Kervella  
📄 **Dernière mise à jour** : 4 février 2026