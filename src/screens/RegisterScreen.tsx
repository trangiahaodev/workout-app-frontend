import React, { useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { XStack, YStack } from "tamagui";
import { BaseText, PrimaryButton } from "../components";
import {
  AuthField,
  AuthLayout,
  EMAIL_PATTERN,
  SLOW_SERVER_HINT,
  useSlowHint,
} from "../components/auth/authUi";
import { useAuth } from "../hooks/useAuth";
import { RegisterScreenNavigationProp } from "../navigation/authTypes";
import { authErrorMessage } from "../services/authService";

const MIN_PASSWORD_LENGTH = 6;

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const slow = useSlowHint(submitting);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = "Vui lòng nhập email.";
    else if (!EMAIL_PATTERN.test(trimmed))
      next.email = "Email không đúng định dạng.";
    if (!password) next.password = "Vui lòng nhập mật khẩu.";
    else if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
    }
    return next;
  }

  async function handleSubmit() {
    if (submittingRef.current) return;
    const next = validate();
    setErrors(next);
    setApiError(null);
    if (next.email || next.password) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const name = fullName.trim();
      const trimmedEmail = email.trim();
      await signUp({
        email: trimmedEmail,
        password,
        ...(name ? { fullName: name } : {}),
      });

      if (Platform.OS === "web") {
        globalThis.alert?.(
          "Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.",
        );
        navigation.navigate("Login", { email: trimmedEmail || undefined });
      } else {
        Alert.alert(
          "Đăng ký thành công",
          "Tài khoản đã được tạo. Vui lòng đăng nhập để thiết lập mục tiêu tập luyện.",
          [
            {
              text: "Đăng nhập",
              onPress: () =>
                navigation.navigate("Login", {
                  email: trimmedEmail || undefined,
                }),
            },
          ],
        );
      }
    } catch (err) {
      setApiError(authErrorMessage(err));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Đăng ký để lưu lại lịch tập và nhật ký của bạn.">
      <YStack gap="$3">
        <AuthField
          label="Họ tên (không bắt buộc)"
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChangeText={setFullName}
          autoComplete="name"
          textContentType="name"
          readOnly={submitting}
        />
        <AuthField
          label="Email"
          placeholder="ban@example.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((e) => ({ ...e, email: undefined }));
          }}
          error={errors.email}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          readOnly={submitting}
        />
        <AuthField
          label="Mật khẩu"
          placeholder={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((e) => ({ ...e, password: undefined }));
          }}
          error={errors.password}
          type="password"
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          readOnly={submitting}
          onSubmitEditing={() => {
            void handleSubmit();
          }}
        />
      </YStack>

      <YStack gap="$3">
        {apiError ? (
          <BaseText color="$accent" accessibilityRole="alert">
            {apiError}
          </BaseText>
        ) : null}
        {slow ? (
          <BaseText variant="caption">{SLOW_SERVER_HINT}</BaseText>
        ) : null}
        <PrimaryButton
          title="Đăng ký"
          size="lg"
          loading={submitting}
          accessibilityRole="button"
          onPress={() => {
            void handleSubmit();
          }}
        />
        <XStack justifyContent="center" gap="$1.5" flexWrap="wrap">
          <BaseText variant="body">Đã có tài khoản?</BaseText>
          <BaseText
            fontWeight="700"
            accessibilityRole="link"
            disabled={submitting}
            onPress={() =>
              navigation.navigate("Login", { email: email.trim() || undefined })
            }>
            Đăng nhập
          </BaseText>
        </XStack>
      </YStack>
    </AuthLayout>
  );
}
