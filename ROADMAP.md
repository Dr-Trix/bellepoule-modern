# BellePoule Modern - Feuille de Route & Idées

## ✅ Réalisé
- [x] ESLint + Prettier configuration
- [x] Database indexes pour performance
- [x] React.memo sur composants lourds
- [x] VirtualList pour grandes listes
- [x] Tests unitaires (poolCalculations)
- [x] Visualisation SVG du bracket
- [x] Import CSV/Excel (bulkImport)
- [x] Templates de tournois FFE
- [x] Système de logging d'erreurs
- [x] Système Undo/Redo (hook useHistory)
- [x] Raccourcis clavier (hook useKeyboardShortcuts)
- [x] Mode Présentation (component PresentationMode)
- [x] Validation intelligente des scores (scoreValidation)
- [x] Mode Sombre (Dark Mode) - hook useTheme + CSS variables
- [x] Comparaison Head-to-Head (FencerComparison component)
- [x] Analytics & Prédictions (AnalyticsDashboard avec stats et probabilités)
- [x] Partage par QR Code (QRCodeShare component)
- [x] Animations CSS (fadeIn, slide, pulse, glow, scoreFlash)
- [x] Intégration Sentry (errorLogger avec support endpoint externe)
- [x] Téléchargement Auto MAJ (autoUpdater avec installation au redémarrage)
- [x] Export Multi-Formats (HTML, XML FFE, CSV Excel, stats détaillées)

---

## 🎯 Priorité Haute

### 1. Système Undo/Redo
**Description:** Historique des modifications (Ctrl+Z / Ctrl+Y)  
**Cas d'usage:**
- Annuler les scores rentrés par erreur
- Historique des changements de statut tireur
- Très utile pour les arbitres en compétition

**Implémentation suggérée:**
- Créer un hook `useHistory`
- Stack d'actions avec limit (50 actions max)
- Actions: `UPDATE_SCORE`, `CHANGE_STATUS`, `DELETE_FENCER`

### 2. Raccourcis Clavier
**Description:** Productivité pour utilisateurs expérimentés  
**Raccourcis:**
- `Ctrl+N` : Nouvelle compétition
- `Ctrl+S` : Sauvegarder
- `Ctrl+F` : Rechercher un tireur
- `F5` : Rafraîchir
- `Escape` : Fermer modale
- `Ctrl+Z` / `Ctrl+Y` : Undo/Redo
- `Ctrl+1/2/3` : Navigation rapide (Poules/Tableau/Résultats)

**Implémentation:**
- Hook `useKeyboardShortcuts`
- Écouteur global sur document
- Mapping configurable

### 3. Mode Présentation (Écran Géant)
**Description:** Affichage optimisé pour écrans publics  
**Fonctionnalités:**
- Vue simplifiée des poules en cours
- Affichage temps réel des scores
- Mode "full screen" sans interface
- Parfait pour les salles d'armes

**Implémentation:**
- Composant `PresentationMode`
- Toggle F11 pour full screen
- Vue lecture seule, pas d'interactions

### 4. Validation Intelligente des Scores
**Description:** Vérifications automatiques  
**Vérifications:**
- Détecter scores incohérents (ex: 5-6 en poule)
- Alerte si score max dépassé
- Vérifier matchs doublons
- Vérifier que le vainqueur a bien le score max

**Implémentation:**
- Fonction `validateMatchScore()`
- Intégration dans PoolView
- Toasts d'avertissement

---

## 🚀 Priorité Moyenne

### 5. ✅ Mode Sombre (Dark Mode) - TERMINÉ
**Description:** Thème sombre moderne  
**Détails:**
- Toggle dans les paramètres
- Sauvegarde préférence localStorage
- Moins fatiguant pour les yeux

**Implémentation:**
- CSS variables pour thème
- Classe `.theme-dark` sur body
- Hook `useTheme()`

### 6. ✅ Comparaison Head-to-Head - TERMINÉ
**Description:** Stats entre 2 tireurs  
**Fonctionnalités:**
- Historique des confrontations
- Graphiques de performance
- Pour les entraîneurs

**Implémentation:**
- Composant `FencerComparison`
- Sélection 2 tireurs
- Calcul stats croisées

### 7. ✅ Prédictions & Analytics - TERMINÉ
**Description:** Intelligence artificielle légère  
**Fonctionnalités:**
- Probabilités de victoire
- Prédiction temps de match
- Stats en temps réel

**Implémentation:**
- Analyse historique
- Algorithmes simples (pas d'IA lourde)
- Dashboard Analytics

### 8. ✅ Partage par QR Code - TERMINÉ
**Description:** Diffusion rapide des résultats  
**Fonctionnalités:**
- Génération QR code par compétition
- Lien vers résultats en ligne
- Partage facile

**Implémentation:**
- Librairie `qrcode`
- Export image PNG
- URL unique par compétition

---

## 💡 Priorité Basse

### 9. ✅ Animations & Transitions - TERMINÉ
**Description:** UX améliorée  
**Animations:**
- Transitions fluides entre vues
- Animations lors changements de score
- Feedback visuel

**Implémentation:**
- CSS transitions
- React Transition Group
- Framer Motion (si bundle acceptable)

### 10. Mode Kiosk (Tablette Arbitre)
**Description:** Interface ultra-simplifiée  
**Fonctionnalités:**
- Juste les scores à rentrer
- Gros boutons tactiles
- Pas de risque de fausses manips

**Implémentation:**
- Route `/kiosk`
- Composants épurés
- Mode "locked" - impossible de sortir

### 11. Gestion des Photos
**Description:** Photos des tireurs  
**Fonctionnalités:**
- Import photo par tireur
- Affichage dans les feuilles de match
- Reconnaissance faciale (optionnel futur)

**Implémentation:**
- Stockage images base64
- Upload drag & drop
- Miniatures optimisées

### 12. Planification Automatique
**Description:** Optimisation des horaires  
**Fonctionnalités:**
- Calcul meilleur ordre des matchs
- Répartition équilibrée des pistes
- Gestion des pauses

**Implémentation:**
- Algorithme d'optimisation
- Contraintes configurables
- Export planning

### 13. ✅ Intégration Sentry - TERMINÉ
**Description:** Suivi d'erreurs production  
**Détails:**
- Remplacer TODO dans errorLogger.ts
- Capturer erreurs en temps réel
- Dashboard de monitoring

### 14. ✅ Téléchargement Auto des MAJ - TERMINÉ
**Description:** Mise à jour automatique  
**Détails:**
- Remplacer TODO dans autoUpdater.ts
- Téléchargement silencieux
- Installation au redémarrage

### 15. ✅ Export Multi-Formats - TERMINÉ
**Description:** Plus de formats d'export  
**Formats:**
- XML FFE officiel
- PDF certificats
- HTML résultats web
- Excel stats détaillées

---

## 📋 TODOs existants dans le code

✅ Tous les TODOs principaux ont été traités :
- ✅ `errorLogger.ts:188` - Intégration Sentry terminée
- ✅ `autoUpdater.ts:326` - Téléchargement auto MAJ terminé
- ✅ `TableauView.tsx:101` - Logs debug supprimés

---

## 🏗️ Architecture Future

### Séparation des responsabilités
```
src/
├── features/
│   ├── competition/
│   ├── pools/
│   ├── bracket/
│   └── analytics/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
```

### State Management
- Évaluer Zustand vs Redux Toolkit
- Pour competitions complexes (>200 tireurs)

### Tests
- Tests E2E avec Playwright
- Tests de composants React Testing Library

---

**Dernière mise à jour:** $(date)
**Prochaine révision:** Quand tu veux ! 😊
