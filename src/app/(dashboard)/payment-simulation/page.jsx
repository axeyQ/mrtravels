// src/app/(dashboard)/payment-simulation/page.jsx
import PaymentSimulationPage from '@/components/dashboard/PaymentSimulationPage';

export const metadata = {
  title: 'Payment - BikeFlix',
  description: 'Process your bike booking payment',
};

export default function PaymentPage() {
  return <PaymentSimulationPage />;
}