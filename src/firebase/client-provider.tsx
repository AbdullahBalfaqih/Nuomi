'use client';

import { ReactNode } from 'react';
import { FirebaseProvider } from './provider';

// This is a mock provider that doesn't actually initialize Firebase.
// It's used to prevent the app from crashing while we work on the design.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  
  // Mock Firebase services. We pass `null` to the provider.
  // The `as any` is used to bypass TypeScript errors because we know
  // we are not using Firebase for now.
  return (
    <FirebaseProvider app={null as any} auth={null as any} firestore={null as any}>
      {children}
    </FirebaseProvider>
  );
}
