import React from 'react';
import Image from 'next/image';
import { Heart, ShieldCheck, MessageCircleCode, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function AboutSection() {
  const points = [
    {
      icon: <Heart className="h-5 w-5 text-brand-red" />,
      title: 'Atención enfocada en la Comunidad Hispana',
      description: 'Entendemos las necesidades de nuestra gente en EE. UU. y brindamos un servicio cercano, honesto y familiar.'
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-brand-red" />,
      title: 'Acompañamiento en la Selección',
      description: 'Te asesoramos técnicamente sobre qué vehículo comprar según tu presupuesto, necesidades de carga o comodidad familiar.'
    },
    {
      icon: <MessageCircleCode className="h-5 w-5 text-brand-red" />,
      title: 'Comunicación Clara',
      description: 'Explicamos de forma sencilla y directa cada paso del proceso: tarifas, impuestos de importación, logística y documentación.'
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-brand-red" />,
      title: 'Compromiso con la Transparencia',
      description: 'Facilitamos el número de VIN de cada unidad y fotos de su estado real en origen. Sin tarifas ocultas.'
    }
  ];

  return (
    <section id="about-section" className="w-full bg-zinc-900/60 py-16 border-b border-zinc-900 scroll-mt-20 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Premium dashboard image */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative aspect-[4/3] w-full max-w-xl mx-auto lg:max-w-none overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
              <Image
                src="/images/about-dashboard.png"
                alt="Mr. Car Automotive Group Interior Detail"
                fill
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
                sizes="(max-w-1024px) 100vw, 50vw"
              />
              {/* Soft red accent overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-red/10 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right Column: Values list */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col justify-center text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-red mb-2">
              Quiénes Somos
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
              Sobre Nosotros
            </h2>
            <p className="mt-4 text-zinc-400 text-sm leading-relaxed max-w-xl mx-auto lg:mx-0">
              En **{siteConfig.name}**, nos esforzamos por ser el puente confiable que conecta a nuestros compradores con el auto de sus sueños importado desde EE. UU. Nos define el compromiso con la comunidad, la transparencia total y el acompañamiento personalizado.
            </p>

            {/* Core Values Bullets */}
            <div className="mt-8 space-y-5 max-w-xl mx-auto lg:mx-0">
              {points.map((point, index) => (
                <div key={index} className="flex gap-4 text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800 flex-shrink-0">
                    {point.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {point.title}
                    </h4>
                    <p className="mt-1 text-zinc-450 text-xs leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
export default AboutSection;
