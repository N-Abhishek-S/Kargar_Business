import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Users, MessageSquare, Star, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { fetchAdminDashboard } from '@/services/admin.service';

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Dashboard Overview</h1>

      {isError ? (
        <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          Dashboard data could not be loaded.
          <button className="ml-2 font-semibold underline" type="button" onClick={() => { void refetch(); }}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Contacts */}
        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-navy-900">{stats?.totalContacts}</div>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500 font-medium">+{stats?.newContacts}</span> new
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Unread Messages */}
        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-navy-900">{stats?.newContacts}</div>
                <p className="text-xs text-gray-500 mt-1">Requires your attention</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Reviews */}
        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Published Reviews</CardTitle>
            <Star className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-navy-900">{stats?.totalReviews}</div>
                <p className="text-xs text-gray-500 mt-1">Total verified testimonials</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-navy-900">{stats?.averageRating}</div>
                <p className="text-xs text-gray-500 mt-1">Out of 5 stars</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <p>Recent activity will appear here.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <p>Recent activity will appear here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
