import React, { useState, useEffect, useCallback } from "react";
import contactService from "../../services/contact.service";
import { Trash2, Eye, Search, X, Settings, MessageCircle } from "lucide-react";
import adminService from "../../services/admin.service";

export default function ManageContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [viewModal, setViewModal] = useState({ open: false, contact: null });

  // Contact info modal
  const [contactInfoModal, setContactInfoModal] = useState({ open: false });
  const [contactInfoLoading, setContactInfoLoading] = useState(false);
  const [contactInfoData, setContactInfoData] = useState({
    address: '',
    email: '',
    phone: '',
    hours: ''
  });

  // Status badge helper
  const getReadStatus = (contact) => {
    const isRead = contact.isRead ?? false;
    if (!isRead) {
      return {
        className: 'bg-red-100 text-red-800 border border-red-200',
        label: 'Unread'
      };
    }
    return {
      className: 'bg-green-100 text-green-800 border border-green-200',
      label: 'Read'
    };
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchResults, setSearchResults] = useState([]);

  const pageSize = 10;

  const fetchContacts = async (page = 1, isSearch = false, reset = false) => {
    if (page === 1) setLoading(true);

    try {
      let result;
      const params = { page, limit: pageSize };

      if (isSearch && searchTerm.trim()) {
        result = await contactService.search(searchTerm, params);
      } else {
        result = await contactService.getAll(params);
      }

      if (result.success) {
        const newContacts = result.data.contacts || [];

        setTotalContacts(result.data.total || 0);
        setHasMore(result.data.hasMore || false);

        if (reset) {
          setContacts(newContacts);
          setSearchResults(newContacts);
        } else {
          setContacts((prev) => [...prev, ...newContacts]);
        }
      } else {
        setError(result.message || "Failed to fetch contacts");
      }
    } catch {
      setError("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  const onClickSearch = useCallback(async () => {
    setCurrentPage(1);

    if (searchTerm.trim()) {
      await fetchContacts(1, true, true);
    } else {
      await fetchContacts(1, false, true);
    }
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setCurrentPage(1);
    fetchContacts(1, false, true);
  };

  const loadMore = async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchContacts(nextPage, !!searchTerm.trim(), false);
  };

  const handleDelete = async (id) => {
    if (deletingId === id) return;

    setDeletingId(id);
    const result = await contactService.delete(id);

    if (result.success) {
      setContacts((prev) => prev.filter((c) => c._id !== id));
      setTotalContacts((prev) => prev - 1);
    } else {
      setError(result.message || "Delete failed");
    }

    setDeletingId(null);
  };

  const openViewModal = async (contact) => {
    const updatedContact = { ...contact, isRead: true };

    setContacts((prev) =>
      prev.map((c) => (c._id === contact._id ? updatedContact : c))
    );

    contactService.markAsRead(contact._id).catch(() => {});

    setViewModal({ open: true, contact: updatedContact });
  };

  const displayContacts = searchTerm ? searchResults : contacts;

  // Load contact info
  const loadContactInfo = async () => {
    console.log('[ManageContacts.jsx] loadContactInfo - Starting...');
    setContactInfoLoading(true);
    try {
      const result = await adminService.getContactInfo();
      console.log('[ManageContacts.jsx] loadContactInfo result:', result);
      if (result.success) {
        setContactInfoData(result.data);
        console.log('[ManageContacts.jsx] Contact data loaded:', result.data);
      } else {
        alert('[ManageContacts.jsx] Load failed: ' + result.error);
      }
    } catch (err) {
      console.error('[ManageContacts.jsx] loadContactInfo error:', err);
      alert('[ManageContacts.jsx] Load error: ' + err.message);
    } finally {
      setContactInfoLoading(false);
    }
  };

  const saveContactInfo = async (e) => {
    console.log('[ManageContacts.jsx] saveContactInfo - Starting, data:', contactInfoData);
    e.preventDefault();
    setContactInfoLoading(true);
    try {
      const result = await adminService.updateContactInfo(contactInfoData);
      console.log('[ManageContacts.jsx] saveContactInfo result:', result);
      if (result.success) {
        alert('[ManageContacts.jsx] Success: ' + result.message);
        setContactInfoModal({ open: false });
      } else {
        alert('[ManageContacts.jsx] Update failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('[ManageContacts.jsx] saveContactInfo error:', err);
      alert('[ManageContacts.jsx] Save error: ' + err.message);
    } finally {
      setContactInfoLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(1, false, true);
  }, []);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Contacts</h1>
        <p className="text-gray-600">
          {totalContacts > 0
            ? `${totalContacts} total messages`
            : "No messages"}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {/* Search Card */}
      <div className="bg-white p-4 rounded shadow">
<div className="flex flex-col lg:flex-row gap-3 justify-between items-center sm:flex-row flex-wrap">  

          {/* Contact Info Button */}
          <button
            onClick={() => {
              loadContactInfo();
              setContactInfoModal({ open: true });
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Settings size={18} />
            Site Contact Info
          </button>

          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, email or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
className="w-full sm:min-w-[250px] border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-2 text-gray-500"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={onClickSearch}
            className="bg-black text-white px-4 py-2 rounded flex items-center justify-center gap-2 lg:w-auto w-full"
          >
            <Search size={16} />
            Search
          </button>

        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        {loading && contacts.length === 0 ? (
          <div className="p-10 text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">

              {/* Desktop Header */}
              <thead className="bg-gray-50 hidden lg:table-header-group">
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Subject</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {displayContacts.map((contact) => (
                  <React.Fragment key={contact._id}>

                    {/* Row 1 */}
    <tr className={`border-t ${!contact.isRead ? 'bg-red-50 hover:bg-red-100' : ''}`}>
      <td className="p-4 max-w-[150px] truncate font-medium text-gray-900">
        {contact.name}
      </td>

      <td className="p-4 hidden lg:table-cell">
        <span 
          className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase border ${getReadStatus(contact).className}`}
        >
          {getReadStatus(contact).label}
        </span>
      </td>

      <td className="p-4 hidden lg:table-cell max-w-[200px] truncate">
        {contact.email}
      </td>

      <td className="p-4 hidden lg:table-cell max-w-[200px] truncate">
        {contact.subject}
      </td>

      <td className="p-4 hidden lg:table-cell">
        {new Date(contact.createdAt).toLocaleDateString()}
      </td>

      <td className="p-4 hidden lg:table-cell">
        <div className="flex gap-2">
          <button
            onClick={() => openViewModal(contact)}
            className="text-indigo-600 hover:text-indigo-800"
            title="View"
          >
            <Eye size={16} />
          </button>

          <button
            onClick={() => handleDelete(contact._id)}
            disabled={deletingId === contact._id}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>

                    {/* Mobile Action Row */}
    <tr className="lg:hidden border-b">
      <td colSpan="6" className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg truncate max-w-[70%]">{contact.name}</span>
            <span 
              className={`px-2 py-1 rounded-full text-xs font-bold uppercase border ${getReadStatus(contact).className}`}
            >
              {getReadStatus(contact).label}
            </span>
          </div>
          <div className="text-sm text-gray-600 truncate">{contact.email}</div>
          <div className="text-sm text-gray-600 truncate max-w-[200px]">{contact.subject}</div>
          <div className="text-xs text-gray-500">{new Date(contact.createdAt).toLocaleDateString()}</div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => openViewModal(contact)}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 p-2 rounded"
              title="View"
            >
              <Eye size={16} />
              View
            </button>
            <button
              onClick={() => handleDelete(contact._id)}
              disabled={deletingId === contact._id}
              className="flex items-center gap-1 text-red-600 hover:text-red-800 p-2 rounded disabled:opacity-50"
              title="Delete"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </td>
    </tr>

                  </React.Fragment>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {hasMore && (
          <div className="p-4 text-center">
            <button
              onClick={loadMore}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Contact Info Modal */}
      {contactInfoModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Site Contact Information</h2>
              <button
                onClick={() => setContactInfoModal({ open: false })}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={saveContactInfo} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={contactInfoData.address}
                  onChange={(e) => setContactInfoData({ ...contactInfoData, address: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="123 E-commerce Street, New York, NY 10001"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactInfoData.email}
                    onChange={(e) => setContactInfoData({ ...contactInfoData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="support@made4uu.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contactInfoData.phone}
                    onChange={(e) => setContactInfoData({ ...contactInfoData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Hours
                </label>
                <textarea
                  name="hours"
                  value={contactInfoData.hours}
                  onChange={(e) => setContactInfoData({ ...contactInfoData, hours: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Mon - Fri: 9:00 AM - 6:00 PM&#10;Sat - Sun: 10:00 AM - 4:00 PM"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={contactInfoLoading}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  {contactInfoLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setContactInfoModal({ open: false })}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">

            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Message Details</h2>
              <button
                onClick={() => setViewModal({ open: false, contact: null })}
              >
                <X />
              </button>
            </div>

            <div className="space-y-3">
              <p>
                <strong>From:</strong>{" "}
                {viewModal.contact?.name} ({viewModal.contact?.email})
              </p>

              <p>
                <strong>Subject:</strong> {viewModal.contact?.subject}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(viewModal.contact?.createdAt).toLocaleString()}
              </p>

              <div className="bg-gray-50 p-3 rounded max-h-48 overflow-y-auto break-words prose prose-sm max-w-none">
                {viewModal.contact?.message}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

