"use client";
import { useParams } from "next/navigation";
import BookingDetailPage from "@/components/admin/BookingDetailPage";

export default function BookingDetailRoute() {
  const params = useParams();
  const bookingId = params.bookingId;
  
  return <BookingDetailPage bookingId={bookingId} />;
}