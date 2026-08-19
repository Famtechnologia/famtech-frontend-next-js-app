"use client";

import React, { useMemo } from "react";

/**
 * Animated "farm vibe" backdrop for the weather hero.
 * Reacts to the live condition: sun rays when clear, drifting clouds when
 * overcast, falling rain for drizzle/rain, plus lightning for storms — all
 * over a small farm scene (rolling fields + crop rows).
 *
 * Pure CSS/SVG, no external assets. Raindrop positions are deterministic
 * (derived from index) to avoid SSR/CSR hydration mismatches.
 */
export type Vibe = "clear" | "clouds" | "rain" | "drizzle" | "storm" | "fog";

export function classifyVibe(condition?: string): Vibe {
  const c = (condition || "").toLowerCase();
  if (c.includes("thunder") || c.includes("storm")) return "storm";
  if (c.includes("drizzle")) return "drizzle";
  if (c.includes("rain") || c.includes("shower")) return "rain";
  if (c.includes("fog") || c.includes("mist") || c.includes("haze") || c.includes("smoke")) return "fog";
  if (c.includes("cloud") || c.includes("overcast")) return "clouds";
  return "clear"; // clear / sun / default
}

const SKY: Record<Vibe, string> = {
  clear: "linear-gradient(160deg,#38bdf8 0%,#7dd3fc 40%,#fcd34d 100%)",
  clouds: "linear-gradient(160deg,#64748b 0%,#94a3b8 60%,#cbd5e1 100%)",
  drizzle: "linear-gradient(160deg,#475569 0%,#64748b 55%,#94a3b8 100%)",
  rain: "linear-gradient(160deg,#334155 0%,#475569 55%,#64748b 100%)",
  storm: "linear-gradient(160deg,#1e293b 0%,#334155 60%,#475569 100%)",
  fog: "linear-gradient(160deg,#94a3b8 0%,#cbd5e1 60%,#e2e8f0 100%)",
};

export default function WeatherScene({ condition }: { condition?: string }) {
  const vibe = classifyVibe(condition);
  const rainy = vibe === "rain" || vibe === "drizzle" || vibe === "storm";
  const dropCount = vibe === "drizzle" ? 26 : vibe === "rain" ? 46 : vibe === "storm" ? 60 : 0;

  const drops = useMemo(
    () =>
      Array.from({ length: dropCount }, (_, i) => ({
        left: (i * 34.7) % 100,
        delay: ((i * 13) % 100) / 100,
        dur: 0.5 + ((i * 7) % 6) / 10, // 0.5s–1.0s
        h: vibe === "storm" ? 22 : vibe === "rain" ? 18 : 12,
      })),
    [dropCount, vibe]
  );

  return (
    <div className="ws-root" aria-hidden style={{ background: SKY[vibe] }}>
      {/* Sun (clear only) */}
      {vibe === "clear" && (
        <div className="ws-sun">
          <div className="ws-sun-core" />
          <div className="ws-sun-glow" />
        </div>
      )}

      {/* Clouds (everything except clear) */}
      {vibe !== "clear" && (
        <>
          <div className="ws-cloud ws-cloud-1" />
          <div className="ws-cloud ws-cloud-2" />
          <div className="ws-cloud ws-cloud-3" />
        </>
      )}

      {/* Lightning flash (storm) */}
      {vibe === "storm" && <div className="ws-flash" />}

      {/* Rain */}
      {rainy && (
        <div className="ws-rain">
          {drops.map((d, i) => (
            <span
              key={i}
              className="ws-drop"
              style={{
                left: `${d.left}%`,
                height: `${d.h}px`,
                animationDelay: `${d.delay}s`,
                animationDuration: `${d.dur}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Farm scene: rolling fields + crop rows */}
      <svg className="ws-farm" viewBox="0 0 400 120" preserveAspectRatio="none">
        <path d="M0 70 Q100 40 200 62 T400 58 V120 H0 Z" fill="#3f7d3a" opacity="0.9" />
        <path d="M0 88 Q120 66 240 86 T400 82 V120 H0 Z" fill="#2f5f2b" />
        {/* crop rows */}
        <g stroke="#25501f" strokeWidth="2" strokeLinecap="round" opacity="0.7">
          {Array.from({ length: 16 }, (_, i) => {
            const x = 12 + i * 25;
            return <line key={i} className="ws-crop" x1={x} y1="104" x2={x} y2="94" style={{ animationDelay: `${(i % 5) * 0.2}s` }} />;
          })}
        </g>
      </svg>

      {/* Legibility scrim so overlaid text stays readable on light skies */}
      <div className="ws-scrim" />

      <style jsx>{`
        .ws-root {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: inherit;
        }
        .ws-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.28) 0%, rgba(0, 0, 0, 0.05) 45%, rgba(0, 0, 0, 0.25) 100%);
        }
        /* Sun */
        .ws-sun {
          position: absolute;
          top: 14px;
          right: 26px;
          width: 84px;
          height: 84px;
        }
        .ws-sun-core {
          position: absolute;
          inset: 22px;
          border-radius: 9999px;
          background: radial-gradient(circle, #fff7d6 0%, #ffe08a 55%, #fbbf24 100%);
          box-shadow: 0 0 26px 8px rgba(251, 191, 36, 0.55);
          animation: ws-pulse 4s ease-in-out infinite;
        }
        .ws-sun-glow {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: conic-gradient(from 0deg, rgba(255, 224, 138, 0.5), transparent 25%, rgba(255, 224, 138, 0.5) 50%, transparent 75%, rgba(255, 224, 138, 0.5));
          filter: blur(2px);
          animation: ws-spin 22s linear infinite;
          opacity: 0.7;
        }
        @keyframes ws-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes ws-spin {
          to { transform: rotate(360deg); }
        }
        /* Clouds */
        .ws-cloud {
          position: absolute;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.85);
          filter: blur(1px);
          box-shadow: 26px 6px 0 -4px rgba(255, 255, 255, 0.75), -24px 8px 0 -6px rgba(255, 255, 255, 0.7);
        }
        .ws-cloud-1 { top: 16px; width: 70px; height: 22px; animation: ws-drift 26s linear infinite; }
        .ws-cloud-2 { top: 40px; width: 52px; height: 18px; opacity: 0.8; animation: ws-drift 34s linear infinite; animation-delay: -8s; }
        .ws-cloud-3 { top: 26px; width: 90px; height: 26px; opacity: 0.65; animation: ws-drift 44s linear infinite; animation-delay: -18s; }
        @keyframes ws-drift {
          from { transform: translateX(-120px); }
          to { transform: translateX(460px); }
        }
        /* Rain */
        .ws-rain { position: absolute; inset: 0; }
        .ws-drop {
          position: absolute;
          top: -24px;
          width: 2px;
          background: linear-gradient(to bottom, rgba(224, 242, 254, 0), rgba(224, 242, 254, 0.85));
          border-radius: 9999px;
          animation-name: ws-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes ws-fall {
          from { transform: translateY(-10%); opacity: 0; }
          10% { opacity: 1; }
          to { transform: translateY(560%); opacity: 0.9; }
        }
        /* Lightning */
        .ws-flash {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.85);
          opacity: 0;
          animation: ws-lightning 7s linear infinite;
        }
        @keyframes ws-lightning {
          0%, 92%, 100% { opacity: 0; }
          93% { opacity: 0.55; }
          94% { opacity: 0; }
          95% { opacity: 0.75; }
          96% { opacity: 0; }
        }
        /* Crops sway */
        .ws-farm { position: absolute; bottom: 0; left: 0; width: 100%; height: 52%; }
        .ws-crop {
          transform-origin: bottom center;
          animation: ws-sway 3.2s ease-in-out infinite;
        }
        @keyframes ws-sway {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ws-sun-core, .ws-sun-glow, .ws-cloud, .ws-drop, .ws-flash, .ws-crop { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
