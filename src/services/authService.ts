import AsyncStorage from "@react-native-async-storage/async-storage";
import { isAxiosError } from "axios";
import axiosClient from "../api/axiosClient";

// Tạm đặt types auth tại đây; có thể chuyển vào src/types sau.
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthSession {
  token: string;
  userId: string;
}

const TOKEN_KEY = "@workout/token";
const USER_ID_KEY = "@workout/userId";

// Render free có thể mất 30s–1 phút để "thức dậy" ở lần gọi đầu.
const AUTH_TIMEOUT = 60000;

type Dict = Record<string, unknown>;

function asDict(value: unknown): Dict | null {
  return value && typeof value === "object" ? (value as Dict) : null;
}

function pickString(source: Dict | null, keys: string[]): string | null {
  if (!source) return null;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// Decode base64url thuần TS (không phụ thuộc atob, vốn không có type trong RN).
function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  let bits = 0;
  let buffer = 0;
  let bytes = "";
  for (const char of base64) {
    const index = BASE64_CHARS.indexOf(char);
    if (index < 0) continue;
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  try {
    return decodeURIComponent(
      bytes
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
  } catch {
    return bytes;
  }
}

function userIdFromJwt(token: string): string | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    return pickString(asDict(JSON.parse(decodeBase64Url(payload))), [
      "userId",
      "id",
      "_id",
      "sub",
    ]);
  } catch {
    return null;
  }
}

// Swagger chưa mô tả response của auth → chấp nhận nhiều dạng phổ biến.
export function parseAuthResponse(res: unknown): AuthSession | null {
  const root = asDict(res);
  const data = asDict(root?.data);
  const token =
    pickString(root, ["token", "accessToken"]) ??
    pickString(data, ["token", "accessToken"]);
  if (!token) return null;

  const userId =
    pickString(root, ["userId"]) ??
    pickString(asDict(root?.user), ["_id", "id", "userId"]) ??
    pickString(data, ["userId"]) ??
    pickString(asDict(data?.user), ["_id", "id", "userId"]) ??
    pickString(root, ["_id", "id"]) ??
    userIdFromJwt(token);
  if (!userId) return null;

  return { token, userId };
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const res = await axiosClient.post<never, unknown>("/auth/login", payload, {
    timeout: AUTH_TIMEOUT,
  });
  const session = parseAuthResponse(res);
  if (!session) throw new Error("INVALID_AUTH_RESPONSE");
  return session;
}

// Trả về session nếu backend cấp token ngay khi đăng ký, ngược lại null.
export async function register(
  payload: RegisterPayload,
): Promise<AuthSession | null> {
  const res = await axiosClient.post<never, unknown>(
    "/auth/register",
    payload,
    {
      timeout: AUTH_TIMEOUT,
    },
  );
  return parseAuthResponse(res);
}

export async function saveSession(session: AuthSession): Promise<void> {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, session.token],
    [USER_ID_KEY, session.userId],
  ]);
}

export async function loadSession(): Promise<AuthSession | null> {
  try {
    const entries = await AsyncStorage.multiGet([TOKEN_KEY, USER_ID_KEY]);
    const token = entries[0]?.[1];
    const userId = entries[1]?.[1];
    return token && userId ? { token, userId } : null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY]);
}

export function setAuthHeader(token: string | null): void {
  if (token) {
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosClient.defaults.headers.common.Authorization;
  }
}

export function authErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return error.code === "ECONNABORTED"
        ? "Máy chủ phản hồi quá lâu. Vui lòng thử lại."
        : "Không thể kết nối máy chủ. Kiểm tra mạng rồi thử lại.";
    }
    const message = pickString(asDict(error.response.data), [
      "message",
      "error",
    ]);
    if (message) return message;
    const status = error.response.status;
    if (status === 401) return "Email hoặc mật khẩu không đúng.";
    if (status === 409) return "Email này đã được đăng ký.";
    if (status === 400 || status === 422) {
      return "Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.";
    }
  }
  if (error instanceof Error && error.message === "INVALID_AUTH_RESPONSE") {
    return "Phản hồi đăng nhập không hợp lệ. Vui lòng thử lại sau.";
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
}
