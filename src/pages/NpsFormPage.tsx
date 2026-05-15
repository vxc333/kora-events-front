import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { submitNps } from '@/services/nps'

type Stage = 'form' | 'submitting' | 'success' | 'duplicate' | 'error'

const SCORE_LABELS: Record<number, string> = {
  0: 'Péssimo',
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Abaixo do esperado',
  5: 'Neutro',
  6: 'Razoável',
  7: 'Bom',
  8: 'Muito bom',
  9: 'Excelente',
  10: 'Incrível!',
}

function getScoreColor(score: number): { bg: string; text: string; ring: string } {
  if (score <= 6) return { bg: '#FEF2F2', text: '#DC2626', ring: '#FCA5A5' }
  if (score <= 8) return { bg: '#FFFBEB', text: '#D97706', ring: '#FCD34D' }
  return { bg: '#F0FDF4', text: '#16A34A', ring: '#86EFAC' }
}

function getSelectedGradient(score: number): string {
  if (score <= 6) return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
  if (score <= 8) return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
  return 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
}

function getRespondentToken(eventId: string): string {
  const key = `kora-nps-token-${eventId}`
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const token = crypto.randomUUID()
  localStorage.setItem(key, token)
  return token
}

function hasAlreadySubmitted(eventId: string): boolean {
  return localStorage.getItem(`kora-nps-done-${eventId}`) === '1'
}

function markSubmitted(eventId: string) {
  localStorage.setItem(`kora-nps-done-${eventId}`, '1')
}

export function NpsFormPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [selected, setSelected] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [stage, setStage] = useState<Stage>('form')
  const [hovered, setHovered] = useState<number | null>(null)
  const commentRef = useRef<HTMLTextAreaElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (eventId && hasAlreadySubmitted(eventId)) setStage('duplicate')
  }, [eventId])

  useEffect(() => {
    if (selected !== null && commentRef.current) {
      setTimeout(() => commentRef.current?.focus(), 300)
    }
  }, [selected])

  async function handleSubmit() {
    if (selected === null || !eventId) return
    setStage('submitting')
    try {
      const respondentToken = getRespondentToken(eventId)
      await submitNps(eventId, { score: selected, comment: comment.trim() || undefined, respondentToken })
      markSubmitted(eventId)
      setStage('success')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        markSubmitted(eventId!)
        setStage('duplicate')
      } else {
        setStage('error')
      }
    }
  }

  const activeScore = hovered ?? selected

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-bg)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background blobs */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(91,33,182,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--color-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L11.5 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H6.5L9 2Z" fill="white" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', color: 'var(--color-brand)' }}>
              kora
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Avaliação de evento
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
            padding: '2.5rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {stage === 'success' && <SuccessState score={selected!} />}
          {stage === 'duplicate' && <DuplicateState />}
          {stage === 'error' && (
            <ErrorState onRetry={() => setStage('form')} />
          )}

          {(stage === 'form' || stage === 'submitting') && (
            <>
              {/* Question */}
              <div style={{ marginBottom: '2rem' }}>
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.375rem, 4vw, 1.75rem)',
                    color: 'var(--color-text)',
                    lineHeight: 1.25,
                    margin: '0 0 0.75rem',
                    fontWeight: 400,
                  }}
                >
                  Em uma escala de 0 a 10, qual a probabilidade de você recomendar este evento a um amigo?
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Sua opinião é muito importante para nós.
                </p>
              </div>

              {/* Score Buttons */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(11, 1fr)',
                    gap: '6px',
                  }}
                >
                  {Array.from({ length: 11 }, (_, i) => {
                    const isSelected = selected === i
                    const isHovered = hovered === i
                    const colors = getScoreColor(i)
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={stage === 'submitting'}
                        onClick={() => setSelected(i)}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          aspectRatio: '1',
                          borderRadius: '10px',
                          border: isSelected
                            ? '2px solid transparent'
                            : `2px solid ${isHovered ? colors.ring : 'var(--color-border)'}`,
                          background: isSelected
                            ? getSelectedGradient(i)
                            : isHovered
                            ? colors.bg
                            : 'var(--color-bg)',
                          color: isSelected ? 'white' : isHovered ? colors.text : 'var(--color-text)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: 'clamp(0.75rem, 2vw, 0.9375rem)',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          transform: isSelected ? 'scale(1.08)' : isHovered ? 'scale(1.04)' : 'scale(1)',
                          boxShadow: isSelected
                            ? `0 4px 12px ${colors.ring}60`
                            : 'none',
                          outline: 'none',
                        }}
                        aria-label={`Nota ${i}: ${SCORE_LABELS[i]}`}
                        aria-pressed={isSelected}
                      >
                        {i}
                      </button>
                    )
                  })}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                  }}
                >
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                    Nada provável
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                    Extremamente provável
                  </span>
                </div>
              </div>

              {/* Score label */}
              <div
                style={{
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  transition: 'opacity 0.2s',
                  opacity: activeScore !== null ? 1 : 0,
                }}
              >
                {activeScore !== null && (
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: getScoreColor(activeScore).text,
                      background: getScoreColor(activeScore).bg,
                      padding: '0.25rem 0.875rem',
                      borderRadius: '999px',
                      border: `1px solid ${getScoreColor(activeScore).ring}`,
                    }}
                  >
                    {SCORE_LABELS[activeScore]}
                  </span>
                )}
              </div>

              {/* Comment textarea — slides in after selection */}
              <div
                style={{
                  overflow: 'hidden',
                  maxHeight: selected !== null ? '200px' : '0',
                  opacity: selected !== null ? 1 : 0,
                  transition: 'max-height 0.35s ease, opacity 0.35s ease',
                  marginBottom: selected !== null ? '1.5rem' : '0',
                }}
              >
                <label
                  htmlFor="nps-comment"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Quer deixar um comentário? <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(opcional)</span>
                </label>
                <textarea
                  id="nps-comment"
                  ref={commentRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte-nos o que achou do evento..."
                  rows={3}
                  maxLength={500}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1.5px solid var(--color-border)',
                    background: 'var(--color-bg)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.875rem',
                    color: 'var(--color-text)',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--color-brand)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)' }}
                />
                <div style={{ textAlign: 'right', fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  {comment.length}/500
                </div>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selected === null || stage === 'submitting'}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: selected !== null ? 'var(--color-brand)' : 'var(--color-bg-muted)',
                  color: selected !== null ? 'white' : 'var(--color-text-disabled)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: selected !== null && stage !== 'submitting' ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  letterSpacing: '-0.01em',
                }}
              >
                {stage === 'submitting' ? (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{ animation: 'spin 0.8s linear infinite' }}
                    >
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
                      <path d="M14 8a6 6 0 01-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar avaliação'
                )}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            marginTop: '1.5rem',
          }}
        >
          Seus dados são tratados com sigilo e usados apenas para melhorar nossos eventos.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function SuccessState({ score }: { score: number }) {
  const colors = getScoreColor(score)
  const emoji = score >= 9 ? '🎉' : score >= 7 ? '😊' : '🙏'
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '1rem 0',
        animation: 'fadeUp 0.4s ease both',
      }}
    >
      <div
        style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          animation: 'pop 0.5s ease 0.1s both',
          display: 'block',
        }}
      >
        {emoji}
      </div>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: colors.bg,
          color: colors.text,
          padding: '0.375rem 1rem',
          borderRadius: '999px',
          border: `1px solid ${colors.ring}`,
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.25rem',
        }}
      >
        Nota {score} — {SCORE_LABELS[score]}
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.625rem',
          fontWeight: 400,
          color: 'var(--color-text)',
          margin: '0 0 0.75rem',
        }}
      >
        Obrigado pela sua avaliação!
      </h2>
      <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
        Seu feedback foi registrado com sucesso e nos ajudará a criar experiências ainda melhores.
      </p>
    </div>
  )
}

function DuplicateState() {
  return (
    <div style={{ textAlign: 'center', padding: '1rem 0', animation: 'fadeUp 0.4s ease both' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.625rem',
          fontWeight: 400,
          color: 'var(--color-text)',
          margin: '0 0 0.75rem',
        }}
      >
        Avaliação já registrada
      </h2>
      <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
        Você já avaliou este evento. Agradecemos por compartilhar sua experiência!
      </p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '1rem 0', animation: 'fadeUp 0.4s ease both' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.625rem',
          fontWeight: 400,
          color: 'var(--color-text)',
          margin: '0 0 0.75rem',
        }}
      >
        Algo deu errado
      </h2>
      <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
        Não conseguimos enviar sua avaliação. Tente novamente.
      </p>
      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: '0.75rem 2rem',
          borderRadius: '10px',
          border: '1.5px solid var(--color-border)',
          background: 'white',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.9375rem',
          fontWeight: 500,
          color: 'var(--color-text)',
          cursor: 'pointer',
        }}
      >
        Tentar novamente
      </button>
    </div>
  )
}
