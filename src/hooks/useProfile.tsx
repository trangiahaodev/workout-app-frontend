import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from "react";
import { DEMO_USER_ID } from "../config/demoUser";
import { getProfile, profileErrorMessage, upsertProfile } from "../services/profileService";
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  const reload = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError(null);
    try {
      const result = await getProfile(DEMO_USER_ID);
      if (current === request.current) setProfile(result);
    } catch (err) {
      if (current === request.current) setError(profileErrorMessage(err));
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    return () => { request.current += 1; };
  }, [reload]);

  const save = useCallback(async (payload: UpsertProfilePayload) => {
    const result = await upsertProfile(payload);
    // Invalidate an older GET so it cannot overwrite a successful save.
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
