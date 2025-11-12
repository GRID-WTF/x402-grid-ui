'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '../components/header';

interface TestResponse {
  status: number;
  statusText: string;
  headers: {
    'X-X402-Protected': string | null;
    'X-Payment-Required': string | null;
    'X-Payment-Verified': string | null;
  };
  body: unknown;
}

export default function TestAPIPage() {
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testEndpoint = async (endpoint: string, componentType: string, config: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          componentType,
          config,
        }),
      });

      const data = await res.json();
      
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: {
          'X-X402-Protected': res.headers.get('X-X402-Protected'),
          'X-Payment-Required': res.headers.get('X-Payment-Required'),
          'X-Payment-Verified': res.headers.get('X-Payment-Verified'),
        },
        body: data,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showWallet={true} />
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">API Endpoint Tester</h1>
          <p className="text-gray-600 mb-6">
            Test your x402 protected API endpoints without payment headers (should return 402)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Test /api/render-ui */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Test /api/render-ui</h2>
              <div className="space-y-2">
                <button
                  onClick={() => testEndpoint('/api/render-ui', 'grid', { columns: 3, gap: 4, itemCount: 6 })}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Test Grid Component
                </button>
                <button
                  onClick={() => testEndpoint('/api/render-ui', 'card', { title: 'Test Card' })}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Test Card Component
                </button>
                <button
                  onClick={() => testEndpoint('/api/render-ui', 'dashboard', {})}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Test Dashboard Component
                </button>
              </div>
            </div>

            {/* Test /api/premium-ui */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Test /api/premium-ui</h2>
              <div className="space-y-2">
                <button
                  onClick={() => testEndpoint('/api/premium-ui', 'advanced-grid', { columns: 4, itemCount: 12 })}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
                >
                  Test Advanced Grid
                </button>
                <button
                  onClick={() => testEndpoint('/api/premium-ui', 'data-table', {})}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
                >
                  Test Data Table
                </button>
                <button
                  onClick={() => testEndpoint('/api/premium-ui', 'analytics', {})}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
                >
                  Test Analytics Dashboard
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Testing endpoint...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {response && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3">
                Response: {response.status} {response.statusText}
              </h3>
              
              {/* Status Badge */}
              <div className="mb-4">
                {response.status === 402 ? (
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    ✅ Expected: 402 Payment Required
                  </span>
                ) : response.status === 200 ? (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ✅ Success: 200 OK
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    ⚠️ Unexpected Status
                  </span>
                )}
              </div>

              {/* Headers */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Response Headers:</h4>
                <div className="bg-white rounded p-3 text-sm font-mono">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="mb-1">
                      <span className="text-blue-600">{key}:</span>{' '}
                      <span className="text-gray-800">{String(value) || 'null'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div>
                <h4 className="font-medium mb-2">Response Body:</h4>
                <pre className="bg-white rounded p-4 text-sm overflow-x-auto">
                  {JSON.stringify(response.body, null, 2)}
                </pre>
              </div>

              {/* Explanation */}
              {response.status === 402 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 What this means:</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>The endpoint is working correctly!</li>
                    <li>It&apos;s returning a 402 status because no payment was included</li>
                    <li>The response includes payment requirements (price, network, payTo address)</li>
                    <li>To get the actual UI data, you need to include payment headers</li>
                    <li>Use the main app (/) to test the full payment flow</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📋 Testing Instructions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. Test Without Payment (Current Page)</h3>
              <p className="text-gray-600 mb-2">
                Click the buttons above to test the API endpoints without payment headers.
                You should receive a <span className="font-mono bg-yellow-100 px-1">402 Payment Required</span> response.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">2. Test With Payment (Main App)</h3>
              <p className="text-gray-600 mb-2">
                Go to <Link href="/" className="text-blue-600 hover:underline">/</Link> to test the full payment flow:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Connect your Solana wallet</li>
                <li>Select a component to render</li>
                <li>Click &quot;Pay & Render&quot;</li>
                <li>Approve the transaction</li>
                <li>The API will verify payment and return the UI data</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">3. Test Using Browser Console</h3>
              <p className="text-gray-600 mb-2">
                Open DevTools (F12) and run in the Console:
              </p>
              <pre className="bg-gray-100 rounded p-3 text-sm overflow-x-auto">
{`fetch('http://localhost:3001/api/render-ui', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    componentType: 'grid',
    config: { columns: 3, itemCount: 6 }
  })
})
.then(res => res.json())
.then(data => console.log(data));`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

