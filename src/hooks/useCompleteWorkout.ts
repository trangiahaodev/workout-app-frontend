import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { finishWorkout } from "../store/slices/workoutSlice";
import { createSession, submitWorkoutLogs } from "../services/logService";

// Hàm gắn vào onComplete của WorkoutSessionScreen:
// 1) tạo session  2) gửi log từng bài  3) xoá Redux  4) chuyển màn
export function useCompleteWorkout(onSuccess?: () => void) {
  const dispatch = useDispatch();
  const { planId, logs } = useSelector((state: RootState) => state.workout);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = async () => {
    if (submitting || !planId) return;
    setSubmitting(true);
    setError(null);
    try {
      // Chỉ gửi những bài có ít nhất 1 set đã hoàn thành
      const doneLogs = Object.fromEntries(
        Object.entries(logs).filter(([, sets]) =>
          sets.some((s) => s.completed),
        ),
      );

      // Giả định: tạo session ngay lúc bấm Hoàn thành (chờ Hào xác nhận)
      const name = `Buổi tập ${new Date().toLocaleDateString("vi-VN")}`;
      const res: any = await createSession(planId, name);
      const session = res?.data ?? res;
      const sessionId = session?._id ?? session?.id;
      if (!sessionId) throw new Error("Không lấy được sessionId từ server");

      await submitWorkoutLogs(String(sessionId), doneLogs);

      // finishWorkout xoá sạch Redux nên phải gọi SAU khi đã gửi xong
      dispatch(finishWorkout());
      onSuccess?.();
    } catch (e: any) {
      console.error("Lỗi gửi buổi tập:", e);
      setError("Gửi buổi tập thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return { complete, submitting, error };
}