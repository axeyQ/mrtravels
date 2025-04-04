import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import StoreStatusCheck from '@/components/shared/StoreStatusCheck';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
      <StoreStatusCheck>
        {children}
      </StoreStatusCheck>
      </main>
      <Footer />
    </div>
  );
}