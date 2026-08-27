import type { School } from '@lokalizator/shared-types';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import { SchoolRating } from './school-rating';

// Leaflet domyślnie składa ścieżki do ikon względem CSS-a, co nie działa po
// zbundlowaniu. Podajemy je jawnie jako assety Vite.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/** Środek Polski + zoom obejmujący cały kraj — dane startowe są rozrzucone po PL. */
const POLAND_CENTER: L.LatLngExpression = [52.0, 19.3];
const POLAND_ZOOM = 6;
const SELECTED_ZOOM = 13;

interface SchoolsMapProps {
  schools: School[];
  selected: School | null;
  onSelect: (school: School) => void;
}

/**
 * Mapa Leaflet żyje poza drzewem Reacta, więc reakcję na zmianę zaznaczenia
 * realizujemy imperatywnie: przelot kamery + otwarcie popupu właściwego markera.
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
        // OpenStreetMap nie wymaga klucza API. Atrybucja jest obowiązkowa
        // zgodnie z licencją ODbL.
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
