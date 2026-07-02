import React from 'react';
import { Users, RefreshCw, Landmark, Route, MessageCircle, Eye } from 'lucide-react';

export function TrustBenefits() {
  const benefits = [
    {
      icon: <Users className="h-6 w-6 text-brand-red" />,
      title: 'Atención Personalizada en Español',
      description: 'Te atendemos y guiamos en tu propio idioma. Sin barreras, con calidez y cercanía.'
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-brand-red" />,
      title: 'Inventario Actualizado',
      description: 'Nuestra flota e importaciones disponibles se actualizan diariamente desde las subastas y patios.'
    },
    {
      icon: <Landmark className="h-6 w-6 text-brand-red" />,
      title: 'Opciones de Financiamiento',
      description: 'Colaboramos en brindarte la información y asesoría financiera adecuada a tu perfil comercial.'
    },
    {
      icon: <Route className="h-6 w-6 text-brand-red" />,
      title: 'Acompañamiento Completo',
      description: 'Estamos contigo desde la selección del vehículo hasta el proceso de importación y entrega final.'
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-emerald-500" />,
      title: 'Respuesta Rápida por WhatsApp',
      description: '¿Dudas sobre un auto? Escríbenos y un agente humano te responderá de inmediato.'
    },
    {
      icon: <Eye className="h-6 w-6 text-brand-red" />,
      title: 'Transparencia en la Información',
      description: 'VINs publicados, kilometraje verificado y fotos detalladas sin sorpresas ocultas.'
    }
  ];

  return (
    <section className="w-full bg-zinc-900/60 py-16 border-b border-zinc-900 relative overflow-hidden">
      {/* Background design elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-red/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-red">
            Beneficios
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight mt-1 sm:text-4xl">
            ¿Por qué Elegir a Mr. Car?
          </h2>
          <p className="mt-2 text-zinc-400 text-sm max-w-md mx-auto">
            Seguridad, confianza y el servicio que nuestra comunidad merece.
          </p>
        </div>

        {/* Grid benefits */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 p-6 transition-all duration-300 hover:border-zinc-700/80 hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 flex-shrink-0">
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-zinc-450 text-xs leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
export default TrustBenefits;
