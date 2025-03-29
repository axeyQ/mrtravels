// src/app/(dashboard)/profile/page.jsx
import UserProfilePage from '@/components/dashboard/UserProfilePage';

export const metadata = {
  title: 'Complete Your Profile - BikeFlix',
  description: 'Complete your profile to book bikes',
};

export default function ProfilePage() {
  return <UserProfilePage />;
}