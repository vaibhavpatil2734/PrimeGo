import React, { useState } from 'react';
import { httpClient } from '../../services/api';
import { Download, Calendar, User, Filter } from 'lucide-react';

const LogExport = () => {
  const [loading, setLoading] = useState(false);
  const [exported, setExported] = useState(false);

  const [exportFilters, setExportFilters] = useState({
    type: 'all', // all, date, lastN, user
    fromDate: '',
    toDate: '',
    lastN: 100,
    userId: ''
  });

  const handleExport = async () => {
    setLoading(true);
    setExported(false);
    try {
      const params = new URLSearchParams();
      
      if (exportFilters.type === 'date' && exportFilters.fromDate && exportFilters.toDate) {
        params.append('from', exportFilters.fromDate);
        params.append('to', exportFilters.toDate);
      } else if (exportFilters.type === 'lastN') {
        params.append('limit', exportFilters.lastN);
      } else if (exportFilters.type === 'user' && exportFilters.userId) {
        params.append('userId', exportFilters.userId);
      }

      const response = await httpClient.get(`/api/activity-logs/export?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `made4uu-logs-${exportFilters.type === 'all' ? 'complete' : exportFilters.type}-${new Date().toISOString().split('T')[0]}.json`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setExported(true);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl border">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Download className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
          Export Activity Logs
        </h1>
        <p className="text-xl text-gray-600 mb-8">Download filtered logs as JSON file</p>
      </div>

      <div className="space-y-6">
        {/* Export Type Selector */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Export Type</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { value: 'all', label: 'All Logs', desc: 'Complete log history' },
              { value: 'date', label: 'Date Range', desc: 'Specific date range' },
              { value: 'lastN', label: 'Last N Logs', desc: 'Recent N logs' },
              { value: 'user', label: 'Specific User', desc: 'One user logs' }
            ].map(({ value, label, desc }) => (
              <label key={value} className="flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-blue-300 transition-all group">
                <input
                  type="radio"
                  name="exportType"
                  value={value}
                  checked={exportFilters.type === value}
                  onChange={(e) => setExportFilters({ ...exportFilters, type: value })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="font-semibold text-gray-900 group-hover:text-blue-900">{label}</div>
                  <div className="text-sm text-gray-500">{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Conditional Filters */}
        {exportFilters.type === 'date' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={exportFilters.fromDate}
                onChange={(e) => setExportFilters({ ...exportFilters, fromDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={exportFilters.toDate}
                onChange={(e) => setExportFilters({ ...exportFilters, toDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {exportFilters.type === 'lastN' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Recent Logs</label>
            <select
              value={exportFilters.lastN}
              onChange={(e) => setExportFilters({ ...exportFilters, lastN: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value={50}>Last 50 logs</option>
              <option value={100}>Last 100 logs</option>
              <option value={500}>Last 500 logs</option>
              <option value={1000}>Last 1000 logs</option>
              <option value={5000}>Last 5000 logs</option>
            </select>
          </div>
        )}

        {exportFilters.type === 'user' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User ID or Email</label>
            <input
              type="text"
              value={exportFilters.userId}
              onChange={(e) => setExportFilters({ ...exportFilters, userId: e.target.value })}
              placeholder="Enter user ID or email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Export Button */}
        <div className="pt-8">
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl text-lg font-bold shadow-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={24} />
                Download {exportFilters.type.toUpperCase()} Logs as JSON
              </>
            )}
          </button>
          {exported && (
            <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-xl text-center">
              ✅ <strong>Export complete!</strong> Check your downloads folder.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogExport;

