"use client"

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function WaveStars() {
  const pointsRef = useRef<THREE.Points>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const targetMousePos = useRef({ x: 0, y: 0 })
  const count = 15000

  const particles = useRef({
    positions: new Float32Array(count * 3),
    velocities: new Float32Array(count * 3),
    originalPositions: new Float32Array(count * 3),
    colors: new Float32Array(count * 3),
    sizes: new Float32Array(count),
  }).current

  const { viewport } = useThree()

  useEffect(() => {
    // Cosmic color palette
    const cosmicColors = [
      new THREE.Color(0xffffff), // White
      new THREE.Color(0xadd8e6), // Light Blue
      new THREE.Color(0x87ceeb), // Sky Blue
      new THREE.Color(0xffa07a), // Light Orange
      new THREE.Color(0xffb6c1), // Light Pink
      new THREE.Color(0xe6e6fa), // Lavender
      new THREE.Color(0xffd700), // Gold
      new THREE.Color(0xfff8dc), // Cornsilk
      new THREE.Color(0xb0e0e6), // Powder Blue
      new THREE.Color(0xffefd5), // Papaya Whip
    ]

    // Initialize particles
    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      const x = (Math.random() - 0.5) * 100
      const z = (Math.random() - 0.5) * 100 - 30 // Push stars further back
      const waveY = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 8
      const y = waveY + (Math.random() - 0.5) * 5

      particles.positions[i3] = x
      particles.positions[i3 + 1] = y
      particles.positions[i3 + 2] = z

      particles.originalPositions[i3] = x
      particles.originalPositions[i3 + 1] = y
      particles.originalPositions[i3 + 2] = z

      particles.velocities[i3] = (Math.random() - 0.5) * 0.01
      particles.velocities[i3 + 1] = (Math.random() - 0.5) * 0.01
      particles.velocities[i3 + 2] = (Math.random() - 0.5) * 0.01

      // Assign random cosmic color
      const color = cosmicColors[Math.floor(Math.random() * cosmicColors.length)]
      particles.colors[i3] = color.r
      particles.colors[i3 + 1] = color.g
      particles.colors[i3 + 2] = color.b

      // Random sizes for variety
      particles.sizes[i] = Math.random() * 0.15 + 0.05
    }

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      targetMousePos.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime()

      // Smooth mouse position interpolation
      mousePos.current.x += (targetMousePos.current.x - mousePos.current.x) * 0.05
      mousePos.current.y += (targetMousePos.current.y - mousePos.current.y) * 0.05

      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array

      // Convert mouse position to world coordinates
      const mouseX = mousePos.current.x * viewport.width / 2
      const mouseY = mousePos.current.y * viewport.height / 2

      for (let i = 0; i < count; i++) {
        const i3 = i * 3

        const origX = particles.originalPositions[i3]
        const origY = particles.originalPositions[i3 + 1]
        const origZ = particles.originalPositions[i3 + 2]

        // Base wave motion
        const wave1 = Math.sin(origX * 0.08 + time * 0.6) * Math.cos(origZ * 0.08 + time * 0.4)
        const wave2 = Math.sin(origX * 0.05 - time * 0.5) * Math.cos(origZ * 0.06 - time * 0.3)
        const wave3 = Math.sin(origX * 0.03 + origZ * 0.03 + time * 0.7)
        const combinedWave = (wave1 * 4 + wave2 * 3 + wave3 * 2)

        // Calculate distance from mouse (in 2D space)
        const dx = positions[i3] - mouseX
        const dy = positions[i3 + 1] - mouseY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 15

        // Create ripple effect when mouse is near
        let rippleEffect = 0
        if (distance < maxDistance) {
          const rippleStrength = 1 - distance / maxDistance
          const rippleWave = Math.sin(distance * 0.5 - time * 3) * rippleStrength
          rippleEffect = rippleWave * 3
        }

        // Mouse displacement effect (water-like push)
        let mouseDisplacementX = 0
        let mouseDisplacementY = 0
        let mouseDisplacementZ = 0

        if (distance < maxDistance) {
          const pushStrength = (1 - distance / maxDistance) * 2
          mouseDisplacementX = (dx / distance) * pushStrength
          mouseDisplacementY = (dy / distance) * pushStrength
          mouseDisplacementZ = Math.sin(distance * 0.3 - time * 2) * pushStrength
        }

        // Apply all effects
        positions[i3] = origX + mouseDisplacementX + particles.velocities[i3] * 50
        positions[i3 + 1] = combinedWave + Math.sin(time * 0.5 + i * 0.001) * 2 + rippleEffect + mouseDisplacementY
        positions[i3 + 2] = origZ + mouseDisplacementZ + particles.velocities[i3 + 2] * 50

        // Subtle continuous drift
        particles.velocities[i3] += (Math.random() - 0.5) * 0.0001
        particles.velocities[i3 + 2] += (Math.random() - 0.5) * 0.0001

        // Keep velocities small
        particles.velocities[i3] = Math.max(-0.02, Math.min(0.02, particles.velocities[i3]))
        particles.velocities[i3 + 2] = Math.max(-0.02, Math.min(0.02, particles.velocities[i3 + 2]))
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true
      pointsRef.current.rotation.y = time * 0.02
    }
  })

  // Create circular texture for stars
  const starTexture = useRef<THREE.Texture>()

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')!

    // Create radial gradient for glow effect
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)

    starTexture.current = new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        map={starTexture.current}
        alphaTest={0.01}
      />
    </points>
  )
}

export default function CosmosVisualization() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <Canvas
        camera={{ position: [0, 5, 35], fov: 75 }}
        className="w-full h-full"
        gl={{ alpha: true, antialias: true }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 30, 120]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 10, 10]} intensity={0.5} />
        <WaveStars />
      </Canvas>

      {/* Gradient overlay for better content visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/85 pointer-events-none" />
    </div>
  )
}
