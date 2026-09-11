import React from "react";
import SpecularButton from "./SpecularButton";
import { cn } from "../../lib/utils";

export function Button({
  children,
  className = "",
  variant = "primary", // primary, secondary, outline, ghost, danger, success
  size = "md", // sm, md, lg
  disabled = false,
  onClick,
  type = "button",
  radius = 16,
  lineColor,
  baseColor,
  tint,
  tintOpacity,
  textColor,
  intensity,
  speed,
  autoAnimate,
  followMouse = true,
  ...props
}) {
  const variantPresets = {
    primary: {
      tint: "#0d9488", // Vibrant Teal
      tintOpacity: 1,
      lineColor: "#5eead4", // Bright Cyan/Teal specular line
      baseColor: "#115e59",
      textColor: "#ffffff",
      intensity: 1.2,
      speed: 0.45,
      autoAnimate: false
    },
    secondary: {
      tint: "#1e293b", // Slate 800
      tintOpacity: 0.95,
      lineColor: "#cbd5e1",
      baseColor: "#334155",
      textColor: "#f8fafc",
      intensity: 0.9,
      speed: 0.35,
      autoAnimate: false
    },
    outline: {
      tint: "#ffffff",
      tintOpacity: 0.85,
      blur: 8,
      lineColor: "#0d9488",
      baseColor: "#cbd5e1",
      textColor: "#0f172a",
      intensity: 1.0,
      speed: 0.35,
      autoAnimate: false
    },
    ghost: {
      tint: "#f1f5f9",
      tintOpacity: 0.6,
      blur: 0,
      lineColor: "#94a3b8",
      baseColor: "#e2e8f0",
      textColor: "#334155",
      intensity: 0.7,
      speed: 0.3,
      autoAnimate: false
    },
    danger: {
      tint: "#e11d48", // Rose 600
      tintOpacity: 1,
      lineColor: "#ffe4e6",
      baseColor: "#9f1239",
      textColor: "#ffffff",
      intensity: 1.3,
      speed: 0.5,
      autoAnimate: false
    },
    success: {
      tint: "#059669", // Emerald 600
      tintOpacity: 1,
      lineColor: "#a7f3d0",
      baseColor: "#065f46",
      textColor: "#ffffff",
      intensity: 1.1,
      speed: 0.4,
      autoAnimate: false
    }
  };

  const currentPreset = variantPresets[variant] || variantPresets.primary;

  return (
    <SpecularButton
      size={size}
      radius={radius}
      tint={tint ?? currentPreset.tint}
      tintOpacity={tintOpacity ?? currentPreset.tintOpacity}
      blur={props.blur ?? currentPreset.blur ?? 0}
      textColor={textColor ?? currentPreset.textColor}
      lineColor={lineColor ?? currentPreset.lineColor}
      baseColor={baseColor ?? currentPreset.baseColor}
      intensity={intensity ?? currentPreset.intensity}
      speed={speed ?? currentPreset.speed}
      autoAnimate={autoAnimate ?? currentPreset.autoAnimate}
      followMouse={followMouse}
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={cn("font-sans-custom font-semibold tracking-normal shadow-sm", className)}
      {...props}
    >
      {children}
    </SpecularButton>
  );
}

export default Button;
