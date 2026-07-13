import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Building2, Eye, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { fetchAdminContacts, updateContactStatus } from '@/services/admin.service';
import type { ContactMessage } from '@/types';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
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

function statusVariant(status: ContactMessage['status']): 'default' | 'success' | 'warning' | 'outline' {
  switch (status) {
    case 'new':
      return 'warning';
    case 'in_progress':
      return 'outline';
    case 'resolved':
    case 'closed':
      return 'success';
  }
}

export default function AdminContactsPage() {
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: fetchAdminContacts,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactMessage['status'] }) =>
      updateContactStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Contact could not be updated.');
    },
  });

  const contacts = data?.items ?? [];

  const openModal = (contact: ContactMessage) => {
    setSelectedContact(contact);
    if (contact.status === 'new') {
      updateStatusMutation.mutate({ id: contact.id, status: 'in_progress' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Contact Inquiries</h1>
          <p className="mt-1 text-sm text-gray-500">Messages submitted from the website contact forms.</p>
        </div>
        <Button variant="outline" onClick={() => { void refetch(); }}>
          Refresh
        </Button>
      </div>

      {isError ? (
        <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          Contact inquiries could not be loaded.
          <button className="ml-2 font-semibold underline" type="button" onClick={() => { void refetch(); }}>
            Retry
          </button>
        </div>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Name & Company</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {contacts.length === 0 ? (
                <tr>
                  <td className="p-8 text-center" colSpan={5}>
                    <EmptyState title="No contacts found" description="When users submit the contact form, they will appear here." />
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-navy-900">{contact.name}</div>
                      <div className="text-xs text-gray-500">{contact.company ?? 'No company provided'}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">{contact.subject}</td>
                    <td className="whitespace-nowrap px-6 py-4">{formatDate(contact.created_at)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant(contact.status)}>{titleCase(contact.status)}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { openModal(contact); }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={selectedContact !== null}
        onClose={() => { setSelectedContact(null); }}
        title="Inquiry Details"
        maxWidth="lg"
      >
        {selectedContact ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-500">Name</h4>
                <p className="font-medium text-navy-900">{selectedContact.name}</p>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-500">Company</h4>
                <div className="flex items-center text-navy-900">
                  <Building2 className="mr-2 h-4 w-4 text-gray-400" />
                  {selectedContact.company ?? 'No company provided'}
                </div>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-500">Email</h4>
                <a href={`mailto:${selectedContact.email}`} className="flex items-center text-orange-600 hover:underline">
                  <Mail className="mr-2 h-4 w-4" />
                  {selectedContact.email}
                </a>
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-500">Phone</h4>
                {selectedContact.phone ? (
                  <a href={`tel:${selectedContact.phone}`} className="flex items-center text-orange-600 hover:underline">
                    <Phone className="mr-2 h-4 w-4" />
                    {selectedContact.phone}
                  </a>
                ) : (
                  <p className="text-gray-500">No phone provided</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-500">Subject</h4>
              <p className="font-medium capitalize text-navy-900">{selectedContact.subject}</p>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-500">Message</h4>
              <p className="rounded-lg bg-gray-50 p-4 leading-relaxed whitespace-pre-wrap text-gray-700">
                {selectedContact.message}
              </p>
            </div>

            <div className="pt-4 text-right text-xs text-gray-400">
              Received: {formatDate(selectedContact.created_at)}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
