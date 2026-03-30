import React, { useState, useEffect, useCallback } from 'react';
import { httpClient } from '../../services/api';
import { Search, Download } from 'lucide-react';

const JsonActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async (append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search })
      });
      
      const response = await httpClient.get(`/api/activity-logs?${params}`);

      const newLogs = response.data.logs || [];
      
      setLogs(append ? [...logs, ...newLogs] : newLogs);
      setTotal(response.data.pagination?.total || 0);
      setHasMore(newLogs.length === 10);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, logs]);

  useEffect(() => {
    setPage(1);
    fetchLogs(false);
  }, [search, fetchLogs]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(true);
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({ search, limit: total });
      const response = await httpClient.get(`/activity-logs/export?${params}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Export failed');
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs (JSON)</h1>
          <p className="text-gray-600 mt-1">Latest 10 logs first. Search any field. {total} total logs.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white border rounded-lg p-2 shadow-sm">
            <Search className="h-5 w-5 text-gray-400 mt-0.5 ml-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs (user, action, entity, IP...)"
              className="ml-2 outline-none w-64 text-sm"
            />
          </div>
          <button
            onClick={exportLogs}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
          >
            <Download size={18} />
            Export JSON
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="max-h-[80vh] overflow-auto">
          {logs.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">No logs found</h3>
              <p>Try adjusting your search or wait for activity.</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={log._id} className="p-6 border-b hover:bg-gray-50 group">
                <div className="flex justify-between items-start mb-3">
                  <div className="font-mono text-xs text-gray-500">
                    {formatDate(log.createdAt)} | ID: {log._id.slice(-8)}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(log, null, 2))}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600 transition"
                    title="Copy JSON"
                  >
                    📋
                  </button>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-auto max-h-96 text-gray-900">
                  {JSON.stringify(log, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Loading...' : 'Show More Logs'}
            <span className="text-sm">+10</span>
          </button>
        </div>
      )}

      {!hasMore && logs.length > 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">✅</div>
          <p>Loaded all {total.toLocaleString()} logs</p>
        </div>
      )}
    </div>
  );
};

export default JsonActivityLogs;

