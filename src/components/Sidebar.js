'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: 'dashboard', label: 'Dashboard' },
  { href: '/youtube', icon: 'video_library', label: 'YouTube Tracking' },
  { href: '/outreach', icon: 'send', label: 'Outreach' },
  { href: '/clients', icon: 'groups', label: 'CRM' },
];

const bottomItems = [
  { href: '#', icon: 'help', label: 'Support' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col font-headline antialiased tracking-tight p-4 gap-2 z-50" style={{ backgroundColor: '#f3f7fb' }}>
      {/* Branding */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-xl kinetic-gradient flex items-center justify-center text-white">
          <span className="material-symbols-outlined filled">bolt</span>
        </div>
        <div>
          <h1 className="text-xl font-bold leading-none" style={{ color: '#2a2f32' }}>Arise Transform</h1>
          <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: '#575c60' }}>Kinetic Curator</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#2a4bd9] font-bold bg-white shadow-sm scale-95'
                  : 'text-[#a9aeb1] hover:text-[#2a2f32] hover:bg-[#ecf1f6]'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto pt-4" style={{ borderTop: '1px solid #e3e9ee' }}>
        {bottomItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 text-[#a9aeb1] hover:text-[#2a2f32] transition-colors rounded-xl"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#a9aeb1] hover:text-[#b41340] transition-colors rounded-xl">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium">Logout</span>
        </a>
      </div>
    </aside>
  );
}
