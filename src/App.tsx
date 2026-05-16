/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  User, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  getDocs,
  serverTimestamp 
} from "firebase/firestore";
import { LogIn, User as UserIcon, LogOut, Loader2, Mic } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db, signInWithGoogle } from "./lib/firebase";
import { handleFirestoreError } from "./lib/error-handler";
import { Entry, OperationType, Goal } from "./types";
import VoiceLogger from "./components/VoiceLogger";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setGoals([]);
      return;
    }

    const initGoals = async () => {
      const q = query(collection(db, "goals"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      if (snap.empty) {
        const defaultGoals = [
          { userId: user.uid, type: "hydration", targetValue: 64, unit: "oz", frequency: "daily" },
          { userId: user.uid, type: "sleep", targetValue: 8, unit: "hrs", frequency: "daily" },
          { userId: user.uid, type: "medication", targetValue: 1, unit: "dose", frequency: "daily" }
        ];
        for (const g of defaultGoals) {
          await addDoc(collection(db, "goals"), g);
        }
      }
    };
    initGoals();

    const qEntries = query(
      collection(db, "entries"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubEntries = onSnapshot(qEntries, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Entry[];
      setEntries(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "entries");
    });

    const qGoals = query(
      collection(db, "goals"),
      where("userId", "==", user.uid)
    );

    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Goal[];
      setGoals(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "goals");
    });

    return () => {
      unsubEntries();
      unsubGoals();
    };
  }, [user]);

  const handleTranscription = async (text: string) => {
    if (!user) return;
    
    setIsParsing(true);
    try {
      const response = await fetch("/api/parse-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription: text }),
      });

      if (!response.ok) throw new Error("Failed to parse entries");
      
      const { entries: parsedEntries } = await response.json();
      
      for (const entryData of parsedEntries) {
        await addDoc(collection(db, "entries"), {
          ...entryData,
          userId: user.uid,
          source: "voice",
          rawTranscription: text,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error parsing entries:", error);
    } finally {
      setIsParsing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F7]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/70 border-bottom border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Vital</h1>
        </div>

        {user ? (
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => auth.signOut()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden border border-white shadow-sm">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-5 w-5 m-1.5 text-gray-400" />
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </button>
        )}
      </header>

      <main className="pt-24 flex flex-col items-center">
        {!user ? (
          <div className="flex flex-col items-center justify-center h-[70vh] px-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 rounded-[2rem] bg-white shadow-xl border border-gray-100"
            >
              <Mic className="h-12 w-12 text-blue-500 mx-auto" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Voice-First Health</h2>
              <p className="text-gray-500 max-w-xs mx-auto">
                Instant capture of what enters your body and how it responds.
              </p>
            </div>
          </div>
        ) : (
          <>
            <VoiceLogger onTranscriptionComplete={handleTranscription} />
            
            <AnimatePresence>
              {isParsing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed bottom-32 bg-white px-6 py-3 rounded-full shadow-2xl border border-gray-100 flex items-center space-x-3 z-50"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm font-bold text-gray-700">Analyzing entry...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Dashboard entries={entries} goals={goals} />
          </>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20" />
    </div>
  );
}
