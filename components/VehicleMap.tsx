'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Map as MapIcon, Satellite, Compass, ExternalLink, RefreshCw } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface VehicleMapProps {
  lat: number;
  lng: number;
  vehicleName: string;
  className?: string;
  onLocationRefresh?: () => void;
  lastUpdated?: Date;
}

export default function VehicleMap({ 
  lat, 
  lng, 
  vehicleName, 
  className = '',
  onLocationRefresh,
  lastUpdated
}: VehicleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const mapInstance = useRef<any>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const streetViewRef = useRef<any>(null);

  // Format last updated time
  const formatLastUpdated = (date?: Date) => {
    if (!date) return 'Never';
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`;
  };

  // Initialize the map
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.onload = () => initializeMap();
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    function initializeMap() {
      if (!mapRef.current) return;

      const position = { lat, lng };
      
      // Initialize the map
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: position,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeId: mapType,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add custom marker
      updateMarker(position);

      // Add street view
      streetViewRef.current = new window.google.maps.StreetViewPanorama(
        mapRef.current,
        {
          position,
          pov: { heading: 34, pitch: 10 },
          visible: false,
          disableDefaultUI: true,
          zoom: 1
        }
      );
      mapInstance.current.setStreetView(streetViewRef.current);

      // Add map type change listener
      window.google.maps.event.addListener(mapInstance.current, 'maptypeid_changed', () => {
        setMapType(mapInstance.current.getMapTypeId());
      });

      setIsMapLoaded(true);
    }

    function updateMarker(position: { lat: number; lng: number }) {
      if (markerRef.current) {
        // Update existing marker position
        markerRef.current.setPosition(position);
      } else if (mapInstance.current) {
        // Create new marker if it doesn't exist
        markerRef.current = new window.google.maps.Marker({
          position,
          map: mapInstance.current,
          title: vehicleName,
          animation: window.google.maps.Animation.DROP,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
              `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#2563eb"/>
                <circle cx="12" cy="9" r="3" fill="white"/>
              </svg>`
            )}`,
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 40)
          }
        });

        // Add click listener to marker
        markerRef.current.addListener('click', () => {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-2 max-w-xs">
                <h4 class="font-semibold text-sm">${vehicleName}</h4>
                <p class="text-xs text-gray-600">${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}</p>
                <p class="text-xs text-gray-500 mt-1">Last updated: ${formatLastUpdated(lastUpdated)}</p>
                <a 
                  href="https://www.google.com/maps?q=${position.lat},${position.lng}" 
                  target="_blank" 
                  class="inline-block mt-2 text-xs text-blue-600 hover:underline"
                  onclick="event.stopPropagation();"
                >
                  Open in Google Maps
                </a>
              </div>
            `
          });
          infoWindow.open(mapInstance.current, markerRef.current);
        });
      }
      
      // Center map on marker if it moves
      if (mapInstance.current) {
        mapInstance.current.panTo(position);
      }
    }

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (streetViewRef.current) {
        streetViewRef.current.setVisible(false);
      }
    };
  }, [lat, lng, vehicleName]);

  // Toggle street view
  const toggleStreetView = () => {
    if (!streetViewRef.current) return;
    
    const newStreetViewState = !showStreetView;
    setShowStreetView(newStreetViewState);
    
    if (newStreetViewState) {
      streetViewRef.current.setPosition({ lat, lng });
      streetViewRef.current.setVisible(true);
      mapInstance.current.setStreetView(streetViewRef.current);
    } else {
      streetViewRef.current.setVisible(false);
      mapInstance.current.setOptions({
        center: { lat, lng },
        zoom: 15
      });
    }
  };

  // Toggle map type
  const toggleMapType = () => {
    if (!mapInstance.current) return;
    const newMapType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
    mapInstance.current.setMapTypeId(newMapType);
    setMapType(newMapType);
  };

  // Handle refresh location
  const handleRefresh = async () => {
    if (!onLocationRefresh) return;
    
    try {
      setIsRefreshing(true);
      await onLocationRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000); // Show loading state for at least 1s
    }
  };

  // Open in Google Maps
  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[300px] md:min-h-[400px] transition-opacity duration-300"
        style={{ opacity: isMapLoaded ? 1 : 0.7 }}
      >
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <MapPin className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-gray-400">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          title="Refresh location"
        >
          <RefreshCw className={`h-5 w-5 text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        
        <button
          onClick={toggleMapType}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          title={mapType === 'roadmap' ? 'Satellite view' : 'Map view'}
        >
          {mapType === 'roadmap' ? (
            <Satellite className="h-5 w-5 text-gray-700" />
          ) : (
            <MapIcon className="h-5 w-5 text-gray-700" />
          )}
        </button>
        
        <button
          onClick={toggleStreetView}
          className={`p-2 rounded-full shadow-md transition-colors ${
            showStreetView ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          title={showStreetView ? 'Exit street view' : 'Street view'}
        >
          <Compass className="h-5 w-5" />
        </button>
        
        <button
          onClick={openInGoogleMaps}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          title="Open in Google Maps"
        >
          <ExternalLink className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md flex items-center text-sm text-gray-700">
        <MapPin className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
        <div className="truncate max-w-xs">
          <span className="font-medium">{vehicleName}</span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-gray-500 text-xs">
            {lastUpdated ? `Updated ${formatLastUpdated(lastUpdated)}` : 'Location not available'}
          </span>
        </div>
      </div>
    </div>
  );
}
