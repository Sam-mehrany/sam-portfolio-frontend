"use client"

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

interface Star {
  x: number
  y: number
  z: number
  magnitude: number
  color: string
  name: string
}

interface StarsData {
  stars: Star[]
}

function WavyStars() {
  const pointsRef = useRef<THREE.Points>(null)
  const [starData, setStarData] = useState<Star[]>([])

  useEffect(() => {
    // Load star data from JSON
    fetch('/data.json')
      .then(res => res.json())
      .then((data: StarsData) => {
        setStarData(data.stars)
      })
      .catch(err => console.error('Error loading star data:', err))
  }, [])

  // Create positions array for stars
  const positions = new Float32Array(starData.length * 3)
  const colors = new Float32Array(starData.length * 3)
  const sizes = new Float32Array(starData.length)

  starData.forEach((star, i) => {
    positions[i * 3] = star.x
    positions[i * 3 + 1] = star.y
    positions[i * 3 + 2] = star.z

    // Convert hex color to RGB
    const color = new THREE.Color(star.color)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b

    // Size based on magnitude (brighter stars are bigger)
    sizes[i] = (3 - star.magnitude) * 0.05
  })

  // Animate with wavy motion
  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime()

      // Get position attribute
      const positionAttribute = pointsRef.current.geometry.attributes.position
      const positions = positionAttribute.array as Float32Array

      // Apply wavy motion to each star
      for (let i = 0; i < starData.length; i++) {
        const i3 = i * 3
        const originalX = starData[i].x
        const originalY = starData[i].y
        const originalZ = starData[i].z

        // Create wavy effect with sine waves
        const waveX = Math.sin(time * 0.5 + originalY * 0.3) * 0.3
        const waveY = Math.sin(time * 0.3 + originalX * 0.5) * 0.3
        const waveZ = Math.sin(time * 0.4 + originalX * 0.2 + originalY * 0.2) * 0.2

        positions[i3] = originalX + waveX
        positions[i3 + 1] = originalY + waveY
        positions[i3 + 2] = originalZ + waveZ
      }

      positionAttribute.needsUpdate = true

      // Slow rotation of entire star field
      pointsRef.current.rotation.y = time * 0.05
    }
  })

  if (starData.length === 0) return null

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
      <bufferAttribute
        attach="geometry-attributes-color"
        count={colors.length / 3}
        array={colors}
        itemSize={3}
      />
    </Points>
  )
}

export default function CosmosVisualization() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-b from-background via-slate-950/50 to-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading cosmos...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-[400px] md:h-[500px] relative overflow-hidden bg-gradient-to-b from-background via-slate-950/50 to-background">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        className="w-full h-full"
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <WavyStars />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      {/* Overlay text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white/90 mb-2">
            Explore the Cosmos
          </h2>
          <p className="text-sm md:text-base text-white/70">
            Interactive star field visualization • Drag to explore
          </p>
        </div>
      </div>
    </div>
  )
}
