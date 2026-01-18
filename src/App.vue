<script setup>
import { ref, onMounted } from 'vue'
import { useThreeBox } from './composables/useThreeBox'

const canvasContainer = ref(null)
const presets = ref([])
const selectedPreset = ref('default')

const width = ref(1)
const height = ref(1)
const depth = ref(1)
const rotationX = ref(0.5)
const rotationY = ref(0.5)
const cameraDistance = ref(5)
const backgroundColor = ref('#1a1a2e')
const showReflection = ref(false)

const frontImage = ref('')
const sideImage = ref('')
const topImage = ref('')

const { exportPNG } = useThreeBox(canvasContainer, {
  width,
  height,
  depth,
  rotationX,
  rotationY,
  cameraDistance,
  backgroundColor,
  frontImage,
  sideImage,
  topImage,
  showReflection
})

const loadPresets = async () => {
  try {
    const response = await fetch('/presets.json')
    const data = await response.json()
    presets.value = data.presets
    applyPreset('default')
  } catch (error) {
    console.error('Failed to load presets:', error)
  }
}

const applyPreset = (presetName) => {
  const preset = presets.value.find(p => p.name === presetName)
  if (preset) {
    width.value = preset.width
    height.value = preset.height
    depth.value = preset.depth
    rotationX.value = preset.rotationX
    rotationY.value = preset.rotationY
    cameraDistance.value = preset.cameraDistance
    selectedPreset.value = presetName
  }
}

const handleFileSelect = (event, target) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (target === 'front') {
        frontImage.value = e.target.result
      } else if (target === 'side') {
        sideImage.value = e.target.result
      } else if (target === 'top') {
        topImage.value = e.target.result
      }
    }
    reader.readAsDataURL(file)
  }
}

const clearImage = (target) => {
  if (target === 'front') {
    frontImage.value = ''
  } else if (target === 'side') {
    sideImage.value = ''
  } else if (target === 'top') {
    topImage.value = ''
  }
}

const handleExportPNG = () => {
  const dataURL = exportPNG()
  if (dataURL) {
    const link = document.createElement('a')
    link.download = '3dbox.png'
    link.href = dataURL
    link.click()
  }
}

onMounted(() => {
  loadPresets()
})
</script>

<template>
  <div class="app">
    <aside class="sidebar">
      <h1 class="title">3D Box</h1>

      <div class="control-group">
        <label class="label">プリセット</label>
        <select v-model="selectedPreset" @change="applyPreset(selectedPreset)" class="select">
          <option v-for="preset in presets" :key="preset.name" :value="preset.name">
            {{ preset.label }}
          </option>
        </select>
      </div>

      <div class="section-title">サイズ</div>

      <div class="control-group">
        <label class="label">幅 (Width): {{ width.toFixed(2) }}</label>
        <input type="range" v-model.number="width" min="0.1" max="5" step="0.01" class="slider" />
      </div>

      <div class="control-group">
        <label class="label">高さ (Height): {{ height.toFixed(2) }}</label>
        <input type="range" v-model.number="height" min="0.1" max="5" step="0.01" class="slider" />
      </div>

      <div class="control-group">
        <label class="label">奥行 (Depth): {{ depth.toFixed(2) }}</label>
        <input type="range" v-model.number="depth" min="0.1" max="5" step="0.01" class="slider" />
      </div>

      <div class="section-title">回転・カメラ</div>

      <div class="control-group">
        <label class="label">縦回転 (X): {{ rotationX.toFixed(2) }} rad</label>
        <input type="range" v-model.number="rotationX" min="-3.14" max="3.14" step="0.01" class="slider" />
      </div>

      <div class="control-group">
        <label class="label">横回転 (Y): {{ rotationY.toFixed(2) }} rad</label>
        <input type="range" v-model.number="rotationY" min="-3.14" max="3.14" step="0.01" class="slider" />
      </div>

      <div class="control-group">
        <label class="label">カメラ距離: {{ cameraDistance.toFixed(1) }}</label>
        <input type="range" v-model.number="cameraDistance" min="1" max="15" step="0.1" class="slider" />
      </div>

      <div class="section-title">テクスチャ</div>

      <div class="control-group">
        <label class="label">前面画像</label>
        <div class="file-input-wrapper">
          <input type="file" accept="image/*" @change="handleFileSelect($event, 'front')" class="file-input" />
          <button v-if="frontImage" @click="clearImage('front')" class="clear-button">×</button>
        </div>
        <div v-if="frontImage" class="image-preview">
          <img :src="frontImage" alt="Front" />
        </div>
      </div>

      <div class="control-group">
        <label class="label">側面画像</label>
        <div class="file-input-wrapper">
          <input type="file" accept="image/*" @change="handleFileSelect($event, 'side')" class="file-input" />
          <button v-if="sideImage" @click="clearImage('side')" class="clear-button">×</button>
        </div>
        <div v-if="sideImage" class="image-preview">
          <img :src="sideImage" alt="Side" />
        </div>
      </div>

      <div class="control-group">
        <label class="label">上面画像</label>
        <div class="file-input-wrapper">
          <input type="file" accept="image/*" @change="handleFileSelect($event, 'top')" class="file-input" />
          <button v-if="topImage" @click="clearImage('top')" class="clear-button">×</button>
        </div>
        <div v-if="topImage" class="image-preview">
          <img :src="topImage" alt="Top" />
        </div>
      </div>

      <div class="section-title">表示設定</div>

      <div class="control-group">
        <label class="label">背景色</label>
        <div class="color-input-wrapper">
          <input type="color" v-model="backgroundColor" class="color-input" />
          <input type="text" v-model="backgroundColor" class="color-text" />
        </div>
      </div>

      <div class="control-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="showReflection" class="checkbox" />
          <span>鏡面エフェクトを表示</span>
        </label>
      </div>

      <button @click="handleExportPNG" class="export-button">
        PNGとして保存
      </button>
    </aside>

    <main class="canvas-area" ref="canvasContainer"></main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  width: 100%;
  height: 100vh;
}

.sidebar {
  width: 300px;
  min-width: 300px;
  background-color: #16213e;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #fff;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #4a90d9;
  margin-top: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #3a3a5a;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 13px;
  color: #b8b8b8;
}

.select {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #3a3a5a;
  background-color: #1a1a2e;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.select:focus {
  outline: none;
  border-color: #4a90d9;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #3a3a5a;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4a90d9;
  cursor: pointer;
  transition: background 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  background: #5da0e9;
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4a90d9;
  cursor: pointer;
  border: none;
}

.file-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.file-input {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #3a3a5a;
  background-color: #1a1a2e;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.file-input::file-selector-button {
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  background-color: #4a90d9;
  color: white;
  cursor: pointer;
  margin-right: 8px;
}

.clear-button {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  background-color: #e17055;
  color: white;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button:hover {
  background-color: #d35d47;
}

.image-preview {
  width: 100%;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #1a1a2e;
  border: 1px solid #3a3a5a;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.color-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input {
  width: 50px;
  height: 36px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: none;
}

.color-text {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #3a3a5a;
  background-color: #1a1a2e;
  color: #fff;
  font-size: 13px;
  font-family: monospace;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #b8b8b8;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4a90d9;
}

.export-button {
  margin-top: auto;
  padding: 14px 20px;
  background-color: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.export-button:hover {
  background-color: #5da0e9;
}

.canvas-area {
  flex: 1;
  background-color: #1a1a2e;
  position: relative;
}
</style>
