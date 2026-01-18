# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

3D box rendering web application using Vite + Vue 3 + Three.js. Users can specify dimensions (height, width, depth) to render a 3D box that can be rotated via drag interaction.

## Build Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:5173/)
npm run build        # Build for production
npm run preview      # Preview production build
```

## Architecture

```
src/
├── main.js                    # Vue app entry point
├── App.vue                    # Main component with UI controls and 3D canvas
├── style.css                  # Global styles
└── composables/
    └── useThreeBox.js         # Three.js scene management composable
public/
└── presets.json               # Preset configurations for box dimensions
```

### Key Components

- **App.vue**: Contains sidebar with controls (presets, dimensions, rotation, camera distance, textures, background color, reflection toggle) and the 3D canvas area
- **useThreeBox.js**: Composable that manages Three.js scene, camera, renderer, box mesh with textures, reflection effect, drag rotation, and PNG export

### Features

- Box dimension controls (width, height, depth)
- Rotation controls (X/Y axis) with drag interaction
- Camera distance adjustment
- Texture support for front, side, and top faces (loaded via FileReader)
- Background color picker
- Mirror reflection effect (toggleable)
- PNG export

### Preset Configuration

Edit `public/presets.json` to add/modify presets. Each preset includes:
- `name`: Internal identifier
- `label`: Display name (Japanese)
- `width`, `height`, `depth`: Box dimensions
- `rotationX`, `rotationY`: Initial rotation angles (radians)
- `cameraDistance`: Camera Z position
