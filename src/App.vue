<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

// 人设数据
const defaultPersonas = [
  { key: '黛玉妹妹', name: '黛玉妹妹', emoji: '🌸', desc: '娇嗔幽怨' },
  { key: '高段位海王', name: '高段位海王', emoji: '🌊', desc: '推拉掌控' },
  { key: '狐媚子', name: '狐媚子', emoji: '🦊', desc: '妩媚撩人' },
  { key: '甜妹', name: '甜妹', emoji: '🎀', desc: '软糯可爱' },
  { key: '霸道女总裁', name: '女总裁', emoji: '👑', desc: '强势掌控' },
  { key: '茶艺大师', name: '茶艺大师', emoji: '🍵', desc: '以退为进' },
  { key: '温柔姐姐', name: '温柔姐姐', emoji: '🌙', desc: '温暖治愈' },
  { key: '搞笑女', name: '搞笑女', emoji: '😆', desc: '幽默风趣' },
  { key: '纯欲少女', name: '纯欲少女', emoji: '🌹', desc: '清纯性感' },
  { key: '冷艳女王', name: '冷艳女王', emoji: '❄️', desc: '高冷神秘' },
]

// 场景标签
const scenes = [
  { key: '开场白', name: '👋 开场白', category: '基础' },
  { key: '搭讪', name: '🎯 搭讪', category: '基础' },
  { key: '调侃', name: '😏 调侃', category: '互动' },
  { key: '怼一下', name: '💢 怼一下', category: '互动' },
  { key: '撒娇', name: '🥺 撒娇', category: '互动' },
  { key: '安慰鼓励', name: '🤗 安慰鼓励', category: '互动' },
  { key: '午夜微醺', name: '🍷 午夜微醺', category: '进阶' },
  { key: '暗示要礼物', name: '🎁 暗示要礼', category: '进阶' },
  { key: '婉拒见面', name: '🛑 婉拒见面', category: '进阶' },
]

// 土味情话库
const pickuplines = [
  '你知道我的缺点是什么吗？是缺点你。',
  '最近有点忙，忙着喜欢你。',
  '被你赞过的朋友圈，叫甜甜圈。',
  '我怀疑你的本质是一本书，不然为什么让我越看越想睡。',
  '你今天特别讨厌，讨人喜欢和百看不厌。',
  '我觉得你接近我就是害我，害得我好喜欢你。',
  '你知道你和星星有什么区别吗？星星在天上，你在我心里。',
  '我想去个地方，什么地方？去你心里。',
  '你能不能闭嘴？我没有说话啊，那为什么我满脑子都是你的声音？',
  '我觉得你好像一款游戏。什么游戏？我的世界。',
  '你属什么的？我属狗的。不，你属于我。',
  '这是我的手背，这是我的脚背，你是我的宝贝。',
  '可以帮我洗个东西吗？洗什么？喜欢我。',
  '你猜我想喝什么？喝什么？我想呵护你。',
  '你猜我想吃什么？痴痴地望着你。',
]

// 状态
const currentView = ref('input')
const personas = ref([...defaultPersonas])
const selectedPersona = ref('黛玉妹妹')
const selectedScene = ref('')
const inputText = ref('')
const inputMode = ref('text')
const imagePreview = ref('')
const imageBase64 = ref('')
const generatedReplies = ref([])
const favorites = ref([])
const dailyPickups = ref([])
const showDailyPickups = ref(false)
const lastInput = ref({ text: '', image: '' })
const newPersona = ref({ name: '', emoji: '', desc: '' })

// Toast
const toastMsg = ref('')
const showToast = ref(false)
const showToastMsg = (msg) => {
  toastMsg.value = msg
  showToast.value = true
  setTimeout(() => showToast.value = false, 2000)
}

// 初始化
onMounted(() => {
  const saved = localStorage.getItem('dm-favorites')
  if (saved) favorites.value = JSON.parse(saved)
  refreshDailyPickups()
})

// 刷新每日土味情话
const refreshDailyPickups = () => {
  const shuffled = [...pickuplines].sort(() => 0.5 - Math.random())
  dailyPickups.value = shuffled.slice(0, 3).map((text, i) => ({ id: i, text }))
}

// 保存收藏
const saveFavorites = () => {
  localStorage.setItem('dm-favorites', JSON.stringify(favorites.value))
}

// 添加收藏
const addFavorite = (content, type) => {
  if (favorites.value.some(f => f.content === content)) {
    showToastMsg('已在收藏中')
    return
  }
  favorites.value.unshift({ content, type, persona: selectedPersona.value })
  saveFavorites()
  showToastMsg('已收藏')
}

// 复制
const copy = async (text) => {
  try { await navigator.clipboard.writeText(text); showToastMsg('已复制') }
  catch { showToastMsg('复制失败') }
}

// 一键粘贴并生成
const pasteAndGenerate = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (!text) { showToastMsg('剪贴板为空'); return }
    inputText.value = text
    inputMode.value = 'text'
    showToastMsg('已读取')
    await doGenerate()
  } catch { showToastMsg('请允许剪贴板权限') }
}

// 上传图片
const uploadImage = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxW = 800
      let w = img.width, h = img.height
      if (w > maxW) { h = (h * maxW) / w; w = maxW }
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      const base64 = canvas.toDataURL('image/jpeg', 0.8)
      imageBase64.value = base64.split(',')[1]
      imagePreview.value = base64
      showToastMsg('图片已上传')
    }
    img.src = ev.target.result
  }
  reader.readAsDataURL(file)
}

const clearImage = () => { imagePreview.value = ''; imageBase64.value = '' }

// 生成回复
const doGenerate = async () => {
  if (!inputText.value.trim() && !imageBase64.value) {
    showToastMsg('请先输入内容')
    return
  }
  
  // 保存输入用于重新生成
  lastInput.value = { text: inputText.value, image: imageBase64.value }
  
  currentView.value = 'loading'
  try {
    let res
    const scene = selectedScene.value || undefined
    if (imageBase64.value && !inputText.value.trim()) {
      res = await axios.post(`${API_URL}/api/generate/image`, {
        persona: selectedPersona.value, scene, context: '', image_base64: imageBase64.value
      })
    } else {
      res = await axios.post(`${API_URL}/api/generate/text`, {
        persona: selectedPersona.value, scene, context: '', target_message: inputText.value
      })
    }
    generatedReplies.value = res.data.replies
    currentView.value = 'result'
  } catch (err) {
    showToastMsg('生成失败')
    currentView.value = 'input'
  }
}

// 重新生成（换一换）
const regenerate = async () => {
  if (!lastInput.value.text && !lastInput.value.image) {
    showToastMsg('没有内容可重新生成')
    return
  }
  currentView.value = 'loading'
  try {
    let res
    const scene = selectedScene.value || undefined
    if (lastInput.value.image) {
      res = await axios.post(`${API_URL}/api/generate/image`, {
        persona: selectedPersona.value, scene, context: '', image_base64: lastInput.value.image
      })
    } else {
      res = await axios.post(`${API_URL}/api/generate/text`, {
        persona: selectedPersona.value, scene, context: '', target_message: lastInput.value.text
      })
    }
    generatedReplies.value = res.data.replies
    currentView.value = 'result'
  } catch (err) {
    showToastMsg('生成失败')
    currentView.value = 'result'
  }
}

// 主动撩人
const proactive = async (scene) => {
  currentView.value = 'loading'
  try {
    const res = await axios.post(`${API_URL}/api/generate/text`, {
      persona: selectedPersona.value, scene, context: '', target_message: '主动撩人'
    })
    generatedReplies.value = res.data.replies
    currentView.value = 'result'
  } catch (err) {
    showToastMsg('生成失败')
    currentView.value = 'input'
  }
}

// 返回
const goBack = () => {
  currentView.value = 'input'
}

// 添加人设
const addPersona = () => {
  if (!newPersona.value.name || !newPersona.value.emoji) {
    showToastMsg('请填写完整')
    return
  }
  personas.value.push({
    key: 'c' + Date.now(),
    name: newPersona.value.name,
    emoji: newPersona.value.emoji,
    desc: newPersona.value.desc || '自定义'
  })
  newPersona.value = { name: '', emoji: '', desc: '' }
  currentView.value = 'input'
  showToastMsg('添加成功')
}
</script>

<template>
  <div class="app">
    <div v-if="showToast" class="toast">{{ toastMsg }}</div>
    
    <!-- 输入页 -->
    <div v-if="currentView === 'input'" class="page">
      <header class="header-pink">
        <div class="header-top">
          <span class="menu">☰</span>
          <h1>💕 恋爱大师</h1>
          <button class="fav-btn" @click="currentView = 'favorites'">⭐ {{ favorites.length }}</button>
        </div>
      </header>
      
      <main class="main">
        <!-- 人设 -->
        <div class="section">
          <div class="sec-head">
            <span>选择人设</span>
            <button class="add" @click="currentView = 'addPersona'">+ 添加</button>
          </div>
          <div class="persona-scroll">
            <div v-for="p in personas" :key="p.key" class="persona-card" :class="{ active: selectedPersona === p.key }" @click="selectedPersona = p.key">
              <span class="emoji">{{ p.emoji }}</span>
              <span class="name">{{ p.name }}</span>
              <span class="desc">{{ p.desc }}</span>
            </div>
          </div>
        </div>
        
        <!-- 输入 -->
        <div class="section">
          <div class="input-tabs">
            <button :class="{ active: inputMode === 'text' }" @click="inputMode = 'text'">📝 文字</button>
            <button :class="{ active: inputMode === 'image' }" @click="inputMode = 'image'">🖼️ 截图</button>
          </div>
          <div v-if="inputMode === 'text'" class="text-box">
            <textarea v-model="inputText" placeholder="将哥哥的话粘贴到这里..." rows="4"></textarea>
          </div>
          <div v-else class="image-box">
            <div v-if="imagePreview" class="preview">
              <img :src="imagePreview">
              <button class="clear" @click="clearImage">×</button>
            </div>
            <label v-else class="upload">
              <input type="file" accept="image/*" style="display: none" @change="uploadImage">
              <span>📷 点击上传聊天截图</span>
            </label>
          </div>
        </div>
        
        <!-- 一键粘贴 -->
        <button class="btn-paste" @click="pasteAndGenerate">
          <span class="shine">✨</span> 一键粘+（算抓取剪贴板秒回） <span class="shine">✨</span>
        </button>
        
        <!-- 场景 -->
        <div class="section">
          <div class="sec-head"><span>选择场景</span><span class="opt">（可选）</span></div>
          <div class="scene-box">
            <div class="cat"><span class="label">基础</span><div class="tags"><button v-for="s in scenes.filter(x=>x.category==='基础')" :key="s.key" :class="{ active: selectedScene === s.key }" @click="selectedScene = selectedScene === s.key ? '' : s.key">{{ s.name }}</button></div></div>
            <div class="cat"><span class="label">互动</span><div class="tags"><button v-for="s in scenes.filter(x=>x.category==='互动')" :key="s.key" :class="{ active: selectedScene === s.key }" @click="selectedScene = selectedScene === s.key ? '' : s.key">{{ s.name }}</button></div></div>
            <div class="cat"><span class="label">进阶</span><div class="tags"><button v-for="s in scenes.filter(x=>x.category==='进阶')" :key="s.key" :class="{ active: selectedScene === s.key }" @click="selectedScene = selectedScene === s.key ? '' : s.key">{{ s.name }}</button></div></div>
          </div>
        </div>
        
        <!-- 主动撩 -->
        <div class="section proactive">
          <div class="sec-head"><span>💘 主动撩大哥</span><span class="sub">不用等对方，主动出击</span></div>
          <div class="proactive-btns">
            <button @click="proactive('开场白')">👋 开场白</button>
            <button @click="proactive('搭讪')">🎯 搭讪</button>
            <button @click="proactive('午夜微醺')">🍷 午夜微醺</button>
            <button @click="proactive('暗示要礼物')">🎁 暗示要礼</button>
          </div>
        </div>
        
        <!-- 生成按钮 -->
        <button class="btn-generate" :disabled="!inputText.trim() && !imageBase64" @click="doGenerate">
          <span class="shine">✨</span> 生成高情商回复 <span class="shine">✨</span>
        </button>
        
        <!-- 每日土味 -->
        <div class="daily-pickup">
          <div class="head" @click="showDailyPickups = !showDailyPickups">
            <span>🌽 每日土味撩人情话</span>
            <div class="acts"><button @click.stop="refreshDailyPickups">🔄</button><span>{{ showDailyPickups ? '▼' : '▶' }}</span></div>
          </div>
          <div v-if="showDailyPickups" class="list">
            <div v-for="item in dailyPickups" :key="item.id" class="item">
              <p>{{ item.text }}</p>
              <div class="acts"><button @click="copy(item.text)">📋</button><button @click="addFavorite(item.text, '土味情话')">⭐</button></div>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- 加载页 -->
    <div v-else-if="currentView === 'loading'" class="page loading">
      <div class="spinner"></div>
      <p>AI正在生成...</p>
      <p class="sub">以【{{ selectedPersona }}】的口吻</p>
    </div>
    
    <!-- 结果页 -->
    <div v-else-if="currentView === 'result'" class="page result">
      <header class="header-simple">
        <button class="back" @click="goBack">← 返回</button>
        <h2>为您生成的高情商回复</h2>
        <button class="regen" @click="regenerate">🔄 换一换</button>
      </header>
      <main class="replies">
        <div v-for="(r, i) in generatedReplies" :key="i" class="card">
          <div class="head"><span class="icon">{{ i === 0 ? '🔮' : i === 1 ? '🎭' : '💖' }}</span><span class="type">{{ r.style || r.type }}</span></div>
          <div class="content">{{ r.content }}</div>
          <div class="acts"><button class="copy" @click="copy(r.content)">📋 复制使用</button><button class="fav" @click="addFavorite(r.content, r.style || r.type)">⭐</button></div>
        </div>
      </main>
    </div>
    
    <!-- 收藏页 -->
    <div v-else-if="currentView === 'favorites'" class="page">
      <header class="header-simple">
        <button class="back" @click="goBack">← 返回</button>
        <h2>我的语料库 ({{ favorites.length }})</h2>
        <span></span>
      </header>
      <main class="favorites">
        <div v-if="favorites.length === 0" class="empty">
          <div class="icon">📚</div>
          <p>还没有收藏的话术</p>
          <p class="sub">生成后点击 ⭐ 收藏</p>
        </div>
        <div v-else class="list">
          <div v-for="(f, i) in favorites" :key="i" class="fav-card">
            <div class="meta"><span class="type">{{ f.type }}</span><span class="persona">{{ f.persona }}</span></div>
            <div class="text">{{ f.content }}</div>
            <div class="acts"><button @click="copy(f.content)">📋 复制</button><button class="del" @click="favorites.splice(i, 1); saveFavorites()">🗑️</button></div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- 添加人设页 -->
    <div v-else-if="currentView === 'addPersona'" class="page">
      <header class="header-simple">
        <button class="back" @click="goBack">← 返回</button>
        <h2>添加自定义人设</h2>
        <span></span>
      </header>
      <div class="form">
        <div class="item"><label>人设名称</label><input v-model="newPersona.name" placeholder="如：高冷御姐"></div>
        <div class="item"><label>Emoji图标</label><input v-model="newPersona.emoji" placeholder="如：🌹"></div>
        <div class="item"><label>人设描述</label><textarea v-model="newPersona.desc" placeholder="描述特点..." rows="3"></textarea></div>
        <button class="submit" @click="addPersona">✅ 确认添加</button>
      </div>
    </div>
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { max-width: 480px; margin: 0 auto; background: #1a1a1a; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.app { min-height: 100vh; background: #1a1a1a; }
.page { min-height: 100vh; }
.toast { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); color: #fff; padding: 12px 24px; border-radius: 8px; z-index: 9999; font-size: 14px; }

/* Header */
.header-pink { background: linear-gradient(135deg, #ff6b9d 0%, #e85d8a 100%); padding: 16px; }
.header-top { display: flex; justify-content: space-between; align-items: center; }
.header-top .menu { font-size: 20px; }
.header-top h1 { font-size: 20px; font-weight: bold; }
.fav-btn { background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 8px 14px; border-radius: 20px; font-size: 14px; cursor: pointer; }

.header-simple { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #333; }
.header-simple .back { background: none; border: none; color: #ff6b9d; font-size: 14px; cursor: pointer; }
.header-simple h2 { font-size: 16px; font-weight: bold; }

/* Main */
.main { padding: 16px; }
.section { margin-bottom: 16px; }
.sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.sec-head span:first-child { font-size: 14px; font-weight: 500; }
.sec-head .opt { font-size: 12px; color: #888; }
.sec-head .sub { font-size: 12px; color: #888; }
.add { background: rgba(255,107,157,0.2); border: none; color: #ff6b9d; padding: 6px 12px; border-radius: 12px; font-size: 12px; cursor: pointer; }

/* Persona */
.persona-scroll { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; }
.persona-scroll::-webkit-scrollbar { display: none; }
.persona-card { flex-shrink: 0; width: 90px; padding: 14px 10px; background: #2a2a2a; border: 2px solid transparent; border-radius: 14px; text-align: center; cursor: pointer; }
.persona-card.active { border-color: #ff6b9d; background: rgba(255,107,157,0.1); }
.persona-card .emoji { font-size: 28px; display: block; margin-bottom: 6px; }
.persona-card .name { font-size: 12px; font-weight: bold; display: block; margin-bottom: 2px; }
.persona-card .desc { font-size: 10px; color: #888; }

/* Input */
.input-tabs { display: flex; gap: 8px; margin-bottom: 10px; }
.input-tabs button { flex: 1; padding: 10px; background: #2a2a2a; border: 1px solid #333; border-radius: 8px; color: #888; font-size: 14px; cursor: pointer; }
.input-tabs button.active { background: #ff6b9d; border-color: #ff6b9d; color: #fff; }
.text-box textarea { width: 100%; padding: 14px; background: #2a2a2a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px; resize: none; outline: none; }
.text-box textarea::placeholder { color: #666; }
.image-box .upload { display: flex; flex-direction: column; align-items: center; padding: 30px; background: #2a2a2a; border: 2px dashed #444; border-radius: 10px; cursor: pointer; }
.image-box .upload span { font-size: 14px; color: #888; }
.preview { position: relative; border-radius: 10px; overflow: hidden; }
.preview img { width: 100%; max-height: 180px; object-fit: cover; }
.preview .clear { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; background: rgba(0,0,0,0.7); border: none; border-radius: 50%; color: #fff; cursor: pointer; }

/* Buttons */
.btn-paste { width: 100%; padding: 14px; margin-bottom: 14px; background: linear-gradient(90deg, #667eea, #764ba2, #667eea); background-size: 200% 100%; border: none; border-radius: 10px; color: #fff; font-size: 15px; font-weight: bold; cursor: pointer; animation: shimmer 2s infinite; }
.btn-generate { width: 100%; padding: 16px; margin-bottom: 14px; background: linear-gradient(90deg, #ff6b9d, #e85d8a); border: none; border-radius: 10px; color: #fff; font-size: 17px; font-weight: bold; cursor: pointer; }
.btn-generate:disabled { opacity: 0.5; }
.shine { animation: pulse 1.5s infinite; }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* Scene */
.scene-box { display: flex; flex-direction: column; gap: 8px; }
.cat { display: flex; align-items: center; gap: 8px; }
.cat .label { width: 36px; font-size: 11px; color: #888; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; flex: 1; }
.tags button { padding: 6px 12px; background: #2a2a2a; border: 1px solid #333; border-radius: 14px; color: #ccc; font-size: 12px; cursor: pointer; }
.tags button.active { background: #ff6b9d; border-color: #ff6b9d; color: #fff; }

/* Proactive */
.proactive-btns { display: flex; flex-wrap: wrap; gap: 8px; }
.proactive-btns button { padding: 10px 16px; background: rgba(255,107,157,0.15); border: 1px solid rgba(255,107,157,0.4); border-radius: 18px; color: #ff6b9d; font-size: 13px; cursor: pointer; }

/* Daily Pickup */
.daily-pickup { background: rgba(255,215,0,0.08); border: 1px solid rgba(255,215,0,0.25); border-radius: 10px; padding: 12px 14px; }
.daily-pickup .head { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.daily-pickup .head span:first-child { color: #ffd700; font-weight: 500; }
.daily-pickup .head .acts { display: flex; gap: 8px; }
.daily-pickup .head button { background: none; border: none; color: #ffd700; cursor: pointer; }
.daily-pickup .list { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,215,0,0.15); }
.item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255,215,0,0.1); }
.item:last-child { border-bottom: none; }
.item p { flex: 1; font-size: 14px; }
.item .acts { display: flex; gap: 6px; }
.item .acts button { padding: 5px 10px; background: rgba(255,215,0,0.15); border: none; border-radius: 5px; color: #ffd700; font-size: 12px; cursor: pointer; }

/* Loading */
.loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 100px; }
.spinner { width: 50px; height: 50px; border: 4px solid #333; border-top-color: #ff6b9d; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading p { font-size: 16px; margin-bottom: 8px; }
.loading .sub { font-size: 14px; color: #888; }

/* Result */
.result .replies { padding: 16px; }
.card { background: #2a2a2a; border-radius: 14px; padding: 16px; margin-bottom: 14px; }
.card .head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.card .head .icon { font-size: 18px; }
.card .head .type { color: #ff6b9d; font-weight: bold; }
.card .content { font-size: 15px; line-height: 1.7; background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; margin-bottom: 12px; }
.card .acts { display: flex; gap: 8px; }
.card .acts .copy { flex: 1; padding: 12px; background: #ff6b9d; border: none; border-radius: 8px; color: #fff; font-size: 15px; cursor: pointer; }
.card .acts .fav { width: 44px; padding: 12px; background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.3); border-radius: 8px; color: #ffd700; font-size: 16px; cursor: pointer; }
.regen { background: none; border: none; color: #888; font-size: 13px; cursor: pointer; }

/* Favorites */
.favorites { padding: 16px; }
.empty { text-align: center; padding: 60px 20px; }
.empty .icon { font-size: 48px; margin-bottom: 16px; }
.empty p { color: #666; }
.empty .sub { color: #888; margin-top: 8px; }
.fav-card { background: #2a2a2a; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
.fav-card .meta { display: flex; gap: 10px; margin-bottom: 6px; }
.fav-card .type { color: #ff6b9d; font-size: 12px; font-weight: bold; }
.fav-card .persona { color: #888; font-size: 12px; }
.fav-card .text { font-size: 14px; line-height: 1.6; margin-bottom: 10px; }
.fav-card .acts { display: flex; gap: 8px; }
.fav-card .acts button { flex: 1; padding: 10px; background: rgba(255,255,255,0.1); border: none; border-radius: 6px; color: #fff; cursor: pointer; }
.fav-card .acts .del { background: rgba(255,0,0,0.15); color: #ff6b9d; }

/* Form */
.form { padding: 20px; }
.form .item { margin-bottom: 16px; }
.form label { display: block; font-size: 13px; color: #888; margin-bottom: 6px; }
.form input, .form textarea { width: 100%; padding: 12px; background: #2a2a2a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 15px; outline: none; }
.form input::placeholder, .form textarea::placeholder { color: #666; }
.submit { width: 100%; padding: 14px; background: #ff6b9d; border: none; border-radius: 10px; color: #fff; font-size: 16px; font-weight: bold; cursor: pointer; }
</style>