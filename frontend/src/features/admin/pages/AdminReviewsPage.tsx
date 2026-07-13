import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { StarRating } from '@/components/ui/StarRating';
import { deleteAdminReview, fetchAdminReviews, updateAdminReview } from '@/services/admin.service';
import type { AdminReview } from '@/types';

type ReviewStatus = AdminReview['status'];

const reviewStatusOptions: ReviewStatus[] = ['pending', 'approved', 'rejected', 'spam', 'archived'];

const statusVariantMap: Record<ReviewStatus, 'default' | 'success' | 'warning' | 'error' | 'outline'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  spam: 'error',
  archived: 'outline',
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function titleCase(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function ReviewStatusSelect({
  review,
  onChange,
  disabled,
}: {
  review: AdminReview;
  onChange: (review: AdminReview, status: ReviewStatus) => void;
  disabled: boolean;
}) {
  return (
    <select
      className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-navy-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
      value={review.status}
      disabled={disabled}
      aria-label={`Update ${review.customerName} review status`}
      onChange={(event) => {
        onChange(review, event.target.value as ReviewStatus);
      }}
    >
      {reviewStatusOptions.map((status) => (
        <option key={status} value={status}>
          {titleCase(status)}
        </option>
      ))}
    </select>
  );
}

function ReviewSummary({ reviews }: { reviews: AdminReview[] }) {
  const summary = useMemo(
    () => ({
      total: reviews.length,
      pending: reviews.filter((review) => review.status === 'pending').length,
      approved: reviews.filter((review) => review.status === 'approved').length,
      featured: reviews.filter((review) => review.featured).length,
    }),
    [reviews],
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="p-4">
        <p className="text-sm font-medium text-gray-500">Total Reviews</p>
        <strong className="mt-2 block text-2xl text-navy-900">{summary.total}</strong>
      </Card>
      <Card className="p-4">
        <p className="text-sm font-medium text-gray-500">Pending</p>
        <strong className="mt-2 block text-2xl text-navy-900">{summary.pending}</strong>
      </Card>
      <Card className="p-4">
        <p className="text-sm font-medium text-gray-500">Approved</p>
        <strong className="mt-2 block text-2xl text-navy-900">{summary.approved}</strong>
      </Card>
      <Card className="p-4">
        <p className="text-sm font-medium text-gray-500">Featured</p>
        <strong className="mt-2 block text-2xl text-navy-900">{summary.featured}</strong>
      </Card>
    </div>
  );
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: fetchAdminReviews,
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ id, status, featured }: { id: string; status?: ReviewStatus; featured?: boolean }) =>
      updateAdminReview(id, { status, featured }),
    onSuccess: () => {
      toast.success('Review updated.');
      void queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Review could not be updated.');
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () => {
      toast.success('Review archived.');
      setSelectedReview(null);
      void queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Review could not be archived.');
    },
  });

  const reviews = data?.items ?? [];
  const busyReviewId = updateReviewMutation.variables?.id ?? deleteReviewMutation.variables;
  const isMutating = updateReviewMutation.isPending || deleteReviewMutation.isPending;

  const handleStatusChange = (review: AdminReview, status: ReviewStatus) => {
    updateReviewMutation.mutate({ id: review.id, status });
  };

  const handleFeaturedToggle = (review: AdminReview) => {
    updateReviewMutation.mutate({ id: review.id, featured: !review.featured });
  };

  const handleArchive = (review: AdminReview) => {
    const confirmed = window.confirm(`Archive the review from ${review.customerName}?`);
    if (!confirmed) return;
    deleteReviewMutation.mutate(review.id);
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Review Moderation</h1>
          <p className="mt-1 text-sm text-gray-500">Approve, feature, or archive customer testimonials.</p>
        </div>
        <Button variant="outline" onClick={() => { void refetch(); }}>
          Refresh
        </Button>
      </div>

      {isError ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          Reviews could not be loaded.
          <button className="ml-2 font-semibold underline" type="button" onClick={() => { void refetch(); }}>
            Retry
          </button>
        </div>
      ) : null}

      <ReviewSummary reviews={reviews} />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Reviewer</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Featured</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {reviews.length === 0 ? (
                <tr>
                  <td className="p-8 text-center" colSpan={6}>
                    <EmptyState
                      title="No reviews found"
                      description="Customer reviews submitted from the website will appear here."
                    />
                  </td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const rowBusy = isMutating && busyReviewId === review.id;
                  return (
                    <tr key={review.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-sm">
                          <div className="font-medium text-navy-900">{review.customerName}</div>
                          <div className="text-xs text-gray-500">{review.companyName}</div>
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{review.reviewTitle}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StarRating rating={review.rating} size={16} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <Badge className="w-fit" variant={statusVariantMap[review.status]}>
                            {titleCase(review.status)}
                          </Badge>
                          <ReviewStatusSelect
                            review={review}
                            disabled={rowBusy}
                            onChange={handleStatusChange}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant={review.featured ? 'secondary' : 'outline'}
                          size="sm"
                          disabled={rowBusy}
                          leftIcon={<Star className={review.featured ? 'h-4 w-4 fill-white' : 'h-4 w-4'} />}
                          onClick={() => { handleFeaturedToggle(review); }}
                        >
                          {review.featured ? 'Featured' : 'Feature'}
                        </Button>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">{formatDate(review.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="h-4 w-4" />}
                            onClick={() => { setSelectedReview(review); }}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            disabled={rowBusy}
                            leftIcon={<Trash2 className="h-4 w-4" />}
                            onClick={() => { handleArchive(review); }}
                          >
                            Archive
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={selectedReview !== null}
        onClose={() => { setSelectedReview(null); }}
        title="Review Details"
        maxWidth="2xl"
      >
        {selectedReview ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-navy-900">{selectedReview.reviewTitle}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedReview.customerName} at {selectedReview.companyName}
                </p>
              </div>
              <Badge variant={statusVariantMap[selectedReview.status]}>{titleCase(selectedReview.status)}</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <StarRating rating={selectedReview.rating} size={18} />
              <span>{selectedReview.serviceName}</span>
              <span>{formatDate(selectedReview.createdAt)}</span>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
              {selectedReview.reviewText}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase text-gray-500">Contact</h3>
                <p className="mt-2 text-sm text-navy-900">{selectedReview.email ?? 'No email provided'}</p>
                <p className="text-sm text-gray-500">{selectedReview.phone ?? 'No phone provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase text-gray-500">Recommendation</h3>
                <p className="mt-2 text-sm text-navy-900">
                  {selectedReview.recommend ? 'Would recommend Kargar' : 'Would not recommend Kargar'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedReview.featured ? 'Featured on public pages' : 'Not featured'}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
