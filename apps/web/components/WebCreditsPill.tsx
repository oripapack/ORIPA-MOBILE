'use client';

import { useAuth, SignInButton, UserButton } from '@clerk/nextjs';
import { usePullStore } from '@/store/usePullStore';

const C = {
  text: '#F5F5F5',
  textMuted: '#606068',
  green: '#10b981',
  surfaceHigh: '#131318',
  border: 'rgba(255,255,255,0.06)',
} as const;

const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

function WebCreditsPillAuthed() {
  const { isLoaded, isSignedIn } = useAuth();
  const credits = usePullStore((s) => s.credits);
  const creditsLoading = usePullStore((s) => s.creditsLoading);

  if (!isLoaded) {
    return (
      <div style={{
        padding: '6px 14px',
        background: C.surfaceHigh,
        border: `1px solid ${C.border}`,
        borderRadius: 999,
        fontSize: 12,
        color: C.textMuted,
      }}>
        …
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          type="button"
          style={{
            padding: '6px 14px',
            background: C.surfaceHigh,
            border: `1px solid ${C.border}`,
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            color: C.text,
            cursor: 'pointer',
          }}
        >
          Sign in
        </button>
      </SignInButton>
    );
  }

  const label =
    creditsLoading && credits == null
      ? '…'
      : credits == null
        ? '—'
        : credits.toLocaleString();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        background: C.surfaceHigh,
        border: `1px solid ${C.border}`,
        borderRadius: 999,
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <circle cx="6" cy="6" r="5" stroke={C.green} strokeWidth="1.2" />
          <path d="M6 3.5v5M4 5.5l2-2 2 2" stroke={C.green} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{label}</span>
        <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>cr</span>
      </div>
      <UserButton />
    </div>
  );
}

export function WebCreditsPill() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <span style={{ fontSize: 11, color: C.textMuted }}>Demo</span>
    );
  }

  return <WebCreditsPillAuthed />;
  }
