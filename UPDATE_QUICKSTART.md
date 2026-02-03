# 🚀 Mise à Jour Automatique - Guide Rapide

## Quoi de neuf ?

Le système de mise à jour est maintenant **automatique et non-intrusif** ! Fini les popups bloquantes au démarrage.

## 🎯 Comment ça marche ?

### 1️⃣ **Vérification automatique**
- Toutes les **12 heures** automatiquement
- Au démarrage (5 secondes après)
- En arrière-plan, sans vous déranger

### 2️⃣ **Notification élégante**
```
┌─────────────────────────────────┐
│ 🚀 Mise à jour disponible !     │
│ Version v1.0.1 (Build #75)      │
│                                 │
│ [📥 Télécharger] [📋 Notes] [✖️] │
└─────────────────────────────────┘
```

### 3️⃣ **Installation en 2 clics**
1. **Clic sur "Télécharger"** → Ouvre la page GitHub
2. **Télécharger et remplacer** → C'est tout !

## 🔄 Flux utilisateur

```
Application démarrée
         ↓
   Vérification auto (5s)
         ↓
  Mise à jour disponible ?
         ↓
    ┌─────────┐
    │   OUI   │ → Notification élégante
    └─────────┘
         ↓
   Utilisateur choisit :
   📥 Télécharger
   📋 Voir notes
   ✖️ Ignorer
```

## ⚡ Actions disponibles

### 📥 **Télécharger maintenant**
- Ouvre automatiquement la bonne page GitHub
- Détecte votre système (Windows/Mac/Linux)
- Un clic pour commencer le téléchargement

### 📋 **Voir les notes**
- Affiche les nouveautés et corrections
- Liens vers les release notes complètes
- Permet de décider si la mise à jour est nécessaire

### ✖️ **Ignorer**
- Masque la notification pour cette session
- Nouvelle vérification dans 12 heures
- Accès manuel toujours possible via le menu

## 🎛️ Menu manuel

**Menu Aide → 🔄 Vérifier les mises à jour**

Pour vérifier à tout moment ou voir les détails complets :

```
┌─────────────────────────────────┐
│ 🚀 Mise à jour disponible        │
│                                 │
│ Version actuelle : Build #73     │
│ Nouvelle version : Build #75     │
│                                 │
│ Notes de version :              │
│ • Correction bugs saisie distante│
│ • Amélioration performances     │
│ • Nouvelle documentation        │
│                                 │
│ [📥 Télécharger] [🔗 Releases] [✖️ Plus tard] │
└─────────────────────────────────┘
```

## 🛠️ Configuration avancée

### Pour les experts

Le système est configurable si nécessaire :

```typescript
{
  autoDownload: false,    // Téléchargement manuel (par défaut)
  autoInstall: false,     // Installation manuelle (sécurité)
  checkInterval: 12,      // Heures entre vérifications
  betaChannel: false      // Canal de mise à jour standard
}
```

### Canal Beta (pour les testeurs)

Activer les versions beta pour tester les dernières fonctionnalités :

```typescript
{
  betaChannel: true,      // Inclure les versions beta
  checkInterval: 6,       // Vérifications plus fréquentes
  autoDownload: true      // Téléchargement automatique
}
```

## 📋 Installation simplifiée

### Étape 1 : Téléchargement
La notification vous dirige vers le bon fichier :
- **Windows** : `.exe` portable
- **macOS** : `.dmg` 
- **Linux** : `.AppImage`

### Étape 2 : Remplacement
1. **Fermez BellePoule Modern**
2. **Remplacez l'ancien fichier** par le nouveau
3. **Relancez l'application**

### Étape 3 : Vérification
- Menu **Aide → F1** pour vérifier la nouvelle version
- La notification de mise à jour disparaît

## 🚨 Sécurité

### ✅ Points forts
- **Téléchargement depuis GitHub** (source officielle)
- **Pas d'installation automatique** (contrôle total)
- **Notifications transparentes** (pas de surprise)
- **Vérification des versions** (comparaison builds)

### 🔒 Bonnes pratiques
- **Toujours télécharger depuis** la page officielle GitHub
- **Vérifier le numéro de build** après installation
- **Garder une copie** de l'ancienne version (au début)
- **Sauvegarder vos compétitions** avant mise à jour

## 📊 Avantages vs Ancien système

| ❌ Avant | ✅ Maintenant |
|---------|---------------|
| Popup bloquant au démarrage | Notification non-intrusive |
| "Télécharger" ou "Plus tard" | 3 options claires |
| Pas d'infos sur la mise à jour | Notes de version intégrées |
| Une seule vérification | Vérifications périodiques |
| Interface basique | Design moderne animé |
| Manuel uniquement | Auto + manuel |

## 🔧 Dépannage

### "Je ne vois pas de notification"
- ✅ **Normal** = vous êtes à jour
- ✅ **Vérifier** dans le menu Aide
- ✅ **Redémarrer** l'application

### "Le téléchargement ne marche pas"
- ✅ **Vérifier connexion** internet
- ✅ **Aller manuellement** sur github.com/klinnex/bellepoule-modern/releases
- ✅ **Changer de navigateur** si nécessaire

### "Je veux rester sur l'ancienne version"
- ✅ **Cliquez sur "✖️ Ignorer"**
- ✅ **Ou désactivez** dans configuration avancée
- ✅ **Revenez la mettre** plus tard si besoin

## 🎉 En résumé

- **Automatique** : Plus besoin de penser aux mises à jour
- **Non-intrusif** : Continuez à travailler sans interruption  
- **Simple** : Un clic pour tout faire
- **Sûr** : Contrôle total du processus
- **Moderne** : Design élégant et intuitif

---

**Plus besoin de se soucier des mises à jour !** 🎯

L'application s'occupe de tout, vous restez concentré sur votre compétition.