import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'

export function useThreeBox(containerRef, options) {
  const { width, height, depth, rotationX, rotationY, cameraDistance } = options

  let scene, camera, renderer, box, animationId
  let isDragging = false
  let previousMousePosition = { x: 0, y: 0 }

  const init = () => {
    if (!containerRef.value) return

    const container = containerRef.value
    const rect = container.getBoundingClientRect()

    // Scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5)
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

  const createBox = () => {
    if (box) {
      scene.remove(box)
      box.geometry.dispose()
      if (Array.isArray(box.material)) {
        box.material.forEach(m => m.dispose())
      } else {
        box.material.dispose()
      }
    }

    const geometry = new THREE.BoxGeometry(
      width.value,
      height.value,
      depth.value
    )

    const materials = [
      new THREE.MeshPhongMaterial({ color: 0x4a90d9 }), // right
      new THREE.MeshPhongMaterial({ color: 0x4a90d9 }), // left
      new THREE.MeshPhongMaterial({ color: 0x6ab04c }), // top
      new THREE.MeshPhongMaterial({ color: 0x6ab04c }), // bottom
      new THREE.MeshPhongMaterial({ color: 0xe17055 }), // front
      new THREE.MeshPhongMaterial({ color: 0xe17055 })  // back
    ]

    box = new THREE.Mesh(geometry, materials)
    box.rotation.x = rotationX.value
    box.rotation.y = rotationY.value
    scene.add(box)

    // Add edges
    const edges = new THREE.EdgesGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    const wireframe = new THREE.LineSegments(edges, lineMaterial)
    box.add(wireframe)
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
  }

  const updateCameraDistance = () => {
    if (camera) {
      camera.position.z = cameraDistance.value
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

    if (box) {
      box.geometry.dispose()
      if (Array.isArray(box.material)) {
        box.material.forEach(m => m.dispose())
      } else {
        box.material.dispose()
      }
    }
  }

  // Watchers
  watch([width, height, depth], updateBoxDimensions)
  watch([rotationX, rotationY], updateRotation)
  watch(cameraDistance, updateCameraDistance)

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
