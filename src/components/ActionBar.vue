<template>
  <div class="px-4 py-3 border-t border-dark-border bg-dark-bg">
    <div class="flex space-x-3">
      <button
        @click="$emit('uploadImage')"
        class="flex-1 bg-dark-card border border-dark-border rounded-lg py-3 px-4 flex items-center justify-center space-x-2 hover:border-accent-pink transition-colors"
      >
        <span class="text-lg">📷</span>
        <span class="text-sm">传图代打</span>
      </button>
      
      <button
        @click="$emit('pasteAndGenerate')"
        :disabled="loading"
        class="flex-1 bg-gradient-to-r from-accent-pink to-accent-purple rounded-lg py-3 px-4 flex items-center justify-center space-x-2 shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <span class="text-lg">⚡</span>
        <span class="text-sm font-medium">一键粘+算</span>
      </button>
    </div>
    
    <button
      @click="$emit('generate')"
      :disabled="loading"
      class="w-full mt-3 bg-dark-card border border-accent-pink text-accent-pink rounded-lg py-3 font-medium hover:bg-accent-pink hover:text-white transition-all disabled:opacity-50"
    >
      {{ loading ? '生成中...' : '生成回复' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean
})

defineEmits(['uploadImage', 'pasteAndGenerate', 'generate'])
</script>
