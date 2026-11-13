import React, { useRef, useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { XStack, YStack } from "tamagui";
import { BaseText, PrimaryButton } from "../components";
import {
  AuthField, AuthLayout, EMAIL_PATTERN, SLOW_SERVER_HINT, useSlowHint,
} from "../components/auth/authUi";
import { useAuth } from "../hooks/useAuth";
import { AuthStackParamList, LoginScreenNavigationProp } from "../navigation/authTypes";
import { authErrorMessage } from "../services/authService";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<AuthStackParamList, "Login">>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(route.params?.email ?? "");
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
    else if (!EMAIL_PATTERN.test(trimmed)) next.email = "Email không đúng định dạng.";
    if (!password) next.password = "Vui lòng nhập mật khẩu.";
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
      // Thành công → AuthGate tự chuyển sang app chính (màn này unmount).
      await signIn({ email: email.trim(), password });
    } catch (err) {
      setApiError(authErrorMessage(err));
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Đăng nhập" subtitle="Chào mừng trở lại! Tiếp tục hành trình tập luyện của bạn.">
      <YStack gap="$3">
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
          placeholder="Nhập mật khẩu"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((e) => ({ ...e, password: undefined }));
          }}
          error={errors.password}
          type="password"
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
          readOnly={submitting}
          onSubmitEditing={() => { void handleSubmit(); }}
        />
      </YStack>

      <YStack gap="$3">
        {apiError ? (
          <BaseText color="$accent" accessibilityRole="alert">{apiError}</BaseText>
        ) : null}
        {slow ? <BaseText variant="caption">{SLOW_SERVER_HINT}</BaseText> : null}
        <PrimaryButton
          title="Đăng nhập"
          size="lg"
          loading={submitting}
          accessibilityRole="button"
          onPress={() => { void handleSubmit(); }}
        />
        <XStack justifyContent="center" gap="$1.5" flexWrap="wrap">
          <BaseText variant="body">Chưa có tài khoản?</BaseText>
          <BaseText
            fontWeight="700"
            accessibilityRole="link"
            disabled={submitting}
            onPress={() => navigation.navigate("Register")}>
            Đăng ký
          </BaseText>
        </XStack>
      </YStack>
    </AuthLayout>
  );
}
