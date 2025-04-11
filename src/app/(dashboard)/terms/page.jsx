// src/app/(dashboard)/terms/page.jsx
import TermsPage from '@/components/pages/TermsPage';

export const metadata = {
  title: 'Terms and Conditions - ZipBikes',
  description: 'Read our terms and conditions for using the BikeFlix bike booking service',
};

export default function Terms() {
  return <TermsPage />;
}