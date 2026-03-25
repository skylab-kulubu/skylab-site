"use client"

import React, { useEffect, useRef } from "react"
import { useWebGL } from "@/hooks/use-webgl"
import { UNIVERSE_SHADER_HIGH, UNIVERSE_SHADER_LOW } from "./shaders"
import { DeviceTier } from "@/hooks/use-device-tier"

interface UniverseWebGLProps {
  tier: DeviceTier
  speed: number
  density: number
  frequency?: number
  amplitude?: number
  seed: number
  starSize: number
  revealDuration?: number
  onError: () => void
}

const SCALE_MAP: Record<DeviceTier, number> = {
  high: 0.65,
  low: 0.4,
  fallback: 1.0,
}

export default function UniverseWebGL({
  tier,
  speed,
  density,
  frequency = 1.0,
  amplitude = 1.0,
  seed,
  starSize,
  revealDuration = 3.0,
  onError,
}: UniverseWebGLProps) {
  const shader = tier === "high" ? UNIVERSE_SHADER_HIGH : UNIVERSE_SHADER_LOW
  const renderScale = SCALE_MAP[tier] ?? 0.5

  const uniformsRef = useRef({
    u_speed: speed,
    u_density: density,
    u_frequency: frequency,
    u_amplitude: amplitude,
    u_seed: seed,
    u_starSize: starSize,
    u_revealDuration: revealDuration,
    u_scrollY: 0,
  })

  useEffect(() => {
    uniformsRef.current.u_speed = speed
    uniformsRef.current.u_density = density
    uniformsRef.current.u_frequency = frequency
    uniformsRef.current.u_amplitude = amplitude
    uniformsRef.current.u_seed = seed
    uniformsRef.current.u_starSize = starSize
    uniformsRef.current.u_revealDuration = revealDuration
  }, [speed, density, frequency, amplitude, seed, starSize, revealDuration])

  useEffect(() => {
    let rafId: number
    let alive = true

    const syncScroll = () => {
      if (!alive) return
      uniformsRef.current.u_scrollY = window.scrollY * renderScale
      rafId = requestAnimationFrame(syncScroll)
    }

    rafId = requestAnimationFrame(syncScroll)
    return () => {
      alive = false
      cancelAnimationFrame(rafId)
    }
  }, [renderScale])

  const { canvasRef, status } = useWebGL({
    fragmentShader: shader,
    uniforms: uniformsRef.current,
    onError,
    renderScale,
    noiseSeed: seed,
  })

  if (status === "error") return null

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
}