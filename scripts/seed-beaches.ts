/**
 * Seeds the beaches table with known Caribbean beaches.
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-beaches.ts
 */

import { createClient } from '@supabase/supabase-js'

const beaches = [
  // Mexico
  { name: 'Playa del Carmen', lat: 20.6296, lng: -87.0739, country: 'Mexico' },
  { name: 'Tulum Beach', lat: 20.2114, lng: -87.4654, country: 'Mexico' },
  { name: 'Cancún Hotel Zone Beach', lat: 21.1619, lng: -86.8515, country: 'Mexico' },
  { name: 'Playa Norte Isla Mujeres', lat: 21.2493, lng: -86.7301, country: 'Mexico' },
  { name: 'Akumal Beach', lat: 20.3972, lng: -87.3195, country: 'Mexico' },
  { name: 'Playa Paraíso', lat: 20.1778, lng: -87.4561, country: 'Mexico' },
  { name: 'Xcacel Beach', lat: 20.3167, lng: -87.3333, country: 'Mexico' },
  { name: 'Holbox Beach', lat: 21.5224, lng: -87.3792, country: 'Mexico' },
  { name: 'Xpu-Ha Beach', lat: 20.4500, lng: -87.3167, country: 'Mexico' },
  { name: 'Playa Mujeres', lat: 21.2667, lng: -86.7833, country: 'Mexico' },
  // Jamaica
  { name: 'Seven Mile Beach', lat: 18.4663, lng: -78.1328, country: 'Jamaica' },
  { name: 'Doctor\'s Cave Beach', lat: 18.4762, lng: -77.9218, country: 'Jamaica' },
  { name: 'Negril Beach', lat: 18.2686, lng: -78.3558, country: 'Jamaica' },
  { name: 'Frenchman\'s Cove', lat: 18.1772, lng: -76.4173, country: 'Jamaica' },
  { name: 'Treasure Beach', lat: 17.9167, lng: -77.7667, country: 'Jamaica' },
  { name: 'Boston Bay Beach', lat: 18.1667, lng: -76.3833, country: 'Jamaica' },
  // Dominican Republic
  { name: 'Punta Cana Beach', lat: 18.5820, lng: -68.4005, country: 'Dominican Republic' },
  { name: 'Bávaro Beach', lat: 18.6955, lng: -68.4453, country: 'Dominican Republic' },
  { name: 'Playa Rincón', lat: 19.2167, lng: -69.4500, country: 'Dominican Republic' },
  { name: 'Cabarete Beach', lat: 19.7500, lng: -70.4167, country: 'Dominican Republic' },
  { name: 'Las Terrenas Beach', lat: 19.3167, lng: -69.5333, country: 'Dominican Republic' },
  { name: 'Playa Dorada', lat: 19.8000, lng: -70.7167, country: 'Dominican Republic' },
  { name: 'Playa Grande', lat: 19.6833, lng: -70.0000, country: 'Dominican Republic' },
  // Puerto Rico
  { name: 'Flamenco Beach', lat: 18.3377, lng: -65.3239, country: 'Puerto Rico' },
  { name: 'Playa Condado', lat: 18.4600, lng: -66.0700, country: 'Puerto Rico' },
  { name: 'Luquillo Beach', lat: 18.3733, lng: -65.7197, country: 'Puerto Rico' },
  { name: 'Crash Boat Beach', lat: 18.4761, lng: -67.1625, country: 'Puerto Rico' },
  { name: 'Sun Bay Beach', lat: 18.1000, lng: -65.4333, country: 'Puerto Rico' },
  { name: 'Playa Sucia', lat: 17.9500, lng: -67.2167, country: 'Puerto Rico' },
  // Barbados
  { name: 'Crane Beach', lat: 13.1028, lng: -59.4428, country: 'Barbados' },
  { name: 'Accra Beach', lat: 13.0667, lng: -59.5833, country: 'Barbados' },
  { name: 'Bottom Bay', lat: 13.0833, lng: -59.4333, country: 'Barbados' },
  { name: 'Bathsheba Beach', lat: 13.2167, lng: -59.5167, country: 'Barbados' },
  { name: 'Mullins Beach', lat: 13.2833, lng: -59.6333, country: 'Barbados' },
  // Trinidad & Tobago
  { name: 'Pigeon Point', lat: 11.1500, lng: -60.8333, country: 'Trinidad and Tobago' },
  { name: 'Store Bay', lat: 11.1500, lng: -60.8500, country: 'Trinidad and Tobago' },
  { name: 'Maracas Bay', lat: 10.7500, lng: -61.4167, country: 'Trinidad and Tobago' },
  { name: 'Las Cuevas Beach', lat: 10.7667, lng: -61.3833, country: 'Trinidad and Tobago' },
  // Antigua
  { name: 'Dickenson Bay', lat: 17.1500, lng: -61.8667, country: 'Antigua and Barbuda' },
  { name: 'Half Moon Bay', lat: 17.0333, lng: -61.7333, country: 'Antigua and Barbuda' },
  { name: 'Jolly Beach', lat: 17.0500, lng: -61.9000, country: 'Antigua and Barbuda' },
  // St. Lucia
  { name: 'Reduit Beach', lat: 14.0667, lng: -60.9500, country: 'Saint Lucia' },
  { name: 'Anse Chastanet', lat: 13.8667, lng: -61.0667, country: 'Saint Lucia' },
  { name: 'Sugar Beach', lat: 13.8500, lng: -61.0667, country: 'Saint Lucia' },
  { name: 'Anse des Sables', lat: 13.7167, lng: -60.9333, country: 'Saint Lucia' },
  // St. Martin / Sint Maarten
  { name: 'Orient Beach', lat: 18.0833, lng: -63.0167, country: 'Saint Martin' },
  { name: 'Maho Beach', lat: 18.0417, lng: -63.1167, country: 'Sint Maarten' },
  { name: 'Grand Case Beach', lat: 18.0997, lng: -63.0542, country: 'Saint Martin' },
  // Aruba
  { name: 'Eagle Beach', lat: 12.5500, lng: -70.0667, country: 'Aruba' },
  { name: 'Palm Beach', lat: 12.5667, lng: -70.0500, country: 'Aruba' },
  { name: 'Baby Beach', lat: 12.4167, lng: -69.8833, country: 'Aruba' },
  // Curaçao
  { name: 'Cas Abao Beach', lat: 12.2000, lng: -69.0833, country: 'Curaçao' },
  { name: 'Playa Kenepa Grandi', lat: 12.2667, lng: -69.1500, country: 'Curaçao' },
  { name: 'Jan Thiel Beach', lat: 12.0833, lng: -68.8667, country: 'Curaçao' },
  // Grenada
  { name: 'Grand Anse Beach', lat: 12.0333, lng: -61.7667, country: 'Grenada' },
  { name: 'Morne Rouge Beach', lat: 12.0167, lng: -61.7500, country: 'Grenada' },
  // Haiti
  { name: 'Labadie Beach', lat: 19.7667, lng: -72.2167, country: 'Haiti' },
  { name: 'Wahoo Bay Beach', lat: 18.9167, lng: -72.6667, country: 'Haiti' },
  // Cuba
  { name: 'Varadero Beach', lat: 23.1500, lng: -81.2500, country: 'Cuba' },
  { name: 'Playa Sirena', lat: 21.8833, lng: -82.8167, country: 'Cuba' },
  { name: 'Guardalavaca Beach', lat: 21.1000, lng: -75.8333, country: 'Cuba' },
  // Belize
  { name: 'Ambergris Caye Beach', lat: 17.9333, lng: -87.9667, country: 'Belize' },
  { name: 'Caye Caulker Beach', lat: 17.7333, lng: -88.0333, country: 'Belize' },
  // Colombia
  { name: 'Playa Blanca Cartagena', lat: 10.1833, lng: -75.6833, country: 'Colombia' },
  { name: 'El Rodadero Beach', lat: 11.2000, lng: -74.2333, country: 'Colombia' },
  { name: 'Cabo San Juan', lat: 11.3833, lng: -73.9333, country: 'Colombia' },
  // Venezuela
  { name: 'Playa El Agua', lat: 11.1500, lng: -63.8833, country: 'Venezuela' },
  { name: 'Playa Colorada', lat: 10.5500, lng: -63.9000, country: 'Venezuela' },
  // Guadeloupe
  { name: 'Grande Anse des Salines', lat: 15.8833, lng: -61.5500, country: 'Guadeloupe' },
  { name: 'Plage de la Caravelle', lat: 16.2167, lng: -61.5000, country: 'Guadeloupe' },
  // Martinique
  { name: 'Les Salines Beach', lat: 14.4167, lng: -60.8667, country: 'Martinique' },
  { name: 'Anse Mitan', lat: 14.5500, lng: -61.0500, country: 'Martinique' },
  { name: 'Grande Anse d\'Arlet', lat: 14.4833, lng: -61.0833, country: 'Martinique' },
  // US Virgin Islands
  { name: 'Trunk Bay', lat: 18.3533, lng: -64.7825, country: 'US Virgin Islands' },
  { name: 'Magens Bay', lat: 18.3667, lng: -64.9333, country: 'US Virgin Islands' },
  { name: 'Cinnamon Bay', lat: 18.3500, lng: -64.7667, country: 'US Virgin Islands' },
  // British Virgin Islands
  { name: 'Cane Garden Bay', lat: 18.4167, lng: -64.6333, country: 'British Virgin Islands' },
  { name: 'Loblolly Bay', lat: 18.7500, lng: -64.3333, country: 'British Virgin Islands' },
  // Turks and Caicos
  { name: 'Grace Bay Beach', lat: 21.8000, lng: -72.2000, country: 'Turks and Caicos' },
  { name: 'Long Bay Beach', lat: 21.7833, lng: -72.2333, country: 'Turks and Caicos' },
  { name: 'Malcolm Beach', lat: 21.8667, lng: -72.2500, country: 'Turks and Caicos' },
  // Bahamas
  { name: 'Cable Beach Nassau', lat: 25.0667, lng: -77.3667, country: 'Bahamas' },
  { name: 'Pink Sands Beach', lat: 25.0667, lng: -76.3167, country: 'Bahamas' },
  { name: 'Gold Rock Beach', lat: 26.5333, lng: -78.3000, country: 'Bahamas' },
  // Honduras
  { name: 'West Bay Beach', lat: 16.2833, lng: -86.5667, country: 'Honduras' },
  { name: 'Half Moon Bay', lat: 16.3333, lng: -86.5500, country: 'Honduras' },
  // Nicaragua
  { name: 'Corn Island Beach', lat: 12.1667, lng: -83.0500, country: 'Nicaragua' },
  // Panama
  { name: 'Bocas del Toro Beach', lat: 9.3333, lng: -82.2500, country: 'Panama' },
  { name: 'Santa Catalina Beach', lat: 7.8500, lng: -81.2833, country: 'Panama' },
]

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  console.log(`Seeding ${beaches.length} Caribbean beaches…`)

  const { error } = await supabase
    .from('beaches')
    .insert(beaches)

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`Done! ${beaches.length} beaches seeded.`)
}

main()
