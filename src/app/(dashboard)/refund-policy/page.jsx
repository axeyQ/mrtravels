// src/app/(dashboard)/refund-policy/page.jsx
import RefundPage from '@/components/pages/RefundPage';

export const metadata = {
  title: 'Refund and Cancellation Policy - BikeFlix',
  description: 'Learn about our refund and cancellation policies for bike bookings',
};

export default function RefundPolicy() {
  return <RefundPage />;
}