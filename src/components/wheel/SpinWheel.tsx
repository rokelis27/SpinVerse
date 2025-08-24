'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WheelConfig, WheelSegment, SpinResult, WheelPhysics } from '@/types/wheel';
import { useWheelSettings } from '@/stores/settingsStore';
import { SPEED_PRESETS } from '@/types/settings';
import { selectWeightedSegment, calculateTargetAngle, getRarityIndicator, calculateSegmentProbabilities, findSegmentByAngle } from '@/utils/probabilityUtils';

interface SpinWheelProps {
  config: WheelConfig;
  onSpinComplete?: (result: SpinResult) => void;
  disabled?: boolean;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  config,
  onSpinComplete,
  disabled = false
}) => {
  const wheelSettings = useWheelSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [physics, setPhysics] = useState<WheelPhysics>({
    currentAngle: 0,
    velocity: 0,
    acceleration: 0,
    isSpinning: false
  });
  
  const [isIdleRotating, setIsIdleRotating] = useState(true);

  // Physics constants based on user settings
  const speedPreset = SPEED_PRESETS[wheelSettings.spinSpeed];
  const FRICTION = speedPreset.friction;
  const MIN_VELOCITY = speedPreset.minVelocity;
  const SPIN_POWER_MIN = speedPreset.minPower;
  const SPIN_POWER_MAX = speedPreset.maxPower;
  
  // Adjust suspense thresholds based on speed - turbo should skip most suspense
  const SUSPENSE_THRESHOLD = wheelSettings.spinSpeed === 'turbo' ? 0.01 : 
                            wheelSettings.spinSpeed === 'fast' ? 0.05 :
                            wheelSettings.spinSpeed === 'normal' ? 0.2 : 0.3;
  const FINAL_THRESHOLD = wheelSettings.spinSpeed === 'turbo' ? 0.005 : 
                         wheelSettings.spinSpeed === 'fast' ? 0.02 :
                         wheelSettings.spinSpeed === 'normal' ? 0.15 : 0.2;
  
  // Idle rotation constants
  const IDLE_SPEED = 0.005; // Very slow idle rotation speed 

  // Calculate proportional segment angles based on weights
  const segmentProbabilities = calculateSegmentProbabilities(config.segments);
  const segmentAngles = segmentProbabilities.map(prob => prob * 2 * Math.PI);

  // Enhanced colors for better visual appeal
  const getSegmentColor = (segment: WheelSegment, index: number): string => {
    if (segment.color) return segment.color;
    
    // Beautiful default gradient colors
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#EE5A24', '#0ABDE3', '#10AC84', '#F79F1F', '#A3CB38'
    ];
    return colors[index % colors.length];
  };

  // Get text color with good contrast
  const getTextColor = (bgColor: string): string => {
    // Simple contrast calculation
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  // Draw the wheel with enhanced visuals
  const drawWheel = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context for rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(physics.currentAngle);

    // Draw shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;

    // Draw segments with proportional angles
    let cumulativeAngle = 0;
    config.segments.forEach((segment, index) => {
      const startAngle = cumulativeAngle;
      const endAngle = startAngle + segmentAngles[index];
      cumulativeAngle = endAngle;
      
      const segmentColor = getSegmentColor(segment, index);
      const textColor = segment.textColor || getTextColor(segmentColor);

      // Create gradient for each segment
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, segmentColor);
      gradient.addColorStop(0.7, segmentColor);
      gradient.addColorStop(1, `${segmentColor}dd`); // Slightly darker edge

      // Draw segment
      ctx.beginPath();
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.lineTo(0, 0);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw segment border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text with rarity indicator
      ctx.save();
      const textAngle = startAngle + segmentAngles[index] / 2;
      ctx.rotate(textAngle);
      ctx.fillStyle = textColor;
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add text shadow for better readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      const rarityIndicator = getRarityIndicator(segment.rarity);
      const displayText = rarityIndicator ? `${rarityIndicator} ${segment.text}` : segment.text;
      ctx.fillText(displayText, radius * 0.7, 0);
      ctx.restore();
    });

    // Reset shadow for pointer
    ctx.shadowColor = 'transparent';
    ctx.restore();

    // Draw pointer/indicator
    const pointerSize = 20;
    ctx.fillStyle = '#2C3E50';
    ctx.strokeStyle = '#ECF0F1';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 10);
    ctx.lineTo(centerX - pointerSize, centerY - radius + pointerSize);
    ctx.lineTo(centerX + pointerSize, centerY - radius + pointerSize);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw center circle
    const centerRadius = 30;
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
    centerGradient.addColorStop(0, '#3498DB');
    centerGradient.addColorStop(1, '#2980B9');
    
    ctx.fillStyle = centerGradient;
    ctx.strokeStyle = '#ECF0F1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Add "SPIN" text in center
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', centerX, centerY);
  }, [physics.currentAngle, config.segments, segmentAngles]);

  // Animation loop with dramatic, suspenseful physics
  const animate = useCallback(() => {
    if (!physics.isSpinning && !isIdleRotating) return;

    setPhysics(prev => {
      let newVelocity = prev.velocity;
      let newAngle = prev.currentAngle;

      // Handle idle rotation when not spinning
      if (!prev.isSpinning && isIdleRotating) {
        newAngle += IDLE_SPEED;
        // Normalize angle
        while (newAngle > 2 * Math.PI) newAngle -= 2 * Math.PI;
        while (newAngle < 0) newAngle += 2 * Math.PI;
        
        return {
          ...prev,
          currentAngle: newAngle
        };
      }

      // Progressive friction system - simplified for turbo mode
      if (wheelSettings.spinSpeed === 'turbo') {
        // Turbo mode: Skip suspense, just use friction
        newVelocity *= FRICTION;
      } else if (newVelocity > SUSPENSE_THRESHOLD) {
        // Normal spinning phase - consistent friction
        newVelocity *= FRICTION;
      } else if (newVelocity > FINAL_THRESHOLD) {
        // Suspense phase - gradual slowdown with micro-variations (skip for fast/turbo)
        const suspenseIntensity = wheelSettings.spinSpeed === 'slow' ? 0.003 : 
                                 wheelSettings.spinSpeed === 'normal' ? 0.002 : 0.001;
        const suspenseMultiplier = 0.985 + Math.sin(Date.now() * 0.008) * suspenseIntensity;
        newVelocity *= suspenseMultiplier;
        
        // Add tiny random hesitations for drama (less for faster speeds)
        const hesitationChance = wheelSettings.spinSpeed === 'slow' ? 0.08 : 
                               wheelSettings.spinSpeed === 'normal' ? 0.04 : 0.01;
        if (Math.random() < hesitationChance) {
          newVelocity *= 0.995;
        }
      } else {
        // Final crawl phase - skip for turbo
        const finalIntensity = wheelSettings.spinSpeed === 'slow' ? 0.004 : 
                              wheelSettings.spinSpeed === 'normal' ? 0.002 : 0.001;
        const finalMultiplier = 0.992 + Math.sin(Date.now() * 0.003) * finalIntensity;
        newVelocity *= finalMultiplier;
        
        // Add suspenseful micro-pauses (much less for faster speeds)
        const pauseChance = wheelSettings.spinSpeed === 'slow' ? 0.03 : 
                           wheelSettings.spinSpeed === 'normal' ? 0.01 : 0.001;
        if (Math.random() < pauseChance) {
          newVelocity *= 0.98;
        }
      }

      // Update angle with current velocity
      newAngle += newVelocity;

      // Normalize angle
      while (newAngle > 2 * Math.PI) newAngle -= 2 * Math.PI;
      while (newAngle < 0) newAngle += 2 * Math.PI;

      // Check if should stop spinning (much lower threshold)
      if (Math.abs(newVelocity) < MIN_VELOCITY) {
        // Calculate which segment the pointer is naturally pointing to
        // The pointer points down from top, and segments are drawn starting from right (0 radians)
        // We need to account for the wheel rotation and pointer position
        const pointerAngle = (-newAngle - Math.PI / 2) % (2 * Math.PI);
        const normalizedPointerAngle = pointerAngle < 0 ? pointerAngle + 2 * Math.PI : pointerAngle;
        const winnerIndex = findSegmentByAngle(normalizedPointerAngle, config.segments);
        const selectedSegment = config.segments[winnerIndex];
        
        // Debug logging
        console.log('Final wheel position:', {
          wheelAngle: newAngle,
          pointerAngle,
          normalizedPointerAngle,
          detectedSegmentIndex: winnerIndex,
          detectedSegment: selectedSegment?.text,
          allSegmentProbabilities: calculateSegmentProbabilities(config.segments),
          segmentAngles: segmentAngles
        });
        
        // DON'T SNAP - just stop where physics naturally stopped
        const finalAngle = newAngle;
        
        // Call completion callback with dramatic pause
        if (onSpinComplete && selectedSegment) {
          setTimeout(() => {
            onSpinComplete({
              segment: selectedSegment,
              index: winnerIndex,
              angle: finalAngle,
              timestamp: Date.now()
            });
            // Restart idle rotation after spin completes
            setTimeout(() => setIsIdleRotating(true), 1000);
          }, 200); // Longer pause for dramatic effect
        }

        return {
          currentAngle: finalAngle,
          velocity: 0,
          acceleration: 0,
          isSpinning: false
        };
      }

      return {
        ...prev,
        currentAngle: newAngle,
        velocity: newVelocity
      };
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [physics.isSpinning, isIdleRotating, onSpinComplete, segmentAngles, config.segments, wheelSettings.spinSpeed, MIN_VELOCITY]);

  // Handle spin trigger
  const spin = useCallback(() => {
    if (disabled || physics.isSpinning) return;

    // Stop idle rotation and start spinning
    setIsIdleRotating(false);
    
    const spinPower = SPIN_POWER_MIN + Math.random() * (SPIN_POWER_MAX - SPIN_POWER_MIN);
    
    setPhysics(prev => ({
      ...prev,
      velocity: spinPower,
      isSpinning: true
    }));
  }, [disabled, physics.isSpinning, SPIN_POWER_MIN, SPIN_POWER_MAX]);

  // Handle touch/click events with enhanced interaction
  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    // Add haptic feedback for mobile devices (if enabled)
    if (wheelSettings.enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration
    }
    
    spin();
  }, [spin, wheelSettings.enableHapticFeedback]);

  // Handle touch for swipe-to-spin (future enhancement)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Prepare for potential swipe gesture
    // const touch = e.touches[0]; // Future: store for swipe implementation
    e.preventDefault();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
  }, []);

  // Setup canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = config.size || 400;
    canvas.width = size;
    canvas.height = size;

    // Draw initial wheel
    drawWheel(ctx, canvas);
  }, [config.size, drawWheel]);

  // Start animation when spinning or idle rotating
  useEffect(() => {
    if (physics.isSpinning || isIdleRotating) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [physics.isSpinning, isIdleRotating, animate]);

  // Redraw when physics change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawWheel(ctx, canvas);
  }, [drawWheel]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className={`border-4 border-white rounded-full shadow-2xl cursor-pointer transition-all duration-300 ${
          physics.isSpinning ? 'scale-105 shadow-3xl' : 'hover:scale-105 hover:shadow-3xl'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleInteraction}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleInteraction}
        style={{ 
          touchAction: 'manipulation',
          filter: physics.isSpinning ? 'brightness(1.1)' : 'brightness(1)'
        }}
      />
      
      <button
        onClick={spin}
        disabled={disabled || physics.isSpinning}
        className={`px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg transition-all duration-200 ${
          disabled || physics.isSpinning
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-blue-700 hover:shadow-xl active:scale-95'
        }`}
      >
        {physics.isSpinning ? 'Spinning...' : 'SPIN THE WHEEL'}
      </button>
    </div>
  );
};