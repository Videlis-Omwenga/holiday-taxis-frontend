'use client';

import { Wrench, Calendar, Clock, CheckCircle, AlertTriangle, Clock as ClockIcon } from 'lucide-react';

interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'scheduled' | 'repair' | 'inspection';
  description: string;
  status: 'completed' | 'pending' | 'overdue';
  cost?: number;
  mileage: number;
  notes?: string;
}

interface MaintenanceHistoryProps {
  vehicleId: string;
  className?: string;
}

export default function MaintenanceHistory({ vehicleId, className = '' }: MaintenanceHistoryProps) {
  // In a real app, this would be fetched from your API
  const maintenanceRecords: MaintenanceRecord[] = [
    {
      id: '1',
      date: '2023-10-15',
      type: 'scheduled',
      description: 'Oil Change',
      status: 'completed',
      cost: 89.99,
      mileage: 45000,
      notes: 'Used synthetic oil',
    },
    {
      id: '2',
      date: '2023-11-20',
      type: 'inspection',
      description: 'Annual Safety Inspection',
      status: 'pending',
      mileage: 46500,
    },
    {
      id: '3',
      date: '2023-09-01',
      type: 'repair',
      description: 'Brake Pads Replacement',
      status: 'completed',
      cost: 220.5,
      mileage: 43500,
      notes: 'Replaced all four brake pads',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-amber-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'repair':
        return <Wrench className="h-4 w-4 text-amber-500" />;
      case 'inspection':
        return <ClipboardCheck className="h-4 w-4 text-purple-500" />;
      default:
        return <Wrench className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Maintenance History</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            Add Record
            <Plus className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="space-y-4">
          {maintenanceRecords.length > 0 ? (
            maintenanceRecords.map((record) => (
              <div key={record.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                        {getTypeIcon(record.type)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{record.description}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{record.mileage.toLocaleString()} km</span>
                        {record.cost && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="font-medium">${record.cost.toFixed(2)}</span>
                          </>
                        )}
                      </div>
                      {record.notes && (
                        <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {getStatusIcon(record.status)}
                      <span className="ml-1 capitalize">{record.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <Wrench className="h-full w-full" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance records</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a maintenance record.</p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Add Record
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add missing icon components
function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ClipboardCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}
