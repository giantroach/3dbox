import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'

export function useThreeBox(containerRef, options) {
  const {
    width, height, depth,
    rotationX, rotationY,
    cameraDistance,
    backgroundColor,
    frontImage, sideImage, topImage,
    showReflection
  } = options

  let scene, camera, renderer, box, reflectionBox, animationId
  let isDragging = false
  let previousMousePosition = { x: 0, y: 0 }
  const textureLoader = new THREE.TextureLoader()
  const loadedTextures = { front: null, side: null, top: null }

  const init = () => {
    if (!containerRef.value) return

    const container = containerRef.value
    const rect = container.getBoundingClientRect()

    // Scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color(backgroundColor.value)

    // Camera
    camera = new THREE.PerspectiveCamera(
      75,
      rect.width / rect.height,
      0.1,
      1000
    )
    camera.position.z = cameraDistance.value

    // Renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true
    })
    renderer.setSize(rect.width, rect.height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // Box
    createBox()

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
    directionalLight2.position.set(-5, -5, -5)
    scene.add(directionalLight2)

    // Events
    renderer.domElement.addEventListener('mousedown', onMouseDown)
    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('mouseup', onMouseUp)
    renderer.domElement.addEventListener('mouseleave', onMouseUp)
    renderer.domElement.addEventListener('touchstart', onTouchStart)
    renderer.domElement.addEventListener('touchmove', onTouchMove)
    renderer.domElement.addEventListener('touchend', onTouchEnd)
    window.addEventListener('resize', onResize)

    animate()
  }

  const loadTexture = (url) => {
    return new Promise((resolve) => {
      if (!url) {
        resolve(null)
        return
      }
      textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          resolve(texture)
        },
        undefined,
        () => resolve(null)
      )
    })
  }

  const createMaterials = async () => {
    // Load textures if URLs provided
    const [frontTex, sideTex, topTex] = await Promise.all([
      loadTexture(frontImage.value),
      loadTexture(sideImage.value),
      loadTexture(topImage.value)
    ])

    loadedTextures.front = frontTex
    loadedTextures.side = sideTex
    loadedTextures.top = topTex

    const createMaterial = (texture, color) => {
      if (texture) {
        return new THREE.MeshPhongMaterial({ map: texture })
      }
      return new THREE.MeshPhongMaterial({ color })
    }

    // Order: right, left, top, bottom, front, back
    return [
      createMaterial(sideTex, 0x4a90d9),   // right
      createMaterial(sideTex, 0x4a90d9),   // left
      createMaterial(topTex, 0x6ab04c),    // top
      createMaterial(topTex, 0x6ab04c),    // bottom
      createMaterial(frontTex, 0xe17055),  // front
      createMaterial(frontTex, 0xe17055)   // back
    ]
  }

  const createReflectionMaterials = () => {
    const createMaterial = (texture, color) => {
      if (texture) {
        return new THREE.MeshPhongMaterial({
          map: texture,
          transparent: true,
          opacity: 0.3
        })
      }
      return new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity: 0.3
      })
    }

    return [
      createMaterial(loadedTextures.side, 0x4a90d9),
      createMaterial(loadedTextures.side, 0x4a90d9),
      createMaterial(loadedTextures.top, 0x6ab04c),
      createMaterial(loadedTextures.top, 0x6ab04c),
      createMaterial(loadedTextures.front, 0xe17055),
      createMaterial(loadedTextures.front, 0xe17055)
    ]
  }

  const disposeBox = (targetBox) => {
    if (!targetBox) return

    scene.remove(targetBox)
    targetBox.geometry.dispose()
    if (Array.isArray(targetBox.material)) {
      targetBox.material.forEach(m => {
        if (m.map) m.map.dispose()
        m.dispose()
      })
    } else {
      if (targetBox.material.map) targetBox.material.map.dispose()
      targetBox.material.dispose()
    }
  }

  const createBox = async () => {
    // Dispose old boxes
    disposeBox(box)
    disposeBox(reflectionBox)
    box = null
    reflectionBox = null

    const geometry = new THREE.BoxGeometry(
      width.value,
      height.value,
      depth.value
    )

    const materials = await createMaterials()

    box = new THREE.Mesh(geometry, materials)
    box.rotation.x = rotationX.value
    box.rotation.y = rotationY.value
    scene.add(box)

    // Add edges
    const edges = new THREE.EdgesGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    const wireframe = new THREE.LineSegments(edges, lineMaterial)
    box.add(wireframe)

    // Create reflection if enabled
    if (showReflection.value) {
      createReflection()
    }
  }

  const createReflection = () => {
    if (!box) return

    disposeBox(reflectionBox)

    const geometry = new THREE.BoxGeometry(
      width.value,
      height.value,
      depth.value
    )

    const materials = createReflectionMaterials()

    reflectionBox = new THREE.Mesh(geometry, materials)

    // Position below the main box (mirrored)
    reflectionBox.position.y = -height.value - 0.01
    reflectionBox.scale.y = -1 // Flip vertically

    scene.add(reflectionBox)
  }

  const updateReflection = () => {
    if (showReflection.value) {
      if (!reflectionBox) {
        createReflection()
      }
      if (reflectionBox && box) {
        reflectionBox.rotation.x = -rotationX.value
        reflectionBox.rotation.y = rotationY.value
        reflectionBox.position.y = -height.value - 0.01
      }
    } else {
      disposeBox(reflectionBox)
      reflectionBox = null
    }
  }

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  const onMouseDown = (event) => {
    isDragging = true
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    }
  }

  const onMouseMove = (event) => {
    if (!isDragging || !box) return

    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y
    }

    rotationY.value += deltaMove.x * 0.01
    rotationX.value += deltaMove.y * 0.01

    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    }
  }

  const onMouseUp = () => {
    isDragging = false
  }

  const onTouchStart = (event) => {
    if (event.touches.length === 1) {
      isDragging = true
      previousMousePosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      }
    }
  }

  const onTouchMove = (event) => {
    if (!isDragging || !box || event.touches.length !== 1) return
    event.preventDefault()

    const deltaMove = {
      x: event.touches[0].clientX - previousMousePosition.x,
      y: event.touches[0].clientY - previousMousePosition.y
    }

    rotationY.value += deltaMove.x * 0.01
    rotationX.value += deltaMove.y * 0.01

    previousMousePosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    }
  }

  const onTouchEnd = () => {
    isDragging = false
  }

  const onResize = () => {
    if (!containerRef.value || !camera || !renderer) return

    const rect = containerRef.value.getBoundingClientRect()
    camera.aspect = rect.width / rect.height
    camera.updateProjectionMatrix()
    renderer.setSize(rect.width, rect.height)
  }

  const updateBoxDimensions = () => {
    if (box) {
      createBox()
    }
  }

  const updateRotation = () => {
    if (box) {
      box.rotation.x = rotationX.value
      box.rotation.y = rotationY.value
    }
    if (reflectionBox) {
      reflectionBox.rotation.x = -rotationX.value
      reflectionBox.rotation.y = rotationY.value
    }
  }

  const updateCameraDistance = () => {
    if (camera) {
      camera.position.z = cameraDistance.value
    }
  }

  const updateBackgroundColor = () => {
    if (scene) {
      scene.background = new THREE.Color(backgroundColor.value)
    }
  }

  const updateTextures = () => {
    if (box) {
      createBox()
    }
  }

  const exportPNG = () => {
    if (!renderer) return null
    renderer.render(scene, camera)
    return renderer.domElement.toDataURL('image/png')
  }

  const dispose = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }

    if (renderer) {
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      renderer.domElement.removeEventListener('mouseup', onMouseUp)
      renderer.domElement.removeEventListener('mouseleave', onMouseUp)
      renderer.domElement.removeEventListener('touchstart', onTouchStart)
      renderer.domElement.removeEventListener('touchmove', onTouchMove)
      renderer.domElement.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('resize', onResize)

      if (containerRef.value && renderer.domElement.parentNode) {
        containerRef.value.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }

    disposeBox(box)
    disposeBox(reflectionBox)
  }

  // Watchers
  watch([width, height, depth], updateBoxDimensions)
  watch([rotationX, rotationY], updateRotation)
  watch(cameraDistance, updateCameraDistance)
  watch(backgroundColor, updateBackgroundColor)
  watch([frontImage, sideImage, topImage], updateTextures)
  watch(showReflection, updateReflection)

  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    dispose()
  })

  return {
    exportPNG
  }
}
