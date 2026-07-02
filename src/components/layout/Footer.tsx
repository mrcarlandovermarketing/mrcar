import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { siteConfig } from '@/config/site';
import { MessageCircle, Mail, MapPin, Clock, Phone } from 'lucide-react';

export function Footer() {
  const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappTemplates.general)}`;

  return (
    <footer className="w-full border-t border-zinc-900 bg-brand-dark/95 py-12 text-zinc-400 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-12 pb-10">
          
          {/* Company Brief */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 self-start">
              <BrandLogo variant="footer" />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white uppercase leading-none">
                  MR. CAR
                </span>
                <span className="text-[10px] font-bold text-brand-red tracking-widest uppercase">
                  Automotive Group
                </span>
              </div>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              {siteConfig.description}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2 sm:pl-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Navegación</h3>
            <ul className="flex flex-col gap-2.5 text-xs">
              {siteConfig.navigation.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-brand-red transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Contacto</h3>
            <ul className="flex flex-col gap-3 text-xs">
              {siteConfig.contact.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-brand-red flex-shrink-0" />
                  <span>{siteConfig.contact.phone}</span>
                </li>
              )}
              {siteConfig.contact.whatsapp && (
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-emerald-400"
                  >
                    WhatsApp de Ventas
                  </a>
                </li>
              )}
              {siteConfig.contact.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                  <span>{siteConfig.contact.email}</span>
                </li>
              )}
              {siteConfig.contact.address && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                  <span>{siteConfig.contact.address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Business Hours */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Horarios</h3>
            {siteConfig.contact.workingHours && (
              <div className="flex gap-2 text-xs">
                <Clock className="h-4 w-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed text-zinc-500 whitespace-pre-line">
                  {siteConfig.contact.workingHours}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer Area */}
        <div className="border-t border-zinc-900 pt-6 pb-6 text-[10px] text-zinc-600 leading-relaxed text-center sm:text-left">
          <p className="max-w-4xl">
            <strong>Aviso Legal: </strong>{siteConfig.legal.disclaimer}
          </p>
        </div>

        {/* Bottom copyright section */}
        <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-650">
          <div>
            <span>{siteConfig.legal.copyright}</span>
          </div>
          <div className="flex gap-4">
            <a href={siteConfig.legal.privacyPolicy} className="hover:text-zinc-500 transition-colors">
              Política de Privacidad
            </a>
            <a href={siteConfig.legal.termsAndConditions} className="hover:text-zinc-500 transition-colors">
              Términos y Condiciones
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
