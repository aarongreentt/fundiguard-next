'use client';

import { ProfilePage } from '@/components/profile/profile-page';

interface ProfileViewPageProps {
  params: {
    id: string;
    type: 'fundi' | 'client';
  };
}

export default function ProfileViewPage({ params }: ProfileViewPageProps) {
  return <ProfilePage isOwnProfile={false} />;
}
