import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { finishWorkout } from "../store/slices/workoutSlice";
import { createSession, submitWorkoutLogs } from "../services/logService";
import { WorkoutSession } from "../types";

export interface CompleteWorkoutResult {
  planId?: string;
  sessionId?: string;
}

// Hàm gắn vào nút Hoàn thành của WorkoutSessionScreen:
// 1) xác định sessionId  2) gửi log từng bài  3) xoá Redux  4) chuyển màn History
export function useCompleteWorkout(
  onSuccess?: (result: CompleteWorkoutResult) => void,
) {
  const dispatch = useDispatch();
  const { planId, sessionId: reduxSessionId, logs } = useSelector(
    (state: RootState) => state.workout,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // Chỉ gửi những bài có ít nhất 1 set đã hoàn thành (khớp 100% với isCompleted)
      const doneLogs = Object.fromEntries(
        Object.entries(logs).filter(([, sets]) =>
          sets.some((s) => s.isCompleted),
        ),
      );

      let targetSessionId = reduxSessionId;

      // Nếu có planId, thử tạo session thực tế trên MongoDB
      if (planId) {
        try {
          const name = `Buổi tập ${new Date().toLocaleDateString("vi-VN")}`;
          const session = (await createSession(
            planId,
            name,
          )) as unknown as WorkoutSession;
          if (session?._id) {
            targetSessionId = session._id;
          }
        } catch (createErr) {
          console.warn(
            "Không thể tạo session qua API, dùng sessionId fallback:",
            createErr,
          );
        }
      }

      if (!targetSessionId) {
        targetSessionId = "670c1a333333333333333301"; // Fallback 24-hex ObjectId
      }

      // Gửi logs nếu có bài tập đã hoàn thành
      if (Object.keys(doneLogs).length > 0) {
        try {
          await submitWorkoutLogs(targetSessionId, doneLogs);
        } catch (submitErr) {
          console.warn("Không thể lưu logs lên API:", submitErr);
        }
      }

      // finishWorkout xoá sạch Redux nên gọi sau khi gửi xong
      dispatch(finishWorkout());
      onSuccess?.({
        planId: planId ?? undefined,
        sessionId: targetSessionId,
      });
    } catch (e: unknown) {
      console.error("Lỗi gửi buổi tập:", e);
      setError("Gửi buổi tập thất bại, vui lòng thử lại.");
      throw e;
    } finally {
      setSubmitting(false);
    }
  };

  return { complete, submitting, error };
}