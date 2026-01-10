"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";

export default function WialonDebugPage() {
  const [resources, setResources] = useState<any>(null);
  const [drivers, setDrivers] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getWialonDebugResources();
      setResources(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getWialonDrivers();
      setDrivers(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  const syncDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.syncWialonDrivers();
      setSyncResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to sync drivers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Wialon Driver Debug</h1>

      <div className="grid gap-4 mb-8">
        <button
          onClick={fetchResources}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          1. Fetch Raw Resources (Debug)
        </button>

        <button
          onClick={fetchDrivers}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          2. Fetch Extracted Drivers
        </button>

        <button
          onClick={syncDrivers}
          disabled={loading}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          3. Sync Drivers to Database
        </button>
      </div>

      {loading && (
        <div className="p-4 bg-blue-100 text-blue-800 rounded-lg mb-4">
          Loading...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg mb-4">
          Error: {error}
        </div>
      )}

      {resources && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Raw Resources</h2>
          <div className="p-4 bg-gray-100 rounded-lg overflow-auto">
            <p className="mb-2">
              <strong>Total Resources:</strong> {resources.totalResources}
            </p>
            <pre className="text-xs">
              {JSON.stringify(resources.resources, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {drivers && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Extracted Drivers</h2>
          <div className="p-4 bg-gray-100 rounded-lg overflow-auto">
            <p className="mb-2">
              <strong>Total Drivers:</strong> {drivers.length || 0}
            </p>
            <pre className="text-xs">{JSON.stringify(drivers, null, 2)}</pre>
          </div>
        </div>
      )}

      {syncResult && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Sync Result</h2>
          <div className="p-4 bg-green-100 rounded-lg overflow-auto">
            <p className="mb-2">
              <strong>Created:</strong> {syncResult.created}
            </p>
            <p className="mb-2">
              <strong>Updated:</strong> {syncResult.updated}
            </p>
            <pre className="text-xs">{JSON.stringify(syncResult, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
