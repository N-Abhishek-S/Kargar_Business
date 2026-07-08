import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eye, Mail, Phone, Building2 } from 'lucide-react';
import type { ContactMessage } from '@/types';

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // In Phase 9, we'll connect this to the real backend
    // For now, setting some dummy data to verify the UI
    setTimeout(() => {
      setContacts([
        {
          id: '1',
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          phone: '+919876543210',
          company: 'TechCorp Solutions',
          subject: 'housekeeping',
          message: 'We are looking for housekeeping services for our new 50,000 sq ft office in Hinjewadi.',
          status: 'new',
          priority: 'high',
          assigned_to: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Anita Desai',
          email: 'anita.d@hospital.com',
          phone: '+919988776655',
          company: 'City Care Hospital',
          subject: 'mep',
          message: 'Need an AMC quote for HVAC maintenance.',
          status: 'closed',
          priority: 'medium',
          assigned_to: null,
          notes: null,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const openModal = (contact: ContactMessage) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
    if (contact.status === 'new') {
      setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, status: 'in_progress' } : c));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Contact Inquiries</h1>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Name & Company</th>
                <th className="px-6 py-4 font-semibold">Service</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <EmptyState title="No contacts found" description="When users submit the contact form, they will appear here." />
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-navy-900">{contact.name}</div>
                      <div className="text-xs text-gray-500">{contact.company}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">{contact.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(contact.created_at)}</td>
                    <td className="px-6 py-4">
                      {contact.status === 'new' ? (
                        <Badge variant="warning">New</Badge>
                      ) : (
                        <Badge variant="default">Read</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => { openModal(contact); }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
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
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); }}
        title="Inquiry Details"
        maxWidth="lg"
      >
        {selectedContact && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</h4>
                <p className="font-medium text-navy-900">{selectedContact.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Company</h4>
                <div className="flex items-center text-navy-900">
                  <Building2 className="mr-2 h-4 w-4 text-gray-400" />
                  {selectedContact.company}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</h4>
                <a href={`mailto:${selectedContact.email}`} className="flex items-center text-orange-600 hover:underline">
                  <Mail className="mr-2 h-4 w-4" />
                  {selectedContact.email}
                </a>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</h4>
                <a href={`tel:${selectedContact.phone}`} className="flex items-center text-orange-600 hover:underline">
                  <Phone className="mr-2 h-4 w-4" />
                  {selectedContact.phone}
                </a>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Service Requested</h4>
              <p className="font-medium text-navy-900 capitalize">{selectedContact.subject}</p>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Message</h4>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg">
                {selectedContact.message}
              </p>
            </div>
            
            <div className="text-xs text-gray-400 text-right pt-4">
              Received: {formatDate(selectedContact.created_at)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
