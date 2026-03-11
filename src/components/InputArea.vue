<template>
  <div class="space-y-4">
    <!-- Scene Tags -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="scene in scenes"
        :key="scene"
        @click="toggleScene(scene)"
        :class="[
          'px-3 py-1 rounded-full text-xs transition-all',
          selectedScene === scene
            ? 'bg-accent-purple text-white'
            : 'bg-dark-card text-gray-400 border border-dark-border hover:border-accent-purple'
        ]"
      >
        {{ scene }}
      </button>
    </div>

    <!-- Context Input -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">聊天背景（可选）</label>
      <textarea
        :value="context"
        @input="$emit('update:context', $event.target.value)"
        placeholder="例如：刚认识一周，对方比较主动..."
        class="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent-pink"
        rows="2"
      />
    </div>

    <!-- Target Message Input -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">对方消息</label>
      <textarea
        :value="targetMessage"
        @input="$emit('update:targetMessage', $event.target.value)"
        placeholder="粘贴对方发来的消息..."
        class="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent-pink"
        rows="4"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  context: String,
  targetMessage: String,
  selectedScene: String,
  imagePreview: String
})

const emit = defineEmits(['update:context', 'update:targetMessage', 'update:selectedScene', 'removeImage'])

const scenes = ['婉拒见面', '暗示要礼物', '引导视频', '午夜微醺']

const toggleScene = (scene) => {
  emit('update:selectedScene', props.selectedScene === scene ? '' : scene)
}
</script>
