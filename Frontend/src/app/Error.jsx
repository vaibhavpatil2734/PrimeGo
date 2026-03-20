import React from 'react'

export default function Error() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/70 to-purple-50/70 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-black text-red-500 mb-4">Oops!</h1>
        <p className="text-xl text-slate-600 mb-8">Something went wrong.</p>
        <a 
          href="/" 
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
