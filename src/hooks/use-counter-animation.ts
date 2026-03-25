"use client"

import { useEffect, useState } from "react"

export function useCounterAnimation(
  end: number,
  duration: number = 2000,
  start: number = 0,
  delay: number = 0,
  isVisible: boolean = false
) {
  const [count, setCount] = useState(start)

  useEffect(() => {
    if (!isVisible) {
      setCount(start)
      return
    }

    let startTimestamp: number | null = null
    let frameId: number

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      setCount(Math.floor(easeProgress * (end - start) + start))
      
      if (progress < 1) {
        frameId = window.requestAnimationFrame(step)
      }
    }

    const timer = setTimeout(() => {
      frameId = window.requestAnimationFrame(step)
    }, delay + 600)

    return () => {
      clearTimeout(timer)
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [end, duration, start, delay, isVisible])

  return count
}