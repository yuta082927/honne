import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── 既存カラー（chat画面等で使用） ──────────────────
        cream: "#FFF7FB",
        rose: "#FFF1F5",
        wine: "#EC4899",
        ink: "#3F2A3A",
        subink: "#7C6A78",
        accent: "#8B5CF6",
        accentSoft: "#A855F7",
        ctaStart: "#DB2777",
        ctaEnd: "#E11D48",
        line: "#F7D8E9",
        // ── ダーク神秘テーマ ─────────────────────────────────
        void: "#0d0a1a",
        star: "#f5f3ff",
        starsub: "#9ca3af",
        violet: { DEFAULT: "#7c3aed", soft: "#a855f7", glow: "#c4b5fd" }
      },
      fontFamily: {
        serif: ['"Noto Serif JP"', "serif"],
        grotesk: ['"Space Grotesk"', "sans-serif"]
      },
      keyframes: {
        // 星の瞬き
        twinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "1" }
        },
        // 浮遊
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        // 点線円の周回
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        // ボタン pulse（紫）
        "pulse-btn": {
          "0%": { boxShadow: "0 0 0 0px rgba(168,139,250,0.6)" },
          "70%": { boxShadow: "0 0 0 14px rgba(168,139,250,0)" },
          "100%": { boxShadow: "0 0 0 0px rgba(168,139,250,0)" }
        },
        // 浮遊 + 回転
        "float-spin": {
          "0%, 100%": { transform: "translateY(0) rotate(-5deg)" },
          "50%": { transform: "translateY(-8px) rotate(5deg)" }
        },
        // テキストグラデーション流れ
        shimmer: {
          "0%": { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "300% center" }
        },
        // スクロール出現
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        // 点滅ドット
        "blink-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.15" }
        }
      },
      animation: {
        twinkle: "twinkle 2.5s ease-in-out infinite",
        "float-spin": "float-spin 4s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        orbit: "orbit 12s linear infinite",
        "pulse-btn": "pulse-btn 2s ease-out infinite",
        shimmer: "shimmer 4s linear infinite",
        "fade-up": "fadeUp 0.7s ease forwards",
        "blink-dot": "blink-dot 1.5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
