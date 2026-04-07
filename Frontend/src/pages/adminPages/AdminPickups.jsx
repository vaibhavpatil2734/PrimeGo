import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import adminService from "../../services/admin.service";
import { Truck, Eye, Package, User } from "lucide-react";

const AdminPickups = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const result = await adminService.getPickupOrders();
      if (result.success) {
        setPickups(result.data);
      } else {
        setError(result.error || "Failed to load pickups");
      }
    } catch (err) {
      setError(err.message || "Failed to load pickups");
    } finally {
      setLoading(false);
    }
  };

  const filteredPickups = pickups.filter(
    (pickup) =>
      pickup.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pickup Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage scheduled pickups ({filteredPickups.length})
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by order or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={fetchPickups}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Shipment ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPickups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No pickup bookings found
                  </td>
                </tr>
              ) : (
                filteredPickups.map((pickup) => (
                  <motion.tr
                    key={pickup._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {pickup.orderNumber || `#${pickup._id?.slice(-8).toUpperCase()}`}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {pickup.userId?.username || pickup.userId?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {pickup.userId?.email || pickup.userId?.phone || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {pickup.items.slice(0, 3).map((item, idx) => (
                          <p key={idx} className="text-sm text-gray-900 truncate max-w-[200px]">
                            {item.title} x{item.quantity}
                          </p>
                        ))}
                        {pickup.items.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{pickup.items.length - 3} more
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded font-bold">
                        {pickup.shipmentId?.slice(-8) || pickup.shipment_id?.slice(-8) || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedPickup(selectedPickup?._id === pickup._id ? null : pickup)}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Expanded Pickup Details */}
        <AnimatePresence>
          {selectedPickup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 bg-gray-50"
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Order Info */}
                  <div className="bg-white p-4 rounded-xl border">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                      Order Details
                    </h4>
                    <p className="text-sm font-bold">
                      {selectedPickup.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: ₹{selectedPickup.totalAmount?.toFixed(2)}
                    </p>
                  </div>

                  {/* Shipping */}
                  <div className="bg-white p-4 rounded-xl border">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                      Shipment
                    </h4>
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {selectedPickup.shipmentId || selectedPickup.shipment_id}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedPickup.courierName || "Shiprocket"}
                    </p>
                  </div>

                  {/* Customer */}
                  <div className="md:col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                      Customer & Address
                    </h4>
                    <p className="text-sm font-medium">
                      {selectedPickup.userId?.username || "Customer"}
                    </p>
                    <div className="mt-2 text-sm space-y-1">
                      <p>{selectedPickup.shippingAddressId?.line1}</p>
                      <p>{selectedPickup.shippingAddressId?.city}, {selectedPickup.shippingAddressId?.state} - {selectedPickup.shippingAddressId?.postalCode}</p>
                      <p className="text-gray-600">
                        Phone: {selectedPickup.shippingAddressId?.phone}
                      </p>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="col-span-full bg-white p-4 rounded-xl border">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                      Products ({selectedPickup.items.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedPickup.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            {item.customName && (
                              <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1">
                                Custom: {item.customName}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">x{item.quantity}</p>
                            <p className="text-sm text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPickups;
