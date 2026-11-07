import { isAxiosError } from "axios";
import axiosClient from "../api/axiosClient";
import { Profile, UpsertProfilePayload } from "../types";

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    return await axiosClient.get<never, Profile>(
      `/profiles/${encodeURIComponent(userId)}`,
    );
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

// The deployed backend implements upsert as POST, not PUT.
export function upsertProfile(payload: UpsertProfilePayload): Promise<Profile> {
  return axiosClient.post<never, Profile>("/profiles", payload);
}

export function profileErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return "Không thể kết nối máy chủ. Kiểm tra mạng rồi thử lại.";
    }
    if (error.response.status === 400 || error.response.status === 422) {
      return "Thông tin hồ sơ chưa hợp lệ. Vui lòng kiểm tra các lựa chọn.";
    }
  }
  return "Chưa thể xử lý hồ sơ. Vui lòng thử lại sau.";
}
