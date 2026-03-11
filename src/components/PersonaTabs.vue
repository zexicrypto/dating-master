<template>
  <div class="px-4 py-3 border-b border-dark-border">
    <div class="flex space-x-3 overflow-x-auto scrollbar-hide pb-1">
      <button
        v-for="persona in personas"
        :key="persona"
        @click="$emit('update:modelValue', persona)"
        :class="[
          'px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all',
          modelValue === persona
            ? 'bg-gradient-to-r from-accent-pink to-accent-purple text-white shadow-lg'
            : 'bg-dark-card text-gray-300 hover:bg-dark-border'
        ]"
      >
        {{ persona }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: String
})

defineEmits(['update:modelValue'])

const personas = ['黛玉妹妹', '高段位海王', '温柔姐姐', '搞笑女']
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
