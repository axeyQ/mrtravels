import BikeDetailPage from '@/components/dashboard/BikeDetailPage';

export const metadata = {
  title: 'Bike Details - ZipBikes',
  description: 'View details and book your bike',
};

export default function BikePage({ params }) {
  return <BikeDetailPage bikeId={params.bikeId} />;
}