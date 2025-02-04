import L from 'leaflet';
import { SailboatIcon } from 'lucide-react';

export const toiletIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 22V20C8 19 9 18 11 18H13C15 18 16 19 16 20V22" />
      <path d="M6 18H18" />
      <path d="M12 4C13.1046 4 14 4.89543 14 6V12H10V6C10 4.89543 10.8954 4 12 4Z" />
      <path d="M16 12H8" />
    </svg>
  `),
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
});