export const siteConfig = {
  name: 'Mr. Car Automotive Group',
  shortName: 'Mr. Car',
  description: 'Importación directa de vehículos seleccionados y confiables desde Estados Unidos. Atención personalizada en español y opciones de financiamiento para nuestra comunidad.',
  url: 'https://mrcarimport.com',
  defaultLanguage: 'es',
  
  // Contact details (Temporary, clearly marked)
  contact: {
    phone: '+1 (240) 3195266', // Temporary sales contact
    whatsapp: '12403195266',     // International format without '+' or spaces
    email: 'mrcarlandovermarketing@gmail.com',
    address: '7350 Martin Luther King Jr Hwy Landover, MD 20785, EE. UU.',
    city: 'Landover',
    state: 'Maryland',
    workingHours: 'Lunes a Viernes: 9:00 AM - 6:00 PM | Sábados: 10:00 AM - 4:00 PM',
  },

  // Navigation Links
  navigation: [
    { label: 'Inicio', href: '/' },
    { label: 'Inventario', href: '#catalog-section' },
    { label: 'Financiamiento', href: '#financing-section' },
    { label: 'Nosotros', href: '#about-section' },
    { label: 'Contacto', href: '#contact-section' },
  ],

  // Social Links (Temporary)
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61591412078051',
    instagram: 'https://www.instagram.com/mrcar_landover/',
    whatsapp: 'https://wa.me/12403195266',
  },

  // Dynamic WhatsApp Messages Templates
  whatsappTemplates: {
    general: 'Hola, me gustaría recibir más información sobre sus servicios de importación de vehículos.',
    financing: 'Hola, me interesa conocer más sobre las opciones de financiamiento para comprar un vehículo en Mr. Car.',
    vehicleInterest: (brand: string, model: string, year: number, version: string, price: string, vin: string, url: string) => {
      return `Hola, estoy interesado en el ${year} ${brand} ${model} (${version}) con precio de ${price} y VIN: ${vin} que vi en su catálogo de Mr. Car (${url}). ¿Podrían darme más información?`;
    }
  },

  // Legal Notes
  legal: {
    disclaimer: 'La disponibilidad, precios, millajes y condiciones de financiamiento de los vehículos pueden cambiar sin previo aviso.',
    privacyPolicy: '#',
    termsAndConditions: '#',
    copyright: `© ${new Date().getFullYear()} Mr. Car Automotive Group. Todos los derechos reservados.`,
  },

  // SEO default configurations
  seo: {
    defaultTitle: 'Mr. Car Automotive Group | Importación de Vehículos EE. UU.',
    titleTemplate: '%s | Mr. Car Automotive Group',
    defaultDescription: 'Encuentra vehículos confiables, precios competitivos y asesoramiento en español. Tu próximo auto está más cerca de lo que imaginas con Mr. Car.',
    ogType: 'website',
    ogLocale: 'es_US',
    siteName: 'Mr. Car Automotive Group',
    twitterCard: 'summary_large_image',
    socialImage: '/placeholders/vehicle-placeholder.png',
  },

  // Chatbot configurations
  chatbot: {
    welcomeMessage: '¡Hola! Soy el asistente virtual de Mr. Car. Puedo ayudarte a encontrar vehículos disponibles, conocer opciones de financiamiento o comunicarte con un asesor. ¿Qué estás buscando?',
    offlineMessage: 'Nuestro equipo de asesores está offline en este momento. Por favor contáctanos por WhatsApp para una respuesta rápida.',
    suggestedPrompts: [
      { text: '🚗 Ver inventario', action: 'show_catalog' },
      { text: '💰 Información de financiamiento', action: 'show_financing' },
      { text: '📞 Hablar con un asesor', action: 'show_advisor' },
      { text: 'ℹ️ Sobre nosotros', action: 'show_about' }
    ],
    simulatedResponses: {
      show_catalog: '¡Excelente decisión! Desplázate hacia abajo en la página para explorar nuestro **catálogo completo**. Contamos con filtros avanzados por marca, año, precio y tipo de transmisión para que encuentres tu vehículo ideal.',
      show_financing: 'En **Mr. Car** te orientamos en todo el proceso. Trabajamos para ofrecerte opciones adaptadas a tu perfil. Para iniciar una asesoría de financiamiento personalizada, haz clic en el botón de **WhatsApp** o en la sección **"Solicitar Información"** en nuestro bloque de financiamiento.',
      show_advisor: 'Para recibir atención personalizada en español con uno de nuestros asesores, puedes hacer clic en el botón flotante de WhatsApp o escribir directamente a nuestro número: **+1 (240) 319-5266**. ¡Estaremos encantados de ayudarte!',
      show_about: 'En **Mr. Car Automotive Group** estamos dedicados a servir a la comunidad hispana. Ofrecemos acompañamiento completo en la selección e importación de vehículos directamente desde EE. UU., garantizando transparencia y un servicio personalizado.'
    }
  }
};
export type SiteConfig = typeof siteConfig;
