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

const { exportPNG } = useThreeBox(canvasContainer, {
  width,
  height,
  depth,
  rotationX,
  rotationY,
  cameraDistance
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

      <div class="control-group">
        <label class="label">幅 (Width): {{ width.toFixed(2) }}</label>
        <input type="range" v-model.number="width" min="0.1" max="5" step="0.1" class="slider" />
      </div>

      <div class="control-group">
        <label class="label">高さ (Height): {{ height.toFixed(2) }}</label>
        <input type="range" v-model.number="height" min="0.1" max="5" step="0.1" class="slider" />
      </div>

      <div class="control-group">
        <label class="label">奥行 (Depth): {{ depth.toFixed(2) }}</label>
        <input type="range" v-model.number="depth" min="0.1" max="5" step="0.1" class="slider" />
      </div>

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
        <input type="range" v-model.number="cameraDistance" min="2" max="15" step="0.1" class="slider" />
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
  width: 280px;
  min-width: 280px;
  background-color: #16213e;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #fff;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
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
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4a90d9;
  cursor: pointer;
  transition: background 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  background: #5da0e9;
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4a90d9;
  cursor: pointer;
  border: none;
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
