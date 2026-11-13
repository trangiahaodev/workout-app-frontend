import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { finishWorkout } from "../store/slices/workoutSlice";
import {
  AuthSession, LoginPayload, RegisterPayload, clearSession, loadSession,
  login, register, saveSession, setAuthHeader,
} from "../services/authService";

export type AuthStatus = "loading" | "signedOut" | "signedIn";

interface AuthContextValue {
  status: AuthStatus;
  userId: string | null;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [userId, setUserId] = useState<string | null>(null);

  const applySession = useCallback((session: AuthSession) => {
    setAuthHeader(session.token);
    setUserId(session.userId);
    setStatus("signedIn");
  }, []);

  // Mở app: có token trong AsyncStorage → vào thẳng app chính.
  useEffect(() => {
    let active = true;
    void loadSession().then((session) => {
      if (!active) return;
      if (session) applySession(session);
      else setStatus("signedOut");
    });
    return () => { active = false; };
  }, [applySession]);

  const signIn = useCallback(async (payload: LoginPayload) => {
    const session = await login(payload);
    await saveSession(session);
    applySession(session);
  }, [applySession]);

  const signUp = useCallback(async (payload: RegisterPayload) => {
    const session = (await register(payload)) ??
      (await login({ email: payload.email, password: payload.password }));
    await saveSession(session);
    applySession(session);
  }, [applySession]);

  const signOut = useCallback(async () => {
    try {
      await clearSession();
    } finally {
      setAuthHeader(null);
      dispatch(finishWorkout());
      setUserId(null);
      setStatus("signedOut");
    }
  }, [dispatch]);

  const value = useMemo(
    () => ({ status, userId, signIn, signUp, signOut }),
    [status, userId, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth requires AuthProvider");
  return value;
}
