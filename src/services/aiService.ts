import axiosClient from "../api/axiosClient";
import { AIInsightResponse, ChatMessageItem } from "../types";

export async function fetchProgressInsights(payload: {
  profileId?: string;
  userId?: string;
}): Promise<AIInsightResponse> {
  return axiosClient.post("/ai/insights", payload, { timeout: 30000 });
}

export async function fetchChatHistory(
  userId: string,
): Promise<ChatMessageItem[]> {
  const res = await axiosClient.get<never, unknown>(`/ai/chat/${userId}`);
  return Array.isArray(res) ? (res as ChatMessageItem[]) : [];
}

export async function sendChatToCoach(
  userId: string,
  message: string,
): Promise<{
  userMessage: ChatMessageItem;
  assistantMessage: ChatMessageItem;
}> {
  return axiosClient.post("/ai/chat", { userId, message }, { timeout: 30000 });
}

export async function clearChatHistory(userId: string): Promise<void> {
  await axiosClient.delete(`/ai/chat/${userId}`);
}
