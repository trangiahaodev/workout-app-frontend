import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { isAxiosError } from "axios";
import { useAuth } from "./useAuth";
import {
  getProfile,
  profileErrorMessage,
  upsertProfile,
} from "../services/profileService";
import { Profile, UpsertProfilePayload } from "../types";

interface ProfileContextValue {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  save: (payload: UpsertProfilePayload) => Promise<Profile>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  const reload = useCallback(async () => {
    const current = ++request.current;
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getProfile(userId);
      if (current === request.current) setProfile(result);
    } catch (err) {
      if (current === request.current) {
        if (isAxiosError(err) && err.response?.status === 404) {
          setProfile(null);
          setError(null);
        } else {
          setError(profileErrorMessage(err));
        }
      }
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
    return () => {
      request.current += 1;
    };
  }, [reload]);

  const save = useCallback(async (payload: UpsertProfilePayload) => {
    const result = await upsertProfile(payload);
    request.current += 1;
    setProfile(result);
    setError(null);
    setLoading(false);
    return result;
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loading, error, reload, save }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error("useProfile requires ProfileProvider");
  return value;
}
