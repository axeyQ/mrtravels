import BikeListingPage from '@/components/dashboard/BikeListingPage';

export const metadata = {
  title: 'Available Bikes - ZipBikes',
  description: 'Browse and book from our selection of bikes',
};

export default function BikesPage() {
  return <BikeListingPage />;
}