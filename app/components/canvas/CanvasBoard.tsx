'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Tldraw,
  createShapeId,
  type Editor,
  type TLShapeId,
} from 'tldraw';
import 'tldraw/tldraw.css';
import { IdeaCardShapeUtil, NOTE_W, NOTE_H } from './IdeaCardShapeUtil';
import { IdeasContext } from './IdeasContext';
import { IdeaWithReactions } from '../../types';

// ── Props ─────────────────────────────────────────────────────────────────────

interface CanvasBoardProps {
  currentUserId: string;
  displayName: string;
  ideas: IdeaWithReactions[];
  isDark: boolean;
  addIdea: (content: string, x?: number, y?: number) => void;
  toggleReaction: (ideaId: string, emoji: string) => void;
  updateIdeaPosition: (ideaId: string, x: number, y: number) => void;
}

// ── Shape utils (stable reference outside component) ─────────────────────────

const shapeUtils = [IdeaCardShapeUtil];

// ── CanvasBoard ───────────────────────────────────────────────────────────────

export default function CanvasBoard({
  currentUserId,
  displayName,
  ideas,
  isDark,
  addIdea,
  toggleReaction,
  updateIdeaPosition,
}: CanvasBoardProps) {
  const editorRef = useRef<Editor | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formText, setFormText] = useState('');

  // Build ideasById map for context
  const ideasById = useMemo(() => {
    const map: Record<string, IdeaWithReactions> = {};
    for (const idea of ideas) map[idea.id] = idea;
    return map;
  }, [ideas]);

  // Context value (stable shape — toggleReaction identity from useCallback in hook)
  const contextValue = useMemo(
    () => ({ ideasById, currentUserId, toggleReaction }),
    [ideasById, currentUserId, toggleReaction]
  );

  // ── Sync: dark mode → tldraw ──────────────────────────────────────────────

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.user.updateUserPreferences({ colorScheme: isDark ? 'dark' : 'light' });
  }, [isDark, editorReady]);

  // ── Sync: InstantDB → tldraw ───────────────────────────────────────────────

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const pageId = editor.getCurrentPageId();

    editor.store.mergeRemoteChanges(() => {
      const incomingIds = new Set<TLShapeId>();

      for (let i = 0; i < ideas.length; i++) {
        const idea = ideas[i];
        const shapeId = createShapeId(idea.id);
        incomingIds.add(shapeId);

        // Default positions: cascade from (40, 40) with 280px spacing
        const defaultX = (i % 5) * 280 + 40;
        const defaultY = Math.floor(i / 5) * 320 + 40;

        const existing = editor.getShape(shapeId);
        if (!existing) {
          editor.createShape({
            id: shapeId,
            type: 'ideaCard',
            x: idea.x ?? defaultX,
            y: idea.y ?? defaultY,
            props: {
              w: NOTE_W,
              h: NOTE_H,
              ideaId: idea.id,
              content: idea.content,
              displayName: idea.displayName,
              createdAt: idea.createdAt,
            },
          });
        } else {
          // Update content/position if changed (avoid no-op updates)
          const p = existing.props as IdeaCardShapeUtil['getDefaultProps'] extends () => infer R ? R : never;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ep = existing.props as any;
          const posX = idea.x ?? existing.x;
          const posY = idea.y ?? existing.y;
          if (
            ep.content !== idea.content ||
            ep.displayName !== idea.displayName ||
            existing.x !== posX ||
            existing.y !== posY
          ) {
            editor.updateShape({
              id: shapeId,
              type: 'ideaCard',
              x: posX,
              y: posY,
              props: {
                ...ep,
                content: idea.content,
                displayName: idea.displayName,
              },
            });
          }
        }
      }

      // Remove shapes for deleted ideas
      const allIdeaShapes = editor
        .getCurrentPageShapes()
        .filter(s => s.type === 'ideaCard');
      for (const shape of allIdeaShapes) {
        if (!incomingIds.has(shape.id)) {
          editor.deleteShape(shape.id);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas, editorReady]);

  // ── Sync: tldraw → InstantDB (position changes only) ──────────────────────

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;
    setEditorReady(true);

    // Set select tool as default
    editor.setCurrentTool('select');

    const unsubscribe = editor.store.listen(
      (entry) => {
        for (const [, next] of Object.values(entry.changes.updated)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const shape = next as any;
          if (
            shape.typeName === 'shape' &&
            shape.type === 'ideaCard' &&
            typeof shape.x === 'number' &&
            typeof shape.y === 'number'
          ) {
            // Shape id format: "shape:<ideaId>"
            const ideaId = (shape.id as string).replace(/^shape:/, '');
            updateIdeaPosition(ideaId, shape.x, shape.y);
          }
        }
      },
      { source: 'user', scope: 'document' }
    );

    return () => {
      unsubscribe();
    };
  }, [updateIdeaPosition]);

  // ── Add idea handler ───────────────────────────────────────────────────────

  const handleAddIdea = useCallback(() => {
    if (!formText.trim()) return;
    const editor = editorRef.current;
    let x = 0;
    let y = 0;
    if (editor) {
      const center = editor.getViewportPageBounds().center;
      x = center.x - NOTE_W / 2 + (Math.random() - 0.5) * 240;
      y = center.y - NOTE_H / 2 + (Math.random() - 0.5) * 240;
    }
    addIdea(formText.trim(), x, y);
    setFormText('');
    setShowForm(false);
  }, [formText, addIdea]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <IdeasContext.Provider value={contextValue}>
      <div style={{ position: 'absolute', inset: 0, top: 56 }}>
        <Tldraw
          shapeUtils={shapeUtils}
          onMount={handleMount}
          components={{
            // Hide drawing tools — this is a post-it board, not a drawing app
            Toolbar: null,
            MainMenu: null,
            PageMenu: null,
            ActionsMenu: null,
            StylePanel: null,
          }}
        />

        {/* Floating "New Idea" button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              position: 'absolute',
              bottom: 80,
              right: 24,
              zIndex: 400,
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: '#6366f1',
              color: '#fff',
              border: 'none',
              fontSize: 26,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99,102,241,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s, background-color 0.15s',
            }}
            title="New idea"
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4f46e5')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6366f1')}
          >
            +
          </button>
        )}

        {/* Floating idea form */}
        {showForm && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(2px)',
            }}
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <div style={{
              width: '100%',
              maxWidth: 400,
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
            }}>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: '#94a3b8' }}>
                Posting as <strong style={{ color: '#475569' }}>{displayName}</strong>
              </p>
              <textarea
                autoFocus
                value={formText}
                onChange={e => setFormText(e.target.value)}
                onKeyDown={e => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleAddIdea();
                  if (e.key === 'Escape') setShowForm(false);
                }}
                placeholder="Share an idea…"
                maxLength={500}
                rows={4}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '2px solid #e2e8f0',
                  outline: 'none',
                  fontSize: 15,
                  lineHeight: 1.5,
                  resize: 'none',
                  fontFamily: 'inherit',
                  color: '#1e293b',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#818cf8')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIdea}
                  disabled={!formText.trim()}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: formText.trim() ? '#6366f1' : '#e2e8f0',
                    color: formText.trim() ? '#fff' : '#94a3b8',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: formText.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                  }}
                >
                  Post idea
                </button>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 11, color: '#cbd5e1', textAlign: 'right' }}>
                ⌘↵ to submit · Esc to cancel
              </p>
            </div>
          </div>
        )}
      </div>
    </IdeasContext.Provider>
  );
}
