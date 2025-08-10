import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { redChars, blackChars, initialPieces } from '../../models/xiangqiModel.js';


export default function XiangqiBoard() {
  // Files 0..8 (left→right), ranks 0..9 (top→bottom). Black at top, Red at bottom.
  const FILES = 9;
  const RANKS = 10;

  // Visual theme.
  const COLORS = {
    boardTop: '#EAD1A8',
    boardBot: '#C98C4E',
    line: 'rgba(70,45,25,.75)',
    border: '#342313',
    label: '#7A4A1F',
    ivory: '#FAF4E8',
    red: '#D32F2F',
    neonPurple: '#8B5CF6'
  };

  // Symmetric insets for equal top/bottom margins (percent of board).
  const INSET_X = 4;
  const INSET_TOP = 8;
  const INSET_BOTTOM = 8;

  const USABLE_X = 100 - INSET_X * 2;
  const USABLE_Y = 100 - INSET_TOP - INSET_BOTTOM;

  // Grid spacing.
  const STEP_X = USABLE_X / (FILES - 1);
  const STEP_Y = USABLE_Y / (RANKS - 1);

  // Grid coordinates (percent).
  const v = Array.from({ length: FILES }, (_, i) => INSET_X + i * STEP_X);
  const h = Array.from({ length: RANKS }, (_, i) => INSET_TOP + i * STEP_Y);

  // River band and center (between ranks 4 and 5).
  const riverTopEdge = INSET_TOP + 4 * STEP_Y;
  const riverBottomEdge = INSET_TOP + 5 * STEP_Y;
  const riverMid = (riverTopEdge + riverBottomEdge) / 2;

  // Pieces and sizing.
  const pieces = initialPieces();
  const pieceSize = Math.min(STEP_X, STEP_Y) * 0.62;

  // Node-centered placement.
  const nodeStyle = (f, r) => ({
    position: 'absolute',
    left: `${INSET_X + f * STEP_X}%`,
    top: `${INSET_TOP + r * STEP_Y}%`,
    transform: 'translate(-50%, -50%)',
    width: `${pieceSize}%`,
    height: `${pieceSize}%`,
    borderRadius: '50%'
  });

  // Palace rectangles for files 3–5 and ranks 0–2 / 7–9.
  const palaceRect = (topRank) => ({
    left: INSET_X + 3 * STEP_X,
    top: INSET_TOP + topRank * STEP_Y,
    width: 2 * STEP_X,
    height: 2 * STEP_Y
  });
  const topPalace = palaceRect(0);
  const botPalace = palaceRect(7);

  // Modern neon/glow piece faces.
  const pieceFaceStyle = (isRed) => {
    if (isRed) {
      // Red side: unchanged.
      return {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        color: COLORS.red,
        background: `
          radial-gradient(60% 60% at 30% 30%, rgba(255,255,255,.85), rgba(255,255,255,0) 55%),
          radial-gradient(100% 100% at 50% 55%, ${COLORS.ivory}, #F1E8D8 70%, #E8DAC2 100%)
        `,
        border: '2px solid rgba(255,255,255,.95)',
        borderRadius: '50%',
        boxShadow: `
          0 0 8px 3px rgba(255,255,255,.75),
          0 0 18px 6px rgba(255,255,255,.22),
          0 6px 12px rgba(0,0,0,.22)
        `,
        fontWeight: 900,
        fontSize: '1.22em',
        lineHeight: 1,
        letterSpacing: 0.5,
        textShadow: `
          0 0 6px rgba(255,255,255,.85),
          0 0 10px rgba(255,255,255,.45)
        `
      };
    }
    // Black side: slightly larger disc, smaller glyph, reduced purple glow.
    return {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      color: '#FFFFFF',
      background: `
        radial-gradient(65% 65% at 30% 30%, rgba(255,255,255,.10), rgba(255,255,255,0) 60%),
        radial-gradient(100% 100% at 50% 55%, #1B1029, #0D0818 70%, #070512 100%)
      `,
      border: `2px solid ${COLORS.neonPurple}`,
      borderRadius: '50%',
      // Tighter glow for more negative space around the glyph.
      boxShadow: `
        0 0 6px 2px ${COLORS.neonPurple},
        0 0 12px 5px rgba(139,92,246,.22),
        0 6px 12px rgba(0,0,0,.28)
      `,
      fontWeight: 900,
      fontSize: '1.12em',         // Smaller text -> more breathing room.
      lineHeight: 1,
      letterSpacing: 0.3,
      textShadow: '0 0 6px rgba(255,255,255,.5)',
      transform: 'scale(1.05)'    // Disc appears a touch wider overall.
    };
  };

  // Tooltip content.
  const pieceInfo = {
    K: { name: 'General', move: 'Moves 1 orthogonally inside the 3x3 palace. Cannot face the opposing general on an open file.', off: 0.5, def: 5.0 },
    A: { name: 'Advisor', move: 'Moves 1 diagonal step inside the palace.', off: 1.0, def: 3.0 },
    B: { name: 'Elephant', move: 'Moves 2 points diagonally. Blocked by a leg and cannot cross the river.', off: 1.5, def: 2.5 },
    N: { name: 'Horse', move: 'Moves 1 orthogonal then 1 diagonal outward. Blocked by the adjacent leg.', off: 4.0, def: 3.5 },
    R: { name: 'Chariot', move: 'Moves any number of points orthogonally.', off: 9.5, def: 9.0 },
    C: { name: 'Cannon', move: 'Moves like a chariot. Captures by jumping over exactly 1 screen.', off: 6.5, def: 3.5 },
    P: { name: 'Soldier', move: 'Moves 1 forward; after crossing the river may also move 1 left or right.', off: 2.0, def: 1.5 }
  };
  const tipText = (t) => {
    const i = pieceInfo[t];
    return `${i.name} — ${i.move} Value: Offense ${i.off}, Defense ${i.def}.`;
  };

  // River and palace explanatory text.
  const riverTip = `River — Midboard boundary. Soldiers gain lateral moves after crossing and become more dangerous. Elephants may not cross. Advisors and the General remain in the palace. Chariots and Cannons use open files across the river to attack; Horses gain forward outposts. Controlling crossings creates strong initiative.`;
  const palaceTip = (side) =>
    `${side} Palace — A 3x3 fortress for the General. The General and Advisors must stay inside. Use the palace corners and diagonals for defense, keep the advisor triangle intact, and avoid blocking the General's file. Attackers aim files, ranks, and palace diagonals with Chariots, Cannons, and Horse-leg tactics.`;

  // Floating tooltip (fixed to viewport, always on top).
  const [tipVisible, setTipVisible] = useState(false);
  const [tipHtml, setTipHtml] = useState('');
  const [tipPos, setTipPos] = useState({ top: 0, left: 0 });
  const tipRef = useRef(null);

  // Compute and clamp tooltip position to viewport.
  const positionTip = (rect) => {
    if (!rect) return;
    const GAP = 12;
    const vw = window.innerWidth;
    const tw = Math.min(360, vw - 16);

    let left = rect.left + rect.width / 2 - tw / 2;
    left = Math.max(8, Math.min(vw - tw - 8, left));

    requestAnimationFrame(() => {
      const el = tipRef.current;
      if (!el) return;
      const th = el.offsetHeight;
      let top = rect.top - th - GAP;     // Prefer above.
      if (top < 8) top = rect.bottom + GAP; // Flip below if clipped.
      const maxTop = window.innerHeight - th - 8;
      top = Math.max(8, Math.min(maxTop, top));
      setTipPos({ top, left });
    });
  };

  const showTipFromEvent = (e, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTipHtml(text);
    setTipVisible(true);
    positionTip(rect);
  };
  const moveTip = (e) => { if (tipVisible) positionTip(e.currentTarget.getBoundingClientRect()); };
  const hideTip = () => setTipVisible(false);

  // Darker palace background (always visible), under the grid.
  const PalaceBg = ({ rect }) => (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: `${rect.left}%`,
        top: `${rect.top}%`,
        width: `${rect.width}%`,
        height: `${rect.height}%`,
        background: 'linear-gradient(180deg, rgba(74,48,28,.28), rgba(74,48,28,.22))',
        boxShadow: 'inset 0 0 0 2px rgba(60,40,20,.28)',
        borderRadius: 6,
        pointerEvents: 'none'
      }}
    />
  );

  // Palace diagonals via SVG (precise X centered on the node).
  const PalaceX = ({ rect }) => (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: `${rect.left}%`,
        top: `${rect.top}%`,
        width: `${rect.width}%`,
        height: `${rect.height}%`,
        overflow: 'visible',
        pointerEvents: 'none'
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <line x1="0" y1="0" x2="100" y2="100" stroke={COLORS.line} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <line x1="100" y1="0" x2="0" y2="100" stroke={COLORS.line} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );

  return (
    <>
      <div
        className="board"
        role="img"
        aria-label="Xiangqi initial position"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '9 / 10',
          background: `linear-gradient(180deg, ${COLORS.boardTop}, ${COLORS.boardBot})`,
          border: `6px solid ${COLORS.border}`,
          borderRadius: 12,
          boxShadow: 'inset 0 0 0 2px rgba(0,0,0,.12), 0 10px 22px rgba(0,0,0,.25)',
          overflow: 'visible'
        }}
      >
        <style>{`
          .xq-face { transition: transform 160ms ease; will-change: transform; }
          .xq-piece:hover .xq-face, .xq-piece:focus-within .xq-face { transform: scale(1.08); }
          .xq-hover { cursor: help; transition: filter 120ms ease, box-shadow 120ms ease; }
          .xq-hover:hover { filter: brightness(1.05); }
          .palace-hit { position: absolute; border-radius: 6px; background: transparent; }
          .palace-hit:hover { box-shadow: inset 0 0 0 2px rgba(60,40,20,.35), inset 0 0 30px rgba(255,255,255,.18); }
          @media (prefers-reduced-motion: reduce) { .xq-face { transition: none; } }
        `}</style>

        {/* Palace shading first (under the grid). */}
        <PalaceBg rect={topPalace} />
        <PalaceBg rect={botPalace} />

        {/* Horizontal rank lines. */}
        {h.map((y, i) => (
          <div
            key={`h${i}`}
            style={{
              position: 'absolute',
              left: `${INSET_X}%`,
              right: `${INSET_X}%`,
              top: `${y}%`,
              height: 0,
              borderTop: `2px solid ${COLORS.line}`
            }}
          />
        ))}

        {/* Vertical files with a full gap over the river band. */}
        {v.map((x, i) => (
          <React.Fragment key={`v${i}`}>
            <div
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${INSET_TOP}%`,
                width: 0,
                height: `${riverTopEdge - INSET_TOP}%`,
                borderLeft: `2px solid ${COLORS.line}`
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${riverBottomEdge}%`,
                width: 0,
                height: `${(INSET_TOP + 9 * STEP_Y) - riverBottomEdge}%`,
                borderLeft: `2px solid ${COLORS.line}`
              }}
            />
          </React.Fragment>
        ))}

        {/* River labels with hover tooltips. */}
        <div
          style={{
            position: 'absolute',
            left: `${INSET_X}%`,
            right: `${INSET_X}%`,
            top: `${riverMid}%`,
            transform: 'translateY(-50%)',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 12%',
            color: COLORS.label,
            fontWeight: 800,
            letterSpacing: 2,
            userSelect: 'none'
          }}
        >
          <span
            className="xq-hover"
            onMouseEnter={(e) => showTipFromEvent(e, riverTip)}
            onMouseMove={moveTip}
            onMouseLeave={hideTip}
            onFocus={(e) => showTipFromEvent(e, riverTip)}
            onBlur={hideTip}
            tabIndex={0}
          >
            楚河
          </span>
          <span
            className="xq-hover"
            onMouseEnter={(e) => showTipFromEvent(e, riverTip)}
            onMouseMove={moveTip}
            onMouseLeave={hideTip}
            onFocus={(e) => showTipFromEvent(e, riverTip)}
            onBlur={hideTip}
            tabIndex={0}
          >
            漢界
          </span>
        </div>

        {/* Palace X drawn with SVG to align at the center node. */}
        <PalaceX rect={topPalace} />
        <PalaceX rect={botPalace} />

        {/* Palace hover areas with tooltips. */}
        <div
          className="palace-hit xq-hover"
          style={{
            left: `${topPalace.left}%`,
            top: `${topPalace.top}%`,
            width: `${topPalace.width}%`,
            height: `${topPalace.height}%`
          }}
          onMouseEnter={(e) => showTipFromEvent(e, palaceTip('Top'))}
          onMouseMove={moveTip}
          onMouseLeave={hideTip}
          onFocus={(e) => showTipFromEvent(e, palaceTip('Top'))}
          onBlur={hideTip}
          tabIndex={0}
          aria-label="Top palace information"
        />
        <div
          className="palace-hit xq-hover"
          style={{
            left: `${botPalace.left}%`,
            top: `${botPalace.top}%`,
            width: `${botPalace.width}%`,
            height: `${botPalace.height}%`
          }}
          onMouseEnter={(e) => showTipFromEvent(e, palaceTip('Bottom'))}
          onMouseMove={moveTip}
          onMouseLeave={hideTip}
          onFocus={(e) => showTipFromEvent(e, palaceTip('Bottom'))}
          onBlur={hideTip}
          tabIndex={0}
          aria-label="Bottom palace information"
        />

        {/* Pieces with neon styling and hover/tooltip handlers. */}
        {pieces.map((p, idx) => {
          const isRed = p.side === 'r';
          return (
            <div
              key={idx}
              className={`xq-piece ${isRed ? 'red' : ''}`}
              style={nodeStyle(p.f, p.r)}
              tabIndex={0}
              onMouseEnter={(e) => showTipFromEvent(e, tipText(p.t))}
              onMouseMove={moveTip}
              onMouseLeave={hideTip}
              onFocus={(e) => showTipFromEvent(e, tipText(p.t))}
              onBlur={hideTip}
            >
              <span className="xq-face" style={pieceFaceStyle(isRed)}>
                {isRed ? redChars[p.t] : blackChars[p.t]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Floating tooltip rendered at viewport level (always on top). */}
      {tipVisible && createPortal(
        <div
          ref={tipRef}
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${tipPos.top}px`,
            left: `${tipPos.left}px`,
            width: 'min(360px, 80vw)',
            padding: '10px 12px',
            background: 'linear-gradient(180deg, rgba(22,16,28,.96), rgba(18,14,22,.96))',
            color: '#FFF',
            border: '1px solid rgba(255,255,255,.14)',
            borderRadius: 12,
            boxShadow: '0 10px 20px rgba(0,0,0,.35)',
            fontSize: 13,
            lineHeight: 1.35,
            zIndex: 2147483647,
            pointerEvents: 'none',
            textAlign: 'left'
          }}
        >
          {tipHtml}
        </div>,
        document.body
      )}

    </>
  );
}
