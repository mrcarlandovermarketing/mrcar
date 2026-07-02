"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { siteConfig } from '@/config/site';
import { Menu, X, Car, MessageCircle } from 'lucide-react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll to apply sticky designs
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-brand-dark/90 backdrop-blur-md border-b border-zinc-800/80 py-2.5 shadow-lg'
          : 'bg-transparent border-b border-transparent py-4'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-3 transition-opacity hover:opacity-95"
            aria-label="Ir al inicio"
          >
            <BrandLogo variant="header" />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white uppercase leading-none">
                MR. CAR
              </span>
              <span className="text-[9px] font-bold text-brand-red tracking-widest uppercase">
                Automotive Group
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {siteConfig.navigation.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-zinc-300 hover:text-brand-red focus:text-brand-red focus:outline-none transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Call to Action Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#catalog-section"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white px-5 py-2.5 text-xs font-bold transition-all shadow-lg shadow-brand-red/10"
            >
              <Car className="h-4 w-4" />
              Ver Vehículos
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:text-white transition-all focus:outline-none"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Menu Overlay) */}
      <div
        className={`fixed inset-0 top-16 z-40 w-full bg-brand-dark/98 backdrop-blur-lg md:hidden transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-[calc(100vh-4rem)] p-6 justify-between">
          <nav className="flex flex-col gap-5 pt-8">
            {siteConfig.navigation.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                onClick={handleLinkClick}
                className="text-xl font-bold text-zinc-200 hover:text-brand-red transition-all border-b border-zinc-900 pb-3"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-4 pb-12">
            <a
              href="#catalog-section"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-red py-3.5 text-sm font-bold text-white transition-all"
            >
              <Car className="h-5 w-5" />
              Ver Vehículos
            </a>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappTemplates.general)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 py-3.5 text-sm font-bold text-zinc-200 transition-all"
            >
              <MessageCircle className="h-5 w-5 text-emerald-500" />
              Hablar con un Asesor
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
export default Header;
