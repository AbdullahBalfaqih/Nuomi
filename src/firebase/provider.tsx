'use client';

import { Auth, User, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

export interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: (Auth & { signIn: typeof signInWithEmailAndPassword }) | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider = ({
  children,
  app,
  auth,
  firestore,
}: {
  children: ReactNode;
  app: FirebaseApp;
  auth: Auth & { signIn: typeof signInWithEmailAndPassword };
  firestore: Firestore;
}) => {
  return (
    <FirebaseContext.Provider value={{ app, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () =>
  useContext(FirebaseContext) as FirebaseContextValue;
export const useFirebaseApp = () => useFirebase().app as FirebaseApp;
export const useAuth = () => useFirebase().auth as Auth & { signIn: typeof signInWithEmailAndPassword };
export const useFirestore = () => useFirebase().firestore as Firestore;
