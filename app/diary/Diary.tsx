"use client";

import type { Diary } from "@/app/repositories/Diary";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { getDiary, openDiary } from "../repositories/Diary";

// ─── pixel-art mascot SVG (the little ghost/cat from the screenshot) ──────────
const PixelMascot = () => (
  <svg width="72" height="72" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="2" width="10" height="10" fill="#fff" />
    <rect x="3" y="3" width="1" height="8" fill="#fff" />
    <rect x="14" y="3" width="1" height="8" fill="#fff" />
    <rect x="2" y="5" width="1" height="5" fill="#fff" />
    <rect x="15" y="5" width="1" height="5" fill="#fff" />
    {/* feet */}
    <rect x="4" y="12" width="3" height="3" fill="#fff" />
    <rect x="11" y="12" width="3" height="3" fill="#fff" />
    <rect x="7" y="12" width="4" height="2" fill="#fff" />
    {/* eyes */}
    <rect x="6" y="5" width="2" height="2" fill="#1a2fb5" />
    <rect x="10" y="5" width="2" height="2" fill="#1a2fb5" />
    {/* blush */}
    <rect x="5" y="8" width="2" height="1" fill="#ffb3c6" />
    <rect x="11" y="8" width="2" height="1" fill="#ffb3c6" />
  </svg>
);

// ─── spiral rings along left edge ─────────────────────────────────────────────
const SpiralRings = ({ color = "#1a2fb5" }: { color?: string }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 18 }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: `3px solid ${color}`,
          backgroundColor: "transparent",
          flexShrink: 0,
        }}
      />
    ))}
  </div>
);

// ─── tiny pencil icon inside the open-button ──────────────────────────────────
const PencilIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#1a2fb5" />
    <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#1a2fb5" />
  </svg>
);

// ─── floating doodle elements on the cover ────────────────────────────────────
const CoverDoodles = () => (
  <>
    {/* top-left frog */}
    <div style={{ position: "absolute", top: 10, left: 14, fontSize: 22, lineHeight: 1 }}>🐸</div>
    {/* top-right scissors/bow */}
    <div style={{ position: "absolute", top: 8, right: 12, fontSize: 20 }}>🎀</div>
    {/* bottom-left star */}
    <div style={{ position: "absolute", bottom: 22, left: 20, fontSize: 18 }}>⭐</div>
    {/* bottom-right star outline */}
    <div style={{ position: "absolute", bottom: 30, left: 46, fontSize: 14, opacity: 0.7 }}>✦</div>
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function DiaryLandingPage() {
  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [userId, setUserId] = useState('User');

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserId(user.id || null); 
        }
      } catch (e) { console.error(e); }
    };
    loadUserName();
  }, []);

  // ── 1. Fetch diary on mount ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getDiary(userId);
        if (!cancelled) setDiary(data);
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error).message ?? "Could not load diary");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── 2. Open diary on click ───────────────────────────────────
  const handleDiaryClick = useCallback(async () => {
    if (!diary || opening) return;
    setOpening(true);
    try {
      const result = await openDiary(diary.id);
      console.log("Diary opened:", result);
      // TODO: navigate to the diary editor, e.g.:
      // router.push(`/diary/${diary.id}/entry/${result.entry?.entryId ?? "new"}`);
    } catch (e) {
      console.error("Failed to open diary:", e);
    } finally {
      setOpening(false);
    }
  }, [diary, opening]);

  const coverIsBlue = diary?.cover.color === "blue";
  const ownerName = diary?.ownerName ?? "Your";

  // ── Cover colours ────────────────────────────────────────────
  const coverBg   = coverIsBlue ? "#1a2fb5" : "#c8c0f0";
  const coverText = coverIsBlue ? "#e8e4ff" : "#1a2fb5";
  const shadowCol = coverIsBlue ? "#0f1a6e" : "#8b7fe8";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#c8c0f0",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Nunito', 'Fredoka One', sans-serif",
      }}
    >
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .diary-book {
          transition: transform 0.25s cubic-bezier(.34,1.56,.64,1),
                      box-shadow 0.25s ease;
          cursor: pointer;
        }
        .diary-book:hover {
          transform: rotate(-1deg) scale(1.04);
        }
        .open-btn {
          transition: transform 0.18s ease, background 0.18s ease;
          cursor: pointer;
          border: none;
          outline: none;
        }
        .open-btn:hover {
          transform: scale(1.12);
          background: #e8e4ff !important;
        }
        .open-btn:active {
          transform: scale(0.97);
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        .floating { animation: float 4s ease-in-out infinite; }
        @keyframes spin-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .loading-ring {
          width: 36px; height: 36px;
          border: 3px solid #c8c0f0;
          border-top-color: #1a2fb5;
          border-radius: 50%;
          animation: spin-ring 0.8s linear infinite;
        }
        .nav-link {
          color: #c8c0f0;
          text-decoration: none;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          font-size: 14px;
          transition: opacity 0.15s;
        }
        .nav-link:hover { opacity: 0.75; }
        .nav-pill {
          background: #c8c0f0;
          color: #1a2fb5;
          border-radius: 20px;
          padding: 3px 14px;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 14px;
        }
        footer a { color: #c8c0f0; text-decoration: none; opacity: 0.8; }
        footer a:hover { opacity: 1; }
      `}</style>

      {/* ═══════════════════════  NAVBAR  ═══════════════════════ */}
      <nav
        style={{
          backgroundColor: "#1a2fb5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 28px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <span style={{ color: "#fff", fontFamily: "'Fredoka One', sans-serif", fontSize: 20 }}>
          Parkette
        </span>

        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a href="#" className="nav-link">Game</a>
          <a href="#" className="nav-link">Community</a>
          <span className="nav-pill">Diary</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#c8c0f0", fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 600 }}>
            Hi {ownerName}
          </span>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#c8c0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <span style={{ fontSize: 18 }}>🐱</span>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════  HERO  ════════════════════════ */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px 60px",
          gap: 28,
        }}
      >
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div className="loading-ring" />
            <p style={{ color: "#1a2fb5", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
              Loading your diary…
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              background: "#fff",
              border: "2px solid #1a2fb5",
              borderRadius: 16,
              padding: "24px 32px",
              textAlign: "center",
              color: "#1a2fb5",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            <p style={{ fontSize: 32, marginBottom: 8 }}>😿</p>
            <p style={{ fontWeight: 700 }}>Couldn't load your diary</p>
            <p style={{ opacity: 0.7, fontSize: 14, marginTop: 4 }}>{error}</p>
          </div>
        ) : (
          <>
            {/* ── Diary Book ── */}
            <div
              className="diary-book floating"
              onClick={handleDiaryClick}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              aria-label="Open your diary"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleDiaryClick()}
              style={{
                display: "flex",
                alignItems: "stretch",
                borderRadius: 18,
                overflow: "visible",
                boxShadow: hovered
                  ? `6px 8px 0px ${shadowCol}, 0 0 0 3px ${shadowCol}`
                  : `4px 6px 0px ${shadowCol}`,
                position: "relative",
                userSelect: "none",
              }}
            >
              {/* Spiral rings */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 0",
                  backgroundColor: coverBg,
                  borderRadius: "18px 0 0 18px",
                  width: 38,
                  gap: 10,
                  zIndex: 2,
                  boxShadow: `inset -4px 0 0 ${shadowCol}`,
                }}
              >
                <SpiralRings color={coverIsBlue ? "#c8c0f0" : "#1a2fb5"} />
              </div>

              {/* Cover body */}
              <div
                style={{
                  backgroundColor: coverBg,
                  borderRadius: "0 18px 18px 0",
                  width: 210,
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  padding: 16,
                  border: `3px solid ${shadowCol}`,
                  borderLeft: "none",
                }}
              >
                <CoverDoodles />

                {/* Title text */}
                <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                  <p
                    style={{
                      fontFamily: "'Fredoka One', cursive",
                      fontSize: 32,
                      color: coverText,
                      lineHeight: 1.1,
                      textShadow: `2px 2px 0 ${shadowCol}40`,
                      letterSpacing: 1,
                    }}
                  >
                    {ownerName}'s
                  </p>
                  <p
                    style={{
                      fontFamily: "'Fredoka One', cursive",
                      fontSize: 38,
                      color: coverText,
                      lineHeight: 1.0,
                      textShadow: `2px 2px 0 ${shadowCol}40`,
                      letterSpacing: 1,
                    }}
                  >
                    Diary
                  </p>
                </div>

                {/* Stickers from backend */}
                {diary?.cover.stickers.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      position: "absolute",
                      left: `${s.x * 100}%`,
                      top: `${s.y * 100}%`,
                      transform: `translate(-50%,-50%) scale(${s.scale}) rotate(${s.rotation}deg)`,
                      fontSize: 20,
                      pointerEvents: "none",
                    }}
                  >
                    {/* Render sticker emoji/SVG by id — placeholder: */}
                    {s.id.includes("star") ? "⭐" : s.id.includes("heart") ? "❤️" : "✨"}
                  </div>
                ))}

                {/* Loading overlay when opening */}
                {opening && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: `${coverBg}cc`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "0 18px 18px 0",
                    }}
                  >
                    <div className="loading-ring" />
                  </div>
                )}
              </div>
            </div>

            {/* ── Open button ── */}
            <button
              className="open-btn"
              onClick={handleDiaryClick}
              disabled={opening}
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: "#fff",
                border: `2.5px solid #1a2fb5`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "3px 3px 0 #1a2fb5",
              }}
              aria-label="Open diary"
            >
              <PencilIcon />
            </button>
          </>
        )}
      </main>

      {/* ═══════════════════════  FOOTER  ═══════════════════════ */}
      <footer
        style={{
          backgroundColor: "#1a2fb5",
          color: "#c8c0f0",
          padding: "32px 40px 20px",
          fontFamily: "'Nunito', sans-serif",
          fontSize: 13,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 24,
            marginBottom: 28,
            alignItems: "start",
          }}
        >
          {/* Brand */}
          <div>
            <p style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: 18, marginBottom: 6 }}>
              Parkette
            </p>
          </div>

          {/* Learn More */}
          <div>
            <p style={{ fontWeight: 700, marginBottom: 8, opacity: 0.9 }}>Learn More</p>
            {["About Parkette", "Environment", "Jobs", "Privacy Policy"].map((l) => (
              <p key={l} style={{ marginBottom: 4 }}>
                <a href="#" className="" style={{ color: "#c8c0f0", opacity: 0.75, textDecoration: "none" }}>
                  {l}
                </a>
              </p>
            ))}
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontWeight: 700, marginBottom: 8, opacity: 0.9 }}>Contact Us</p>
            <p style={{ opacity: 0.75 }}>Parkette:</p>
            <p style={{ opacity: 0.75 }}>123-456-7890</p>
          </div>

          {/* Social + mascot */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
            <p style={{ fontWeight: 700, opacity: 0.9 }}>Social Media</p>
            <div style={{ display: "flex", gap: 12, fontSize: 18 }}>
              <span style={{ cursor: "pointer" }}>📸</span>
              <span style={{ cursor: "pointer" }}>▶️</span>
              <span style={{ cursor: "pointer" }}>📘</span>
            </div>
            <div style={{ marginTop: 8, opacity: 0.9 }}>
              <PixelMascot />
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #c8c0f040",
            paddingTop: 12,
            textAlign: "center",
            opacity: 0.6,
            fontSize: 12,
          }}
        >
          © 2025 Parkette | All Rights Reserved
        </div>
      </footer>
    </div>
  );
}