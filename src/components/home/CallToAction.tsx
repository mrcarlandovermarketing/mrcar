import React from 'react';
import { siteConfig } from '@/config/site';
import { MessageCircle, ArrowRight } from 'lucide-react';

export function CallToAction() {
  const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappTemplates.general)}`;

  return (
    <section id="contact-section" className="w-full bg-zinc-950 py-16 scroll-mt-20 relative overflow-hidden">
      
      {/* Background ambient accents in red */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[500px] rounded-full bg-brand-red/10 blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-12 backdrop-blur-md relative overflow-hidden">
          
          {/* Subtle borders */}
          <div className="absolute top-0 left-0 w-24 h-1 border-t-2 border-brand-red" />
          <div className="absolute bottom-0 right-0 w-24 h-1 border-b-2 border-brand-red" />

          <span className="text-xs font-bold uppercase tracking-widest text-brand-red">
            Contacto de Ventas
          </span>
          
          <h2 className="text-3xl font-black text-white tracking-tight mt-2 sm:text-4xl">
            ¿Listo para Encontrar tu Próximo Vehículo?
          </h2>
          
          <p className="mt-3 text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
            Habla con nuestro equipo hoy mismo, recibe asesoramiento en español y aclara todas tus dudas de importación.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#catalog-section"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white px-6 py-4 text-xs font-bold transition-all shadow-md shadow-brand-red/15 active:scale-98"
            >
              Ver inventario disponible
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 hover:text-white px-6 py-4 text-xs font-bold transition-all cursor-pointer"
            >
              <MessageCircle className="h-4 w-4 text-emerald-500" />
              Contactar por WhatsApp
            </a>
          </div>

          {/* Business email support message */}
          <div className="mt-6 text-xs text-zinc-550 flex justify-center items-center gap-1.5">
            <span>O escríbenos al correo:</span>
            <a href={`mailto:${siteConfig.contact.email}`} className="text-zinc-400 hover:underline">
              {siteConfig.contact.email}
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
export default CallToAction;
