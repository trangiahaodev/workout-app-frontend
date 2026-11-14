import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { finishWorkout } from "../store/slices/workoutSlice";
import {
  completeSession,
  createSession,
  submitWorkoutLogs,
  ExerciseExtras,
} from "../services/logService";
import { WorkoutSession } from "../types";
import { DEFAULT_SESSION_ID } from "../components/home/mockData";

export interface CompleteWorkoutResult {
  planId?: string;
  sessionId?: string;
}

export function useCompleteWorkout(
  onSuccess?: (result: CompleteWorkoutResult) => void,
) {
  const dispatch = useDispatch();
  const {
    planId,
    sessionId: reduxSessionId,
    logs,
  } = useSelector((state: RootState) => state.workout);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const complete = async (extras: ExerciseExtras = {}) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    try {
      const doneLogs = Object.fromEntries(
        Object.entries(logs).filter(([, sets]) =>
          sets.some((s) => s.isCompleted),
        ),
      );

      let targetSessionId = reduxSessionId;

      if (targetSessionId && targetSessionId !== DEFAULT_SESSION_ID) {
        try {
          await completeSession(targetSessionId);
        } catch (updateErr) {
          console.warn(
            "Không thể cập nhật trạng thái buổi tập qua API:",
            updateErr,
          );
        }
      }

      if (!targetSessionId) {
        targetSessionId = DEFAULT_SESSION_ID;
      }

      if (Object.keys(doneLogs).length > 0) {
        try {
          await submitWorkoutLogs(targetSessionId, doneLogs, extras);
        } catch (submitErr) {
          console.warn("Không thể lưu logs lên API:", submitErr);
        }
      }

      dispatch(finishWorkout());
      onSuccess?.({
        planId: planId ?? undefined,
        sessionId: targetSessionId,
      });
    } catch (e: unknown) {
      submittingRef.current = false;
      console.error("Lỗi gửi buổi tập:", e);
      setError("Gửi buổi tập thất bại, vui lòng thử lại.");
      throw e;
    } finally {
      setSubmitting(false);
    }
  };

  return { complete, submitting, error };
}
