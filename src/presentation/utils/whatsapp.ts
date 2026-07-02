import { Vehicle } from '@/domain/entities/vehicle';

/**
 * Generates a dynamic WhatsApp link for a selected vehicle.
 * Sanitizes the phone number and creates a pre-filled, descriptive message.
 */
export function getWhatsAppLink(vehicle: Vehicle, fallbackNumber = '12403195266'): string {
  // Strip any non-numeric characters from the phone number
  let phoneNumber = vehicle.whatsapp ? vehicle.whatsapp.replace(/[^0-9]/g, '') : '';
  
  if (!phoneNumber) {
    phoneNumber = fallbackNumber.replace(/[^0-9]/g, '');
  }

  // Composes a detailed WhatsApp inquiry message containing Make, Model, Year and URL slug
  const message = `Hola, estoy interesado en el ${vehicle.year} ${vehicle.make} ${vehicle.model} que vi en la página de Mr. Car. ¿Podrían darme más información? (Enlace: https://mrcarimport.com/vehiculo/${vehicle.slug})`;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
