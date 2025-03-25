"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { 
  BiHome, BiCar, BiCalendarCheck, BiUser, BiBarChartAlt, BiCog, BiLogOut 
} from "react-icons/bi";

export default function AdminSidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { name: "Dashboard", icon: <BiHome className="h-5 w-5" />, href: "/admin" },
    { name: "Bikes", icon: <BiCar className="h-5 w-5" />, href: "/admin/bikes" },
    { name: "Bookings", icon: <BiCalendarCheck className="h-5 w-5" />, href: "/admin/bookings" },
    { name: "Users", icon: <BiUser className="h-5 w-5" />, href: "/admin/users" },
    { name: "Analytics", icon: <BiBarChartAlt className="h-5 w-5" />, href: "/admin/analytics" },
    { name: "Settings", icon: <BiCog className="h-5 w-5" />, href: "/admin/settings" },
  ];
  
  return (
    <div className="bg-white w-64 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <Link href="/admin" className="flex items-center">
          <span className="text-xl font-bold text-primary">BikeFlix Admin</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <BiLogOut className="h-5 w-5" />
            <span className="ml-3">Exit Admin</span>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}