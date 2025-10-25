<template>
  <div v-if="isOpen" class="fixed inset-0 z-50">
    <!-- Overlay -->
    <div
      class="absolute inset-0 bg-black bg-opacity-50"
      @click="$emit('close')"
    ></div>

    <!-- Panel -->
    <div
      class="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-out flex flex-col translate-x-0"
    >
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b">
        <h2 class="text-xl font-bold">Créer un nouveau channel</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 p-6 overflow-y-auto">
        <label for="channelName" class="block text-sm font-medium text-gray-700 mb-2">
          Nom du channel
        </label>
        <input
          id="channelName"
          type="text"
          v-model="channelName"
          placeholder="ex: général"
          class="w-full p-4 border-2 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
        />
      </div>

      <!-- Footer -->
      <div class="p-6 border-t">
        <button
          @click="submit"
          class="w-full px-4 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-300"
          :disabled="!channelName.trim()"
        >
          Valider
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  ws: WebSocket;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const channelName = ref('');

const submit = () => {
  if (!channelName.value.trim()) return;
  props.ws.send(JSON.stringify({
    type: 'createChannel',
    channelId: channelName.value.trim()
  }));
  channelName.value = '';
  emit('close');
};
</script>

<style scoped>
/* Le panel est maintenant seulement rendu quand isOpen=true, donc il ne bloque plus les clics */
</style>
