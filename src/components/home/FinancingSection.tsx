import React from 'react';
import { Landmark, MessageCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function FinancingSection() {
  const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappTemplates.financing)}`;

  return (
    <section id="financing-section" className="w-full bg-zinc-950 py-16 border-b border-zinc-900 scroll-mt-20 relative">
      
      {/* Background glow in red */}
      <div className="absolute top-1/2 right-10 h-72 w-72 rounded-full bg-brand-red/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Context and copy */}
          <div className="lg:col-span-6 flex flex-col justify-center text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-red mb-2">
              Servicios Financieros
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl leading-tight">
              Opciones para Ayudarte a <br className="hidden sm:inline" />
              Comprar tu Vehículo
            </h2>
            <p className="mt-4 text-zinc-400 text-sm leading-relaxed max-w-xl mx-auto lg:mx-0">
              Te orientamos durante todo el proceso de importación y te ayudamos a conocer las opciones y requisitos de crédito disponibles en el mercado según tu perfil financiero.
            </p>

            {/* Disclaimer showing responsible lending guidelines */}
            <div className="mt-6 flex gap-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-4 text-left max-w-xl mx-auto lg:mx-0">
              <ShieldAlert className="h-5 w-5 text-brand-red flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Asesoría Responsable</h4>
                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                  Mr. Car no realiza financiamiento directo ni garantiza la aprobación de créditos. Las tasas y condiciones dependen exclusivamente de las entidades financieras aliadas y de la evaluación de tu historial crediticio en Estados Unidos.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 self-center lg:self-start">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white px-6 py-4 text-sm font-bold transition-all shadow-md shadow-brand-red/10 cursor-pointer active:scale-98"
              >
                <MessageCircle className="h-5 w-5" />
                Solicitar información de financiamiento
              </a>
            </div>
          </div>

          {/* Right Column: Visual space/container for future credit form */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 backdrop-blur-md overflow-hidden">
              
              {/* Coming Soon Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-brand-red/10 border border-brand-red/20 px-3 py-1 text-[10px] font-bold text-brand-red uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                Próximamente
              </div>

              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5 mb-6">
                <Landmark className="h-5 w-5 text-zinc-500" />
                Simulador de Crédito
              </h3>

              {/* Form Layout (Disabled inputs for visualization) */}
              <div className="space-y-4 opacity-50 select-none">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-450 uppercase tracking-widest mb-1.5">
                    Monto estimado del préstamo (USD)
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="$15,000"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-3 px-4 text-xs focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-450 uppercase tracking-widest mb-1.5">
                      Plazo (Meses)
                    </label>
                    <select
                      disabled
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-3 px-4 text-xs focus:outline-none cursor-not-allowed appearance-none"
                    >
                      <option>48 meses</option>
                      <option>60 meses</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-450 uppercase tracking-widest mb-1.5">
                      Perfil de Crédito
                    </label>
                    <select
                      disabled
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 py-3 px-4 text-xs focus:outline-none cursor-not-allowed appearance-none"
                    >
                      <option>Bueno (660 - 719)</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-950/50 p-4 border border-zinc-850/50 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Cuota mensual estimada</span>
                  <span className="text-2xl font-black text-zinc-400 mt-1 block">$295 - $320 / mes</span>
                </div>
              </div>

              {/* Overlay banner describing future functionality */}
              <div className="absolute inset-0 bg-brand-dark/10 backdrop-blur-[1px] flex items-center justify-center p-6 text-center select-none pointer-events-none">
                <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 max-w-xs shadow-xl">
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                    Estamos diseñando una herramienta interactiva para que simules y pre-califiques tu crédito al instante.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
export default FinancingSection;
