import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}