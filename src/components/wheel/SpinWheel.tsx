'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { WheelConfig, WheelSegment, SpinResult, WheelPhysics } from '@/types/wheel';
import { useWheelSettings } from '@/stores/settingsStore';
import { SPEED_PRESETS } from '@/types/settings';
import { selectWeightedSegment, calculateTargetAngle, calculateSegmentProbabilities, findSegmentByAngle } from '@/utils/probabilityUtils';
import { useAnonymousStore } from '@/stores/anonymousStore';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { UpgradeFlow } from '@/components/upgrade/UpgradeFlow';

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
  const anonymousStore = useAnonymousStore();
  const { checkWheelOptions } = useFeatureGate();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [physics, setPhysics] = useState<WheelPhysics>({
    currentAngle: 0,
    velocity: 0,
    acceleration: 0,
    isSpinning: false
  });
  
  const [isIdleRotating, setIsIdleRotating] = useState(true);
  const [hasCompletedSpin, setHasCompletedSpin] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check wheel options limit
  const wheelOptionsCheck = useMemo(() => 
    checkWheelOptions(config.segments.length), 
    [checkWheelOptions, config.segments.length]
  );

  // Check if we need to show upgrade prompt based on wheel options
  const shouldShowWheelUpgrade = useMemo(() => 
    wheelOptionsCheck.usagePercentage >= 80,
    [wheelOptionsCheck.usagePercentage]
  );

  // Generate stable particle positions for spinning effect
  const spinParticles = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      angle: i * 30, // Evenly distributed around circle
      delay: i * 0.1
    })), []
  );

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

  // 2025 Gaming-inspired colors with neon aesthetics
  const getSegmentColor = (segment: WheelSegment, index: number): string => {
    if (segment.color) return segment.color;
    
    // Neon cyberpunk color palette
    const colors = [
      '#FF0080', '#00FF80', '#8000FF', '#FF8000', '#0080FF',
      '#FF4080', '#40FF80', '#8040FF', '#FF4000', '#0040FF',
      '#FF0040', '#00FF40', '#4000FF', '#FF8040', '#4080FF'
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

    // Enhanced gaming-style shadow with neon glow
    ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;

    // Draw segments with proportional angles
    let cumulativeAngle = 0;
    config.segments.forEach((segment, index) => {
      const startAngle = cumulativeAngle;
      const endAngle = startAngle + segmentAngles[index];
      cumulativeAngle = endAngle;
      
      const segmentColor = getSegmentColor(segment, index);
      const textColor = segment.textColor || getTextColor(segmentColor);

      // Create enhanced cyberpunk gradient
      const gradient = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
      gradient.addColorStop(0, `${segmentColor}ff`);
      gradient.addColorStop(0.4, segmentColor);
      gradient.addColorStop(0.8, `${segmentColor}cc`);
      gradient.addColorStop(1, `${segmentColor}66`); // Fade to translucent edge

      // Draw segment
      ctx.beginPath();
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.lineTo(0, 0);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Enhanced neon border effect
      ctx.strokeStyle = `${segmentColor}aa`;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Add inner glow border
      ctx.beginPath();
      ctx.arc(0, 0, radius - 5, startAngle, endAngle);
      ctx.lineTo(0, 0);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw text with rarity and multi-spin indicators
      ctx.save();
      const textAngle = startAngle + segmentAngles[index] / 2;
      ctx.rotate(textAngle);
      ctx.fillStyle = textColor;
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const displayText = segment.text;
      
      // Enhanced text with neon glow effect
      ctx.shadowColor = segmentColor;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw text multiple times for stronger glow
      ctx.fillText(displayText, radius * 0.7, 0);
      ctx.shadowBlur = 4;
      ctx.fillText(displayText, radius * 0.7, 0);
      ctx.shadowBlur = 0;
      
      
      ctx.restore();
    });

    // Reset shadow for pointer
    ctx.shadowColor = 'transparent';
    ctx.restore();

    // Enhanced cyberpunk pointer with glow
    const pointerSize = 25;
    
    // Outer glow
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#00FFFF';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 15);
    ctx.lineTo(centerX - pointerSize, centerY - radius + pointerSize);
    ctx.lineTo(centerX + pointerSize, centerY - radius + pointerSize);
    ctx.closePath();
    ctx.fill();
    
    // Inner pointer
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 12);
    ctx.lineTo(centerX - pointerSize * 0.7, centerY - radius + pointerSize * 0.7);
    ctx.lineTo(centerX + pointerSize * 0.7, centerY - radius + pointerSize * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Enhanced cyberpunk center circle with pulsing glow
    const centerRadius = 35;
    
    // Outer pulsing glow
    const pulseIntensity = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
    ctx.shadowColor = '#FF0080';
    ctx.shadowBlur = 20 * pulseIntensity;
    
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
    centerGradient.addColorStop(0, '#FFFFFF');
    centerGradient.addColorStop(0.3, '#FF0080');
    centerGradient.addColorStop(0.7, '#8000FF');
    centerGradient.addColorStop(1, '#000000');
    
    ctx.fillStyle = centerGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Glowing border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Inner ring detail
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius - 8, 0, 2 * Math.PI);
    ctx.stroke();

    // Enhanced "SPIN" text with glow
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', centerX, centerY);
    
    // Secondary glow
    ctx.shadowBlur = 5;
    ctx.fillText('SPIN', centerX, centerY);
    ctx.shadowBlur = 0;
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
      if (Math.abs(newVelocity) < MIN_VELOCITY && !hasCompletedSpin) {
        // Calculate which segment the pointer is naturally pointing to
        // The pointer points down from top, and segments are drawn starting from right (0 radians)
        // We need to account for the wheel rotation and pointer position
        const pointerAngle = (-newAngle - Math.PI / 2) % (2 * Math.PI);
        const normalizedPointerAngle = pointerAngle < 0 ? pointerAngle + 2 * Math.PI : pointerAngle;
        const winnerIndex = findSegmentByAngle(normalizedPointerAngle, config.segments);
        const selectedSegment = config.segments[winnerIndex];
        
        // Debug logging (remove in production)
        // console.log('Final wheel position:', detectedSegment: selectedSegment?.text);
        
        // DON'T SNAP - just stop where physics naturally stopped
        const finalAngle = newAngle;
        
        // Mark spin as completed to prevent duplicate calls
        setHasCompletedSpin(true);
        
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

  // Handle spin trigger with usage tracking
  const spin = useCallback(() => {
    if (disabled || physics.isSpinning) return;

    // Track spin usage for anonymous users
    anonymousStore.incrementSpins();

    // Stop idle rotation and start spinning
    setIsIdleRotating(false);
    setHasCompletedSpin(false); // Reset completion guard for new spin
    
    const spinPower = SPIN_POWER_MIN + Math.random() * (SPIN_POWER_MAX - SPIN_POWER_MIN);
    
    setPhysics(prev => ({
      ...prev,
      velocity: spinPower,
      isSpinning: true
    }));
  }, [disabled, physics.isSpinning, SPIN_POWER_MIN, SPIN_POWER_MAX, anonymousStore]);

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
  const handleTouchStart = useCallback(() => {
    // Prepare for potential swipe gesture
    // Future: store touch position for swipe implementation
    // Note: preventDefault() removed to avoid passive event listener warning
  }, []);

  const handleTouchMove = useCallback(() => {
    // Note: preventDefault() removed to avoid passive event listener warning
    // Future: implement touch handling with proper passive event management
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
    <div className="flex flex-col items-center gap-6 relative">
      {/* Wheel Options Limit Warning */}
      {shouldShowWheelUpgrade && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg max-w-md">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium text-purple-300">
              {wheelOptionsCheck.currentUsage}/{wheelOptionsCheck.limit} Wheel Options Used
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {wheelOptionsCheck.upgradeMessage}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs rounded font-medium transition-all duration-200"
            >
              Upgrade to PRO
            </button>
            <div className="flex-1 bg-gray-700 rounded-full h-2 mt-1">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, wheelOptionsCheck.usagePercentage)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Gaming HUD overlay */}
      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-full opacity-20 blur-lg animate-pulse" />
      
      <canvas
        ref={canvasRef}
        className={`relative z-10 border-4 border-cyan-400/50 rounded-full shadow-cosmic cursor-pointer transition-all duration-500 ${
          physics.isSpinning ? 'scale-110 shadow-3xl' : 'hover:scale-105 hover:shadow-cosmic'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} neon-glow`}
        onClick={handleInteraction}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleInteraction}
        style={{ 
          touchAction: 'manipulation',
          filter: physics.isSpinning ? 'brightness(1.2) saturate(1.3)' : 'brightness(1.1)'
        }}
      />
      
      <button
        onClick={spin}
        disabled={disabled || physics.isSpinning}
        className={`px-10 py-4 btn-cosmic text-white font-bold rounded-xl shadow-cosmic transition-all duration-300 micro-bounce neon-glow relative overflow-hidden ${
          disabled || physics.isSpinning
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:shadow-3xl active:scale-95'
        }`}
      >
        <span className="relative z-10 flex items-center space-x-2">
          {physics.isSpinning ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Spinning Reality...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>SPIN THE WHEEL</span>
              <span>⚡</span>
            </>
          )}
        </span>
      </button>
      
      {/* Ambient particles around wheel */}
      {physics.isSpinning && (
        <div className="absolute inset-0 pointer-events-none">
          {spinParticles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-70"
              style={{
                left: `${50 + Math.cos(particle.angle * Math.PI / 180) * 45}%`,
                top: `${50 + Math.sin(particle.angle * Math.PI / 180) * 45}%`,
                animation: `float 2s infinite ease-in-out`,
                animationDelay: `${particle.delay}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeFlow
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        triggerFeature="options"
      />
    </div>
  );
};