'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import NotificationBell from './NotificationBell';

interface DropdownItem {
  label: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

interface NavLink {
  label: string;
  href?: string;
  onClick?: () => void;
  highlight?: boolean;
  dropdown?: DropdownItem[];
}

interface MobileNavProps {
  brand?: string;
  links: NavLink[];
  showNotification?: boolean;
  notificationTokenKey?: string;
}

export default function MobileNav({
  brand = 'EventPro',
  links,
  showNotification = false,
  notificationTokenKey = 'clientToken',
}: MobileNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hlStyle = {
    background: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
    boxShadow: '0 4px 15px rgba(14,165,233,0.3)',
  };

  const close = () => { setMenuOpen(false); setOpenDropdown(null); };

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 border-b"
      style={{ background: 'rgba(10,22,40,0.97)', borderColor: 'rgba(14,165,233,0.15)', backdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={close}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)' }}>E</div>
          <span className="text-lg font-black text-white">{brand}</span>
        </Link>

        {/* Desktop links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link, i) => {
            if (link.dropdown) {
              const isOpen = openDropdown === i;
              return (
                <div key={i} className="relative">
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : i)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    {link.label}
                    <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden shadow-2xl z-50"
                      style={{ background: 'rgba(10,22,40,0.98)', border: '1px solid rgba(14,165,233,0.2)', backdropFilter: 'blur(20px)' }}>
                      {link.dropdown.map((item, j) =>
                        item.href ? (
                          <Link key={j} href={item.href} onClick={close}
                            className={`flex items-center px-4 py-3 text-sm font-semibold transition-all ${item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>
                            {item.label}
                          </Link>
                        ) : (
                          <button key={j} onClick={() => { close(); item.onClick?.(); }}
                            className={`w-full text-left px-4 py-3 text-sm font-semibold transition-all ${item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>
                            {item.label}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            }
            return link.href ? (
              <Link key={i} href={link.href}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${link.highlight ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                style={link.highlight ? hlStyle : {}}>
                {link.label}
              </Link>
            ) : (
              <button key={i} onClick={link.onClick}
                className="px-4 py-2 text-sm font-semibold rounded-xl transition-all text-slate-400 hover:text-white hover:bg-white/10">
                {link.label}
              </button>
            );
          })}
          {showNotification && <NotificationBell tokenKey={notificationTokenKey} />}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2">
          {showNotification && <NotificationBell tokenKey={notificationTokenKey} />}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-xl transition-all hover:bg-white/10"
            style={{ color: '#94a3b8' }}
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="md:hidden px-4 pb-4"
          style={{ borderTop: '1px solid rgba(14,165,233,0.1)' }}
        >
          <div className="pt-3 space-y-1">
            {links.map((link, i) => {
              if (link.dropdown) {
                const isOpen = openDropdown === i;
                return (
                  <div key={i}>
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                      <span>{link.label}</span>
                      <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="ml-4 mt-1 space-y-1 pl-3" style={{ borderLeft: '2px solid rgba(14,165,233,0.2)' }}>
                        {link.dropdown.map((item, j) =>
                          item.href ? (
                            <Link key={j} href={item.href} onClick={close}
                              className={`block px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                              {item.label}
                            </Link>
                          ) : (
                            <button key={j} onClick={() => { close(); item.onClick?.(); }}
                              className={`w-full text-left px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                              {item.label}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              return link.href ? (
                <Link key={i} href={link.href} onClick={close}
                  className={`block px-4 py-3 text-sm font-semibold rounded-xl transition-all ${link.highlight ? 'text-white text-center' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                  style={link.highlight ? hlStyle : {}}>
                  {link.label}
                </Link>
              ) : (
                <button key={i} onClick={() => { close(); link.onClick?.(); }}
                  className="w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition-all text-slate-300 hover:text-white hover:bg-white/10">
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
