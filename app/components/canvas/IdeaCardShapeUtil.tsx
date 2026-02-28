'use client';

import { useContext, useState } from 'react';
import {
  BaseBoxShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  type TLBaseShape,
  type TLResizeInfo,
  resizeBox,
} from 'tldraw';
import { EMOJIS, type IdeaWithReactions } from '../../types';
import { getRelativeTime, getCardColor } from '../../utils/time';
import { IdeasContext } from './IdeasContext';

// ── Type declaration ──────────────────────────────────────────────────────────

export type IdeaCardShapeProps = {
  w: number;
  h: number;
  ideaId: string;
  content: string;
  displayName: string;
  createdAt: number;
};

export type IdeaCardShape = TLBaseShape<'ideaCard', IdeaCardShapeProps>;

declare module 'tldraw' {
  interface TLGlobalShapePropsMap {
    ideaCard: IdeaCardShapeProps;
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const NOTE_W = 240;
export const NOTE_H = 280;

// ── Shape util ────────────────────────────────────────────────────────────────

export class IdeaCardShapeUtil extends BaseBoxShapeUtil<IdeaCardShape> {
  static override type = 'ideaCard' as const;

  static override props = {
    w: T.number,
    h: T.number,
    ideaId: T.string,
    content: T.string,
    displayName: T.string,
    createdAt: T.number,
  };

  override getDefaultProps(): IdeaCardShapeProps {
    return {
      w: NOTE_W,
      h: NOTE_H,
      ideaId: '',
      content: '',
      displayName: '',
      createdAt: Date.now(),
    };
  }

  override getGeometry(shape: IdeaCardShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override canResize() {
    return false;
  }

  override component(shape: IdeaCardShape) {
    return <IdeaCardComponent shape={shape} />;
  }

  override indicator(shape: IdeaCardShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}

// ── React component (rendered inside the shape) ───────────────────────────────

function IdeaCardComponent({ shape }: { shape: IdeaCardShape }) {
  const { ideasById, currentUserId, toggleReaction } = useContext(IdeasContext);
  const [bouncingEmoji, setBouncingEmoji] = useState<string | null>(null);

  const { w, h, ideaId, content, displayName, createdAt } = shape.props;
  const idea = ideasById[ideaId] as IdeaWithReactions | undefined;

  // Build reactions map from live InstantDB data (not stored in shape props)
  const reactions: Record<string, string[]> = {};
  if (idea) {
    for (const r of idea.reactions ?? []) {
      if (!reactions[r.emoji]) reactions[r.emoji] = [];
      reactions[r.emoji].push(r.userId);
    }
  }

  const handleReaction = (emoji: string) => {
    setBouncingEmoji(emoji);
    toggleReaction(ideaId, emoji);
    setTimeout(() => setBouncingEmoji(null), 300);
  };

  const cardColorClass = getCardColor(ideaId);

  // Extract just the bg color value for inline style (tldraw strips Tailwind classes)
  // We use a style-based approach for the background
  const bgColors: Record<string, string> = {
    'bg-yellow-50': '#fefce8',
    'bg-blue-50': '#eff6ff',
    'bg-green-50': '#f0fdf4',
    'bg-pink-50': '#fdf2f8',
    'bg-purple-50': '#faf5ff',
    'bg-orange-50': '#fff7ed',
  };
  // Extract the light-mode class name (first part before " dark:")
  const lightClass = cardColorClass.split(' ')[0];
  const bgColor = bgColors[lightClass] ?? '#fefce8';

  return (
    <HTMLContainer
      style={{
        width: w,
        height: h,
        pointerEvents: 'all',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 12,
        border: '1px solid rgba(0,0,0,0.08)',
        backgroundColor: bgColor,
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
        userSelect: 'none',
      }}
    >
      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: '14px 14px 8px',
          overflowY: 'auto',
        }}
      >
        <p style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.5,
          color: '#1e293b',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}>
          {content}
        </p>
      </div>

      {/* Footer */}
      <div style={{ padding: '0 12px 10px' }}>
        {/* Author + time */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          color: '#94a3b8',
          marginBottom: 8,
        }}>
          <span style={{
            fontWeight: 600,
            color: '#475569',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 100,
          }}>
            {displayName}
          </span>
          <span>·</span>
          <span>{getRelativeTime(createdAt)}</span>
        </div>

        {/* Emoji reactions */}
        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}
          onPointerDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
        >
          {EMOJIS.map(emoji => {
            const count = reactions[emoji]?.length ?? 0;
            const active = reactions[emoji]?.includes(currentUserId) ?? false;
            return (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                title={active ? `Remove ${emoji}` : `React with ${emoji}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  padding: '2px 6px',
                  borderRadius: 999,
                  border: `1px solid ${active ? '#a5b4fc' : '#e2e8f0'}`,
                  backgroundColor: active ? '#eef2ff' : 'rgba(255,255,255,0.6)',
                  color: active ? '#4338ca' : '#64748b',
                  fontSize: 12,
                  cursor: 'pointer',
                  transform: bouncingEmoji === emoji ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ lineHeight: 1 }}>{emoji}</span>
                {count > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1 }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </HTMLContainer>
  );
}
