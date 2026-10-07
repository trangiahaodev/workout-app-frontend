import { YStack } from 'tamagui';
import { BaseText } from '../components/BaseText';
import React, { useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BottomNav, TopHeader } from '../components';
import { TodaySessionSection } from '../components/home/TodaySessionSection';
import { PlanSection } from '../components/home/PlanSection';
import { ExerciseSection } from '../components/home/ExerciseSection';
import { RecentLogsSection } from '../components/home/RecentLogsSection';
import { ProfileOverview } from '../components/home/ProfileOverview';
import { HomeDetail, HomeDetailModal } from '../components/home/HomeDetailModal';
import { colors, formatDate, SectionHeading, ui } from '../components/home/homeUi';
import { HomeData } from '../components/home/types';
import { mockProfile, mockPlans, mockSessions, mockExercises, MOCK_LOGS } from '../components/home/mockData';

const mockHomeData: HomeData = { profile: mockProfile, plans: mockPlans, sessions: mockSessions, exercises: mockExercises, logs: MOCK_LOGS };
// Pass API results here later; section components only consume typed props.
export default function HomeScreen({ data = mockHomeData, now = new Date() }: { data?: HomeData; now?: Date }) {
  const scroll = useRef<ScrollView>(null);
  const positions = useRef<Record<string, number>>({ home: 0 });
  const [activeTab, setActiveTab] = useState('home');
  const [detail, setDetail] = useState<HomeDetail | null>(null);
  return <YStack {...{ flex: 1, backgroundColor: colors.background }}>
    <StatusBar style="light" />
    <TopHeader subtitle="Chào bạn, hôm nay cùng tiến bộ!" onProfilePress={() => setDetail({ label: 'HỒ SƠ TẬP LUYỆN', title: data.profile.goal, lines: [`Trình độ: ${data.profile.level}`, `Mục tiêu: ${data.profile.trainingDaysPerWeek} buổi / tuần`] })} />
    <ScrollView ref={scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, width: '100%', maxWidth: 720, alignSelf: 'center' }}>
      <BaseText {...ui.label} {...{ marginTop: 20 }}>{now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).toUpperCase()}</BaseText>
      <ProfileOverview profile={data.profile} />
      <SectionHeading title="Buổi tập hôm nay" />
      <TodaySessionSection sessions={data.sessions} now={now} onSessionPress={session => setDetail({ label: 'LỊCH TẬP', title: session.name, lines: [`Ngày tập: ${formatDate(session.scheduledDate)}`, `Chương trình: ${data.plans.find(plan => plan._id === session.planId)?.name ?? 'Chưa có thông tin'}`, 'Chi tiết bài tập của buổi này chưa có trong dữ liệu hiện tại.'] })} />
      <YStack onLayout={event => { positions.current.plan = event.nativeEvent.layout.y; }}>
        <SectionHeading title="Chương trình của bạn" count={data.plans.length} />
        <PlanSection plans={data.plans} sessions={data.sessions} onPlanPress={plan => { const sessions = data.sessions.filter(session => session.planId === plan._id); setDetail({ label: plan.generatedByAI ? 'CHƯƠNG TRÌNH AI' : 'CHƯƠNG TRÌNH TỰ TẠO', title: plan.name, lines: sessions.length ? sessions.map(session => `${formatDate(session.scheduledDate)} · ${session.name}`) : ['Chưa có buổi tập trong chương trình này.'] }); }} />
      </YStack>
      <SectionHeading title="Thư viện bài tập" count={data.exercises.length} />
      <ExerciseSection exercises={data.exercises} onExercisePress={exercise => setDetail({ label: 'THƯ VIỆN BÀI TẬP', title: exercise.name, lines: [`Nhóm cơ: ${exercise.muscleGroup}`, `Dụng cụ: ${exercise.equipmentRequired}`, 'Hướng dẫn kỹ thuật chưa có trong dữ liệu hiện tại.'] })} />
      <YStack onLayout={event => { positions.current.history = event.nativeEvent.layout.y; }}>
        <SectionHeading title="Nhật ký gần đây" count={data.logs.length} />
        <RecentLogsSection logs={data.logs} />
      </YStack>
    </ScrollView>
    <BottomNav tabs={[{ id: 'home', icon: 'home', label: 'Home' }, { id: 'plan', icon: 'calendar', label: 'Lịch tập' }, { id: 'history', icon: 'clock', label: 'Nhật ký' }]} activeTabId={activeTab} onTabChange={tab => { setActiveTab(tab); scroll.current?.scrollTo({ y: positions.current[tab] ?? 0, animated: true }); }} />
    <HomeDetailModal detail={detail} onClose={() => setDetail(null)} />
  </YStack>;
}
