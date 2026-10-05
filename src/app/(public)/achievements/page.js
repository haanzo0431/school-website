import GlobalRadar3D from '@/components/achievements/GlobalRadar3D';
import AchievementHub from '@/components/achievements/AchievementHub';

export default function AchievementsPage() {
  return (
    <main className="min-h-screen theme-bg-page py-12 space-y-16">
      {/* 1. 3D Global Acceptance Radar */}
      <GlobalRadar3D />

      {/* 2. Merged Interactive Timeline & Achievements Hub */}
      <AchievementHub />
    </main>
  );
}