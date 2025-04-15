// src/components/admin/PaymentReconciliation.jsx
"use client";
import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { 
  Calendar, Search, ChevronDown, Download, 
  Filter, DollarSign, RefreshCw, ArrowDownUp 
} from 'lucide-react';
import { CSVLink } from 'react-csv';
import { formatCurrency, formatDate } from '@/lib/formatUtils';

export default function PaymentReconciliation() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date()
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get all bookings
  const bookings = useQuery(
    api.bookings.getAllBookings,
    isUserLoaded && user ? { adminId: user.id } : null
  ) || [];
  
  // Get all bikes to fetch their names
  const bikes = useQuery(api.bikes.getAllBikes) || [];
  
  // Create a map of bike IDs to bike objects
  const bikeMap = bikes.reduce((map, bike) => {
    map[bike._id] = bike;
    return map;
  }, {});
  
  // Filter bookings based on date range, search query, and payment status
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Date range filter
      const bookingDate = new Date(booking.startTime);
      if (
        bookingDate < dateRange.from || 
        bookingDate > new Date(dateRange.to.getTime() + 24 * 60 * 60 * 1000)
      ) {
        return false;
      }
      
      // Payment status filter
      if (paymentStatus !== 'all' && booking.paymentStatus !== paymentStatus) {
        return false;
      }
      
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const bikeName = bikeMap[booking.bikeId]?.name?.toLowerCase() || '';
        const userName = booking.userName?.toLowerCase() || '';
        const referenceId = booking.paymentReferenceId?.toLowerCase() || '';
        
        return (
          bikeName.includes(query) || 
          userName.includes(query) || 
          referenceId.includes(query)
        );
      }
      
      return true;
    });
  }, [bookings, dateRange, searchQuery, paymentStatus, bikeMap]);
  
  // Sort filtered bookings
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'date':
          valueA = a.startTime;
          valueB = b.startTime;
          break;
        case 'amount':
          valueA = a.totalPrice || 0;
          valueB = b.totalPrice || 0;
          break;
        case 'name':
          valueA = a.userName || '';
          valueB = b.userName || '';
          break;
        default:
          valueA = a.startTime;
          valueB = b.startTime;
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }, [filteredBookings, sortBy, sortDirection]);
  
  // Summary statistics
  const paymentStats = useMemo(() => {
    const stats = {
      totalBookings: filteredBookings.length,
      totalRevenue: 0,
      totalDeposits: 0,
      totalPending: 0,
      depositPaid: 0,
      fullyPaid: 0,
      pendingPayments: 0,
    };
    
    filteredBookings.forEach(booking => {
      stats.totalRevenue += booking.totalPrice || 0;
      stats.totalDeposits += booking.depositAmount || 0;
      
      if (booking.paymentStatus === 'fully_paid') {
        stats.fullyPaid++;
      } else if (booking.paymentStatus === 'deposit_paid') {
        stats.depositPaid++;
        stats.totalPending += (booking.totalPrice - booking.depositAmount) || 0;
      } else {
        stats.pendingPayments++;
        stats.totalPending += booking.totalPrice || 0;
      }
    });
    
    return stats;
  }, [filteredBookings]);
  
  // Data format for CSV export
  const csvData = useMemo(() => {
    return sortedBookings.map(booking => {
      const bike = bikeMap[booking.bikeId];
      return {
        'Booking ID': booking._id,
        'Date': formatDate(new Date(booking.startTime), 'yyyy-MM-dd'),
        'Time': formatDate(new Date(booking.startTime), 'HH:mm') + ' - ' + formatDate(new Date(booking.endTime), 'HH:mm'),
        'Customer': booking.userName,
        'Phone': booking.userPhone,
        'Vehicle': bike?.name || 'Unknown',
        'Reg Number': bike?.registrationNumber || 'N/A',
        'Total Amount': booking.totalPrice || 0,
        'Deposit Paid': booking.depositAmount || 0,
        'Remaining': (booking.totalPrice - booking.depositAmount) || 0,
        'Payment Status': booking.paymentStatus || 'pending',
        'Booking Status': booking.status,
        'Payment Reference': booking.paymentReferenceId || 'N/A'
      };
    });
  }, [sortedBookings, bikeMap]);
  
  // Toggle sort direction or change sort field
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold text-gray-900">Payment Reconciliation</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all payment transactions
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Total Revenue</h3>
          <p className="mt-2 text-2xl font-bold text-green-900">₹{formatCurrency(paymentStats.totalRevenue)}</p>
          <p className="mt-1 text-sm text-green-700">{paymentStats.totalBookings} bookings</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Deposits Collected</h3>
          <p className="mt-2 text-2xl font-bold text-blue-900">₹{formatCurrency(paymentStats.totalDeposits)}</p>
          <p className="mt-1 text-sm text-blue-700">{paymentStats.depositPaid + paymentStats.fullyPaid} payments</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">Pending Amounts</h3>
          <p className="mt-2 text-2xl font-bold text-yellow-900">₹{formatCurrency(paymentStats.totalPending)}</p>
          <p className="mt-1 text-sm text-yellow-700">{paymentStats.pendingPayments + paymentStats.depositPaid} pending payments</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Payment Success Rate</h3>
          <p className="mt-2 text-2xl font-bold text-purple-900">
            {paymentStats.totalBookings ? 
              Math.round((paymentStats.depositPaid + paymentStats.fullyPaid) / paymentStats.totalBookings * 100) :
              0}%
          </p>
          <p className="mt-1 text-sm text-purple-700">{paymentStats.fullyPaid} fully paid bookings</p>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="p-6 border-t border-b">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div className="flex space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
              <ChevronDown className={`ml-1 h-4 w-4 transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <CSVLink
              data={csvData}
              filename={`zipbikes-payments-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`}
              className="inline-flex items-center py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white"
              target="_blank"
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </CSVLink>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={formatDate(dateRange.from, 'yyyy-MM-dd')}
                    onChange={(e) => setDateRange({...dateRange, from: new Date(e.target.value)})}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={formatDate(dateRange.to, 'yyyy-MM-dd')}
                    onChange={(e) => setDateRange({...dateRange, to: new Date(e.target.value)})}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="deposit_paid">Deposit Paid</option>
                <option value="fully_paid">Fully Paid</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateRange({
                    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    to: new Date()
                  });
                  setSearchQuery('');
                  setPaymentStatus('all');
                }}
                className="inline-flex items-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bookings Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date')}>
                <div className="flex items-center">
                  Date & Time
                  {sortBy === 'date' && (
                    <ArrowDownUp className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? 'text-primary' : 'text-primary rotate-180'}`} />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center">
                  Customer & Vehicle
                  {sortBy === 'name' && (
                    <ArrowDownUp className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? 'text-primary' : 'text-primary rotate-180'}`} />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('amount')}>
                <div className="flex items-center">
                  Payment Details
                  {sortBy === 'amount' && (
                    <ArrowDownUp className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? 'text-primary' : 'text-primary rotate-180'}`} />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedBookings.length > 0 ? (
              sortedBookings.map(booking => {
                const bike = bikeMap[booking.bikeId];
                return (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(new Date(booking.startTime), 'dd MMM yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(new Date(booking.startTime), 'HH:mm')} - {formatDate(new Date(booking.endTime), 'HH:mm')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.userName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {bike?.name || 'Unknown Vehicle'} 
                        {bike?.registrationNumber ? ` (${bike.registrationNumber})` : ''}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{booking.totalPrice || 0}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Deposit: ₹{booking.depositAmount || 0} | 
                        Due: ₹{(booking.totalPrice - (booking.depositAmount || 0)) || 0}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full
                        ${booking.paymentStatus === 'fully_paid' ? 'bg-green-100 text-green-800' : 
                        booking.paymentStatus === 'deposit_paid' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}
                      >
                        {booking.paymentStatus === 'fully_paid' ? 'Fully Paid' : 
                        booking.paymentStatus === 'deposit_paid' ? 'Deposit Paid' : 
                        'Payment Pending'}
                      </span>
                      
                      <span className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full
                        ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.paymentReferenceId || '-'}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 font-medium text-gray-900">No payment transactions found</p>
                  <p className="mt-1">Adjust your filters or search criteria</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}