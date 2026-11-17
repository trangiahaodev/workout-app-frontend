import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Spinner, XStack, YStack } from "tamagui";
import { BaseText } from "../BaseText";
import { useAuth } from "../../hooks/useAuth";
import {
  clearChatHistory,
  fetchChatHistory,
  sendChatToCoach,
} from "../../services/aiService";
import { ChatMessageItem } from "../../types";

const QUICK_PROMPTS = [
  "Tuần này tôi tập đủ volume chưa?",
  "Nhận xét lộ trình hiện tại của tôi",
  "Gợi ý bài tập thay thế khi mỏi vai",
];

interface FloatingAICoachProps {
  currentRouteName?: string;
}

export function FloatingAICoach({ currentRouteName }: FloatingAICoachProps) {
  const { userId } = useAuth();
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Ẩn khi chưa đăng nhập hoặc đang ở màn hình thực hành buổi tập
  const shouldHide = !userId || currentRouteName === "WorkoutSession";

  useEffect(() => {
    if (!visible || !userId) return;
    let active = true;
    setLoadingHistory(true);
    fetchChatHistory(userId)
      .then((list) => {
        if (active) setMessages(list);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingHistory(false);
      });

    return () => {
      active = false;
    };
  }, [visible, userId]);

  useEffect(() => {
    if (visible && messages.length > 0) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, messages.length, sending]);

  if (shouldHide) return null;

  async function handleSend(textOverride?: string) {
    const content = (textOverride ?? input).trim();
    if (!content || !userId || sending) return;

    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessageItem = {
      _id: optimisticId,
      userId,
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    if (!textOverride) setInput("");
    setSending(true);

    try {
      const res = await sendChatToCoach(userId, content);
      setMessages((prev) => [
        ...prev.filter((m) => m._id !== optimisticId),
        res.userMessage,
        res.assistantMessage,
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          _id: `err-${Date.now()}`,
          userId,
          role: "assistant",
          content:
            "Không thể kết nối tới AI Coach lúc này. Bạn kiểm tra mạng và thử lại nhé!",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function handleClear() {
    if (!userId) return;
    setMessages([]);
    await clearChatHistory(userId).catch(() => {});
  }

  return (
    <>
      {/* Nút nổi xuyên suốt ứng dụng */}
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.fab,
          pressed && { transform: [{ scale: 0.96 }], opacity: 0.92 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Mở trợ lý AI Coach">
        <Ionicons name="sparkles" size={17} color="#FFFFFF" />
        <Text numberOfLines={1} style={styles.fabText}>
          AI Coach
        </Text>
      </Pressable>

      {/* Cửa sổ hội thoại AI Coach */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.backdrop}>
          <YStack
            backgroundColor="$background"
            borderTopLeftRadius={24}
            borderTopRightRadius={24}
            height="82%"
            borderWidth={1}
            borderColor="$borderColor"
            overflow="hidden">
            {/* Header */}
            <XStack
              paddingHorizontal="$4"
              paddingVertical="$3.5"
              backgroundColor="$cardBg"
              borderBottomWidth={1}
              borderColor="$borderColor"
              alignItems="center"
              justifyContent="space-between"
              gap="$2">
              <XStack alignItems="center" gap="$2.5" flex={1}>
                <YStack
                  width={36}
                  height={36}
                  borderRadius={18}
                  backgroundColor="#111111"
                  alignItems="center"
                  justifyContent="center">
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                </YStack>
                <YStack flex={1}>
                  <BaseText fontSize={16} fontWeight="800" color="$textPrimary">
                    AI Coach
                  </BaseText>
                  <BaseText
                    fontSize={12}
                    color="$textSecondary"
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    Tư vấn dựa trên hồ sơ & lịch sử tập
                  </BaseText>
                </YStack>
              </XStack>

              <XStack alignItems="center" gap="$3.5">
                {messages.length > 0 && (
                  <Pressable onPress={handleClear} hitSlop={10}>
                    <Ionicons name="trash-outline" size={20} color="#8E8E93" />
                  </Pressable>
                )}
                <Pressable onPress={() => setVisible(false)} hitSlop={10}>
                  <Ionicons name="close" size={24} color="#111111" />
                </Pressable>
              </XStack>
            </XStack>

            {/* Nội dung tin nhắn */}
            <ScrollView
              ref={scrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, gap: 12 }}>
              {loadingHistory ? (
                <Spinner size="small" color="$textPrimary" marginTop="$4" />
              ) : messages.length === 0 ? (
                <YStack
                  backgroundColor="$cardBg"
                  padding="$4"
                  borderRadius={16}
                  borderWidth={1}
                  borderColor="$borderColor"
                  gap="$2">
                  <BaseText fontWeight="700" fontSize={15} color="$textPrimary">
                    Chào bạn! Tôi là AI Coach cá nhân của bạn.
                  </BaseText>
                  <BaseText
                    fontSize={13}
                    color="$textSecondary"
                    lineHeight={20}>
                    Tôi đã nắm được mục tiêu, lộ trình hiện tại và lịch sử các
                    buổi tập của bạn. Hãy hỏi tôi về kỹ thuật động tác, mức tạ,
                    phục hồi hoặc tiến độ tuần này nhé!
                  </BaseText>
                </YStack>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <XStack
                      key={msg._id}
                      justifyContent={isUser ? "flex-end" : "flex-start"}>
                      <YStack
                        maxWidth="84%"
                        paddingHorizontal="$3.5"
                        paddingVertical="$2.5"
                        borderRadius={16}
                        backgroundColor={isUser ? "#111111" : "$cardBg"}
                        borderWidth={isUser ? 0 : 1}
                        borderColor="$borderColor">
                        <BaseText
                          fontSize={14}
                          lineHeight={20}
                          color={isUser ? "#FFFFFF" : "$textPrimary"}>
                          {msg.content}
                        </BaseText>
                      </YStack>
                    </XStack>
                  );
                })
              )}

              {sending && (
                <XStack justifyContent="flex-start">
                  <XStack
                    paddingHorizontal="$3.5"
                    paddingVertical="$2.5"
                    borderRadius={16}
                    backgroundColor="$cardBg"
                    borderWidth={1}
                    borderColor="$borderColor"
                    alignItems="center"
                    gap="$2">
                    <Spinner size="small" color="$textPrimary" />
                    <BaseText fontSize={13} color="$textSecondary">
                      AI Coach đang phân tích...
                    </BaseText>
                  </XStack>
                </XStack>
              )}
            </ScrollView>

            {/* Gợi ý nhanh */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ maxHeight: 44 }}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 8,
                alignItems: "center",
              }}>
              {QUICK_PROMPTS.map((q) => (
                <Pressable
                  key={q}
                  onPress={() => void handleSend(q)}
                  disabled={sending}
                  style={styles.chip}>
                  <BaseText fontSize={12} fontWeight="600" color="#111111">
                    {q}
                  </BaseText>
                </Pressable>
              ))}
            </ScrollView>

            {/* Thanh nhập câu hỏi */}
            <XStack
              padding="$3"
              paddingBottom={Platform.OS === "ios" ? "$5" : "$3"}
              backgroundColor="$cardBg"
              borderTopWidth={1}
              borderColor="$borderColor"
              alignItems="center"
              gap="$2">
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Hỏi về kỹ thuật, lịch tập, tiến độ..."
                placeholderTextColor="#8E8E93"
                style={styles.input}
                editable={!sending}
                onSubmitEditing={() => void handleSend()}
                returnKeyType="send"
              />
              <Pressable
                onPress={() => void handleSend()}
                disabled={!input.trim() || sending}
                style={[
                  styles.sendBtn,
                  (!input.trim() || sending) && { opacity: 0.4 },
                ]}>
                <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
              </Pressable>
            </XStack>
          </YStack>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 18,
    bottom: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#111111",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    includeFontPadding: false,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  chip: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 90,
    backgroundColor: "#F5F5F7",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: "#111111",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
});
