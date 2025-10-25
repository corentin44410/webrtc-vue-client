# 🎧 WebRTC Audio POC Multi-Channel — Frontend Vue.js

Ce projet constitue l’interface **frontend Vue 3 + TypeScript + TailwindCSS** permettant à plusieurs utilisateurs de se connecter à un serveur de signalisation WebSocket et de communiquer via **WebRTC audio** en temps réel.

---

## 🚀 Objectifs du POC

* Permettre la **connexion simultanée de plusieurs clients** sur différents canaux audio.
* Gérer dynamiquement la **création, la suppression et la liste** des channels.
* Détecter et afficher les **utilisateurs actifs** et leurs **états vocaux (speaking indicator)**.
* Offrir une interface moderne et responsive inspirée de Discord.

---

## 🏗️ Stack technique

| Composant       | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| **Vue 3**       | Framework principal du front                                       |
| **TypeScript**  | Typage statique pour une meilleure maintenabilité                  |
| **TailwindCSS** | Framework CSS utilitaire pour un design moderne et rapide          |
| **WebSocket**   | Communication temps réel avec le serveur Node.js                   |
| **WebRTC**      | Gestion de la capture, transmission et réception audio entre pairs |

---

## ⚙️ Installation

```bash
# Cloner le dépôt
git clone https://github.com/ton-org/webrtc-vue-client.git
cd webrtc-vue-client

# Installer les dépendances
npm install

# Lancer le projet en mode développement
npm run dev
```

Le projet se lance par défaut sur `http://localhost:5173` (Vite).

---

## 📡 Communication avec le serveur

L’application communique via **WebSocket** avec le serveur Node.js (`ws://localhost:3001`), qui gère :

* la liste des channels disponibles,
* les connexions et déconnexions,
* la signalisation WebRTC (`offer`, `answer`, `ICE candidates`),
* la diffusion des états “speaking”.

### Exemple de messages échangés

| Type            | Description                                             |
| --------------- | ------------------------------------------------------- |
| `getChannels`   | Demande la liste des canaux                             |
| `createChannel` | Crée un nouveau canal                                   |
| `join`          | Rejoint un canal avec un nom d’utilisateur              |
| `leave`         | Quitte un canal                                         |
| `signal`        | Envoie les informations WebRTC (offer/answer/candidate) |
| `speaking`      | Indique si un utilisateur parle actuellement            |

---

## 🧠 Fonctionnement interne

1. **Connexion WebSocket** : le client s’abonne au serveur à l’ouverture de la page.
2. **Création / Sélection de canal** : via un panneau latéral interactif.
3. **Connexion WebRTC** : lorsqu’un utilisateur rejoint un canal, une session peer-to-peer est établie.
4. **Transmission audio** : les flux audio sont capturés localement et transmis via WebRTC.
5. **Indicateur vocal** : un analyseur (`AudioContext + AnalyserNode`) détecte la parole et envoie des notifications au serveur.
6. **UI dynamique** : les mises à jour de channels, utilisateurs et statuts sont affichées en temps réel.

---

## 🎨 Interface utilisateur

* Barre latérale gauche avec la liste des channels + nombre d’utilisateurs.
* Panneau coulissant pour la création de nouveaux channels.
* Page d’accueil listant les salons et les utilisateurs quand aucun canal n’est rejoint.
* Indicateur visuel 🔵 de parole à côté des pseudos.
* Support mobile (layout responsive).

---

## 🧩 Structure du projet

```
webrtc-vue-client/
├── src/
│   ├── components/
│   │   └── CreateChannelPanel.vue
│   ├── App.vue
│   ├── main.ts
│   └── assets/
├── public/
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🔧 Configuration Tailwind

Le fichier `main.ts` importe Tailwind via :

```ts
import './assets/tailwind.css'
```

et la configuration minimale (`tailwind.config.js`) :

```js
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

---

## 💡 Améliorations possibles

* Gestion d’un **STUN/TURN server** pour garantir la connexion à travers les NAT/firewalls.
* Ajout du **chat texte** par canal.
* Enregistrement et lecture différée des conversations.
* Gestion d’une authentification utilisateur (Keycloak, OAuth…).

---

## 🧑‍💻 Auteur

Projet développé dans le cadre d’un **POC technique WebRTC multicanal** pour la SICA / Unissia.
Développement et intégration : **Corentin De Sousa**

---

## 📜 Licence

MIT License © 2025 — Unissia / SICA
