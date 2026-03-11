<template>
  <div class="px-4 py-4 space-y-3 border-t border-dark-border">
    <h3 class="text-sm font-medium text-gray-400">生成结果</h3>
    
    <div
      v-for="(reply, index) in replies"
      :key="index"
      class="bg-dark-card rounded-xl p-4 border border-dark-border relative group"
    >
      <!-- Type Badge -->
      <div class="flex items-center justify-between mb-2">
        <span
          :class="[
            'px-2 py-1 rounded text-xs font-medium',
            index === 0 ? 'bg-blue-500/20 text-blue-400' :
            index === 1 ? 'bg-purple-500/20 text-purple-400' :
            'bg-pink-500/20 text-pink-400'
          ]"
        >
          {{ reply.type }}
        </span>
        <button
          @click="$emit('favorite', reply)"
          class="text-gray-500 hover:text-yellow-400 transition-colors"
        >
          <span class="text-lg">☆</span>
        </button>
      </div>
      
      <!-- Content -->
      <p class="text-sm leading-relaxed mb-3">{{ reply.content }}</p>
      
      <!-- Copy Button -->
      <button
        @click="$emit('copy', reply.content)"
        class="w-full bg-dark-bg border border-dark-border rounded-lg py-2 text-sm text-gray-300 hover:border-accent-pink hover:text-accent-pink transition-all flex items-center justify-center space-x-2"
      >
        <span>📋</span>
        <span>复制</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  replies: Array
})

defineEmits(['copy', 'favorite'])
</script>
