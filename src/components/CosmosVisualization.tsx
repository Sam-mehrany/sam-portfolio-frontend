"use client"

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function WaveStars() {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 15000 // Number of stars

  // Create wave-like distribution of stars
  const particles = useRef({
    positions: new Float32Array(count * 3),
    velocities: new Float32Array(count * 3),
  }).current

  useEffect(() => {
    // Initialize particles in wave formation
    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Spread across width and depth
      const x = (Math.random() - 0.5) * 80
      const z = (Math.random() - 0.5) * 80

      // Create wave patterns
      const waveY = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 8
      const y = waveY + (Math.random() - 0.5) * 5

      particles.positions[i3] = x
      particles.positions[i3 + 1] = y
      particles.positions[i3 + 2] = z

      // Random velocities for flowing effect
      particles.velocities[i3] = (Math.random() - 0.5) * 0.02
      particles.velocities[i3 + 1] = (Math.random() - 0.5) * 0.02
      particles.velocities[i3 + 2] = (Math.random() - 0.5) * 0.02
    }
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime()
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < count; i++) {
        const i3 = i * 3

        const x = particles.positions[i3]
        const z = particles.positions[i3 + 2]

        // Create flowing wave motion
        const wave1 = Math.sin(x * 0.08 + time * 0.6) * Math.cos(z * 0.08 + time * 0.4)
        const wave2 = Math.sin(x * 0.05 - time * 0.5) * Math.cos(z * 0.06 - time * 0.3)
        const wave3 = Math.sin(x * 0.03 + z * 0.03 + time * 0.7)

        // Combine multiple wave frequencies
        const combinedWave = (wave1 * 4 + wave2 * 3 + wave3 * 2)

        // Update Y position with wave motion
        positions[i3] = x
        positions[i3 + 1] = combinedWave + Math.sin(time * 0.5 + i * 0.001) * 2
        positions[i3 + 2] = z

        // Subtle drift
        particles.positions[i3] += particles.velocities[i3]
        particles.positions[i3 + 2] += particles.velocities[i3 + 2]

        // Wrap around boundaries
        if (Math.abs(particles.positions[i3]) > 40) {
          particles.positions[i3] *= -1
        }
        if (Math.abs(particles.positions[i3 + 2]) > 40) {
          particles.positions[i3 + 2] *= -1
        }
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true

      // Gentle rotation
      pointsRef.current.rotation.y = time * 0.03
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
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
    return (
      <div className="w-full h-[400px] md:h-[600px] bg-gradient-to-b from-background via-slate-950/80 to-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading wave visualization...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-[400px] md:h-[600px] relative overflow-hidden bg-gradient-to-b from-background via-slate-950/80 to-background">
      <Canvas
        camera={{ position: [0, 5, 30], fov: 75 }}
        className="w-full h-full"
        gl={{ alpha: true, antialias: true }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 20, 100]} />

        <ambientLight intensity={0.3} />
        <pointLight position={[0, 10, 10]} intensity={0.5} />

        <WaveStars />
      </Canvas>

      {/* Overlay gradient for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/30 pointer-events-none" />

      {/* Centered text overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white/90 mb-3 tracking-tight">
            Flowing Through Space
          </h2>
          <p className="text-sm md:text-lg text-white/60 max-w-2xl mx-auto">
            Experience the cosmic waves • Thousands of stars in motion
          </p>
        </div>
      </div>
    </div>
  )
}
