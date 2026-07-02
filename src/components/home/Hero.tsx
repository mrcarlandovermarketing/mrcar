import React from 'react';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { ShieldCheck, MessageSquare, Landmark, Lock, MessageCircle, ArrowRight } from 'lucide-react';

export function Hero() {
  const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappTemplates.general)}`;

  const trustIndicators = [
    { icon: <ShieldCheck className="h-5 w-5 text-brand-red" />, text: 'Vehículos seleccionados' },
    { icon: <MessageSquare className="h-5 w-5 text-brand-red" />, text: 'Atención en español' },
    { icon: <Landmark className="h-5 w-5 text-brand-red" />, text: 'Opciones de financiamiento' },
    { icon: <Lock className="h-5 w-5 text-brand-red" />, text: 'Compra 105% segura' },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-brand-dark to-zinc-950 py-16 lg:py-24 border-b border-zinc-900">
      
      {/* Background ambient lighting effects in red */}
      <div className="absolute top-1/4 right-0 h-[300px] w-[300px] rounded-full bg-brand-red/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 h-[250px] w-[250px] rounded-full bg-brand-red/5 blur-[90px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Heading and description */}
          <div className="lg:col-span-6 flex flex-col justify-center text-center lg:text-left animate-fadeInUp">
            <div className="inline-flex items-center justify-center lg:justify-start gap-2 mb-4 self-center lg:self-start rounded-full bg-zinc-900 border border-zinc-800 px-3.5 py-1 text-xs font-semibold text-zinc-350">
              <span className="h-2 w-2 rounded-full bg-brand-red animate-ping" />
              Catálogo actualizado hoy
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              Tu próximo vehículo está <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-205 to-brand-red">
                más cerca de lo que imaginas
              </span>
            </h1>

            <p className="mt-4 text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Encuentra vehículos confiables, precios competitivos y atención personalizada en tu idioma para toda nuestra comunidad.
            </p>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#catalog-section"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white px-6 py-4 text-sm font-bold transition-all shadow-lg shadow-brand-red/15 hover:shadow-brand-red/25 active:scale-98"
              >
                Explorar inventario
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-200 hover:text-white px-6 py-4 text-sm font-bold transition-all"
              >
                <MessageCircle className="h-4 w-4 text-emerald-500" />
                Hablar con un asesor
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-zinc-900 pt-8 max-w-md mx-auto lg:mx-0">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2.5 text-left">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red/10 border border-brand-red/20 flex-shrink-0">
                    {indicator.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-350 tracking-wide">
                    {indicator.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Stunning Hero Car Image */}
          <div className="lg:col-span-6 flex justify-center items-center relative lg:pl-6">
            
            {/* Visual background outline frame for premium look */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-red/10 to-transparent blur-md opacity-70 pointer-events-none" />
            
            <div className="relative w-full aspect-[3/2] max-w-xl lg:max-w-none overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-2xl">
              <Image
                src="/images/hero-car.png"
                alt="Mr. Car Premium Vehicle Showcase"
                fill
                priority
                className="object-cover object-center scale-[1.02] transition-transform duration-700 hover:scale-105"
                sizes="(max-w-1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-40" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
export default Hero;
