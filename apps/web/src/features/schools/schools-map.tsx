import type { School } from '@lokalizator/shared-types';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import { SchoolRating } from './school-rating';

// By default Leaflet resolves icon paths relative to its CSS, which breaks once
// bundled. Pass them explicitly as Vite assets instead.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/** Centre of Poland + a zoom covering the whole country — the seed data is spread across PL. */
const POLAND_CENTER: L.LatLngExpression = [52.0, 19.3];
const POLAND_ZOOM = 6;
const SELECTED_ZOOM = 13;

interface SchoolsMapProps {
  schools: School[];
  selected: School | null;
  onSelect: (school: School) => void;
}

/**
 * The Leaflet map lives outside the React tree, so reacting to a selection change
 * is imperative: fly the camera there and open that marker's popup.
 */
function SelectionController({
  selected,
  markers,
}: {
  selected: School | null;
  markers: React.RefObject<Map<string, L.Marker>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selected) {
      return;
    }

    map.flyTo([selected.latitude, selected.longitude], SELECTED_ZOOM, { duration: 0.8 });
    markers.current.get(selected.id)?.openPopup();
  }, [map, markers, selected]);

  return null;
}

export function SchoolsMap({ schools, selected, onSelect }: SchoolsMapProps) {
  const markers = useRef<Map<string, L.Marker>>(new Map());

  return (
    <MapContainer center={POLAND_CENTER} zoom={POLAND_ZOOM} scrollWheelZoom className="h-full">
      <TileLayer
        // OpenStreetMap needs no API key. Attribution is mandatory under the ODbL.
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <SelectionController selected={selected} markers={markers} />

      {schools.map((school) => (
        <Marker
          key={school.id}
          position={[school.latitude, school.longitude]}
          ref={(instance) => {
            if (instance) {
              markers.current.set(school.id, instance);
            } else {
              markers.current.delete(school.id);
            }
          }}
          eventHandlers={{ click: () => onSelect(school) }}
        >
          <Popup>
            <div className="flex flex-col gap-1.5">
              <strong className="text-sm leading-snug">{school.name}</strong>
              <span className="text-muted-foreground text-xs">{school.address}</span>
              <SchoolRating rating={school.rating} />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
