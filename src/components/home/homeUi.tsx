import { YStack } from 'tamagui';
import { BaseText } from '../BaseText';
import React from 'react';

import { PrimaryButton } from '../PrimaryButton';
import { Feather } from '@expo/vector-icons';

export const colors = { background: '#0A0A0A', card: '#1C1C1E', border: '#2C2C2E', muted: '#B0B0B8', primary: '#1E90FF', text: '#FFFFFF' };
export const ui = ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 18, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', flexShrink: 1 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  label: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  badge: { color: colors.primary, fontSize: 12, fontWeight: '700', backgroundColor: '#102A42', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#102A42', justifyContent: 'center', alignItems: 'center' },
} as const);
export function Action({ title, onPress, secondary = false }: { title: string; onPress: () => void; secondary?: boolean }) {
  return <PrimaryButton title={title} onPress={onPress} accessibilityRole="button" backgroundColor={secondary ? '#102A42' : '$primary'} />;
}
export function SectionHeading({ title, count }: { title: string; count?: number }) {
  return <YStack {...ui.row} {...{ justifyContent: 'space-between', marginTop: 28, marginBottom: 14 }}>
    <BaseText accessibilityRole="header" {...ui.title} {...{ fontSize: 18 }}>{title}</BaseText>{count !== undefined && <BaseText {...ui.badge}>{count}</BaseText>}</YStack>;
}
export function EmptyState({ text }: { text: string }) {
  return <YStack {...ui.card}>
    <BaseText {...ui.body}>{text}</BaseText>
  </YStack>;
}
export function Icon({ name }: { name: keyof typeof Feather.glyphMap }) {
  return <YStack {...ui.icon}>
    <Feather name={name} color={colors.primary} size={22} />
  </YStack>;
}
export function dayKey(date: Date) { return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; }
export function formatDate(date: string) { return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
