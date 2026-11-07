import React from 'react';
import { YStack } from 'tamagui';
import { ProgramCard } from '../ProgramCard';
import { Plan, Session } from './types';
import { EmptyState } from './homeUi';

export function PlanSection({ plans, sessions, onPlanPress }: { plans: Plan[]; sessions: Session[]; onPlanPress: (plan: Plan) => void }) {
  if (!plans.length) return <EmptyState text="Chưa có chương trình tập luyện." />;
  return <YStack gap="$3">{plans.map(plan => <ProgramCard key={plan._id} title={plan.name} subtitle={`${sessions.filter(session => session.planId === plan._id).length} buổi trong lịch`} level={plan.generatedByAI ? 'AI TẠO' : 'TỰ TẠO'} hideMetrics onPress={() => onPlanPress(plan)} />)}</YStack>;
}
