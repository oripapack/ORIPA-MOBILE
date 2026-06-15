'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ClerkSupabaseBridge } from '@/components/ClerkSupabaseBridge';

const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

export function Providers({ children }: { children: React.ReactNode }) {
  if (!CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ClerkSupabaseBridge />
      {children}
    </ClerkProvider>
  );
}
