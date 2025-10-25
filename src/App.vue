<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside
      :class="['bg-gray-800 text-white flex-shrink-0 flex flex-col transition-transform duration-300', showSidebar ? 'translate-x-0' : '-translate-x-full', 'md:translate-x-0', 'w-64']">
      <div class="px-4 py-4 font-bold text-lg border-b border-gray-700 flex items-center justify-between">
        Channels
        <button @click="showCreatePanel = true"
          class="text-gray-200 hover:text-white ml-2 rounded-2xl px-2 py-1">+</button>
      </div>

      <ul class="flex-1 overflow-auto gap-2 p-4">
        <li v-for="(ch, i) in availableChannels" :key="ch.id" @click="joinExistingChannel(ch.id)"
          class="my-1 rounded-2xl px-4 py-2 cursor-pointer hover:bg-gray-700 flex justify-between items-center"
          :class="{ 'bg-gray-700': ch.id === channel }">
          <span># {{ ch.id }}</span>
          <span class="text-xs bg-gray-600 px-2 py-0.5 rounded-2xl flex items-center gap-1">
            <Icon icon="mdi:account" width="14" height="14" />
            {{ ch.userCount }}
          </span>
        </li>
        <li v-if="availableChannels.length === 0" class="px-4 py-2 text-gray-400">
          Aucun
        </li>
        <div class=" py-3 border-gray-700">
          <button @click="showCreatePanel = true"
            class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1">
            <Icon icon="hugeicons:add-circle" width="20" height="20" />
            <span>Créer un canal</span>
          </button>
        </div>
        <!-- Panneau d'actions quand on est dans un channel -->
<div v-if="joined" class="w-full mt-auto bg-slate-700 shadow-lg rounded-xl p-4 flex flex-col gap-2  z-50">
  <h3 class="font-semibold text-gray-100 mb-2">Actions</h3>
  <button
    @click="leaveChannel"
    class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
  >
    Quitter le salon
  </button>
</div>

      </ul>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col">
      <!-- Mobile header -->
      <header class="md:hidden flex items-center justify-between bg-gray-200 p-2">
        <button @click="showSidebar = true" class="text-gray-700 p-2 rounded-2xl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6">
            <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <span class="font-bold">Channels</span>
      </header>

      <!-- Contenu principal -->
      <div class="flex-1 p-4 flex flex-col gap-4">
        <!-- Si aucun channel sélectionné -->
        <div v-if="!joined && !channel" class="flex flex-col items-center justify-center flex-1">
          <h2 class="text-2xl font-bold mb-4">Bienvenue ! 🎧</h2>
          <p class="mb-4">Sélectionnez un channel pour rejoindre ou consultez les utilisateurs disponibles :</p>

          <div class="w-full max-w-md bg-white shadow p-4 rounded-2xl">
            <h3 class="font-semibold mb-2">Channels disponibles</h3>
            <ul>
              <li v-for="ch in availableChannels" :key="ch.id"
                class="flex justify-between items-center px-4 py-2 rounded-xl hover:bg-gray-100 cursor-pointer"
                @click="joinExistingChannel(ch.id)">
                <span># {{ ch.id }}</span>
                <span class="text-xs bg-gray-200 px-2 py-0.5 rounded-2xl">{{ ch.userCount }} users</span>
              </li>
              <li v-if="availableChannels.length === 0" class="px-4 py-2 text-gray-400">Aucun</li>
            </ul>

            <div class="mt-4">
              <h3 class="font-semibold mb-2">Utilisateurs connectés</h3>
              <ul>
                <li v-for="user in allUsers" :key="user.name" class="px-4 py-1 border-b border-gray-100">
                  {{ user.name }}
                </li>
                <li v-if="allUsers.length === 0" class="text-gray-400 px-4 py-1">Aucun utilisateur connecté</li>
              </ul>
            </div>
          </div>
          
        </div>

        <!-- Si on est dans un channel -->
        <div v-else>
          <!-- Ton contenu existant quand joined === true -->
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Users -->
            <div class="bg-white shadow p-4 rounded-2xl w-full md:w-1/3" v-if="joined">
              <h2 class="font-bold mb-2">👥 Utilisateurs connectés</h2>
              <ul>
                <li v-for="(user, i) in users" :key="i" class="flex items-center gap-2">
                  {{ user.name }}
                  <span v-if="user.speaking" class="w-3 h-3 bg-green-500 rounded-2xl animate-pulse"></span>
                </li>
              </ul>
            </div>

            <!-- Audio -->
            <div class="flex-1 bg-white shadow p-4 rounded-2xl">
              <p v-if="joined" class="mb-2">Canal : <b>{{ channel }}</b> | Utilisateurs : {{ users.length }}</p>
              <audio ref="localAudio" autoplay muted></audio>
              <div ref="remoteAudioContainer"></div>
            </div>
          </div>
        </div>
      </div>
    </main>


    <!-- Sliding panel pour créer un channel -->
    <CreateChannelPanel :isOpen="showCreatePanel" :ws="ws" @close="showCreatePanel = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import CreateChannelPanel from "./components/CreateChannelPanel.vue";
import { Icon } from '@iconify/vue';

interface User { name: string; speaking: boolean }
interface Channel { id: string; userCount: number }

const username = ref("user-" + Math.random().toString(36).substring(2, 8));
const channel = ref("");
const availableChannels = ref<Channel[]>([]);
const users = ref<User[]>([]);
const joined = ref(false);
const showSidebar = ref(false);
const showCreatePanel = ref(false);
const allUsers = ref<User[]>([]);

const localAudio = ref<HTMLAudioElement | null>(null);
const remoteAudioContainer = ref<HTMLDivElement | null>(null);

let ws: WebSocket;
let pc: RTCPeerConnection | null = null;
let pendingCandidates: RTCIceCandidateInit[] = [];

let audioContext: AudioContext;
let analyser: AnalyserNode;
let microphoneSource: MediaStreamAudioSourceNode;
let speaking = false;

onMounted(() => {
  ws = new WebSocket("ws://localhost:3001");

  ws.onopen = () => ws.send(JSON.stringify({ type: "getChannels" }));

  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "channels":
        availableChannels.value = data.list;
        break;

    case "users":
      if (data.channelId === channel.value) {
        users.value = data.users.map((u: any) => ({ ...u }));
      }
      // Mettre à jour allUsers pour l'accueil
      allUsers.value = data.users.map((u: any) => ({ ...u }));
      break;

      case "speaking":
        users.value = users.value.map(u =>
          u.name === data.username ? { ...u, speaking: data.speaking } : u
        );
        await nextTick();
        break;

      case "signal":
        if (!pc) return;
        if (data.payload.type === "offer") {
          await pc.setRemoteDescription(data.payload);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: "signal", channelId: channel.value, payload: answer }));
          for (const c of pendingCandidates) {
            await pc.addIceCandidate(c);
          }
          pendingCandidates = [];
        } else if (data.payload.type === "answer") {
          await pc.setRemoteDescription(data.payload);
        } else if (data.payload.candidate) {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(data.payload);
          } else {
            pendingCandidates.push(data.payload);
          }
        }
        break;
    }
  };
});

const joinChannel = async () => {
  if (!username.value || !channel.value) return alert("Nom d'utilisateur et canal requis !");

  // Fermer ancien PC si existant
  if (pc) {
    pc.close();
    pc = null;
    pendingCandidates = [];
  }

  joined.value = true;
  pc = new RTCPeerConnection();

  // Ice candidates
  pc.onicecandidate = (e) => {
    if (e.candidate)
      ws.send(JSON.stringify({ type: "signal", channelId: channel.value, payload: e.candidate }));
  };

  // Réception audio des autres
  pc.ontrack = (e) => {
    const audio = document.createElement("audio");
    audio.autoplay = true;
    audio.srcObject = e.streams[0];
    remoteAudioContainer.value?.appendChild(audio);
  };

  // Tracks locaux
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach(track => pc?.addTrack(track, stream));
  if (localAudio.value) localAudio.value.srcObject = stream;

  startVoiceDetection(stream);

  // Créer l'offre
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  ws.send(JSON.stringify({ type: "join", channelId: channel.value, username: username.value }));
  ws.send(JSON.stringify({ type: "signal", channelId: channel.value, payload: offer }));
};


const joinExistingChannel = async (ch: string) => {
  if (ch === channel.value) return; // pas de changement
  // Si on est déjà connecté à un channel, on quitte d'abord
  if (joined.value) {
    await leaveChannelAsync();
  }
  // On met à jour le channel et on rejoint
  channel.value = ch;
  await joinChannel();
};

// Version asynchrone de leaveChannel pour attendre la fermeture du PC et WS
const leaveChannelAsync = async () => {
  if (!joined.value) return;
  return new Promise<void>((resolve) => {
    ws.send(JSON.stringify({ type: "leave", channelId: channel.value, username: username.value }));
    if (pc) pc.close();
    pc = null;
    pendingCandidates = [];
    joined.value = false;
    users.value = [];
    channel.value = "";
    if (remoteAudioContainer.value) remoteAudioContainer.value.innerHTML = "";
    resolve();
  });
};


const leaveChannel = () => {
  ws.send(JSON.stringify({ type: "leave", channelId: channel.value, username: username.value }));
  pc?.close();
  pc = null;
  pendingCandidates = [];
  joined.value = false;
  users.value = [];
  channel.value = "";
  if (remoteAudioContainer.value) remoteAudioContainer.value.innerHTML = "";
  showSidebar.value = false;
};

function startVoiceDetection(stream: MediaStream) {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;

  microphoneSource = audioContext.createMediaStreamSource(stream);
  microphoneSource.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  const checkVolume = () => {
    analyser.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const currentlySpeaking = avg > 10;

    if (currentlySpeaking !== speaking) {
      speaking = currentlySpeaking;
      ws.send(JSON.stringify({ type: "speaking", channelId: channel.value, speaking }));
    }

    requestAnimationFrame(checkVolume);
  };

  checkVolume();
}
</script>

<style scoped>
aside {
  transition: transform 0.3s ease;
}
</style>
