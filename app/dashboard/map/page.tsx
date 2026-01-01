'use client'

import { MapPin } from 'lucide-react'

export default function MapPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Live Fleet Map</h2>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Map View Coming Soon
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          The live map feature will display all vehicles with real-time positions,
          routes, and trip status. Integration with Leaflet maps is ready to implement.
        </p>
        <div className="mt-6 text-sm text-gray-500">
          <p>Planned features:</p>
          <ul className="mt-2 space-y-1">
            <li>• Real-time vehicle markers</li>
            <li>• Color-coded by status (available, allocated, on trip)</li>
            <li>• Click vehicle for details</li>
            <li>• Route visualization</li>
            <li>• Geofence zones (airports, hotels)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
