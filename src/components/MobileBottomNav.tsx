"use client";

import { usePathname, Link } from '@/i18n/routing';
import { 
  Home, 
  BookOpen, 
  Info 
} from 'lucide-react';

interface MobileBottomNavProps {
  role?: 'student' | 'teacher';
}

export default function MobileBottomNav({ role = 'student' }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Define WhatsApp support URL (WhatsApp number can be updated anytime later)
  const whatsappNumber = "8801700000000";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello%20SkyLearners%20Support`;

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      exact: true,
    },
    {
      name: 'Courses',
      href: '/courses',
      icon: BookOpen,
      exact: false,
    },
    {
      name: 'About',
      href: '/about',
      icon: Info,
      exact: false,
    },
    {
      name: 'WhatsApp',
      href: whatsappUrl,
      isExternal: true,
      icon: WhatsAppIcon,
    },
  ];

  const activeColorClass = role === 'teacher' ? 'text-orange-500' : 'text-primary';
  const activeBgClass = role === 'teacher' ? 'bg-orange-500/10' : 'bg-primary/10';
  const activeGlowClass = role === 'teacher' ? 'shadow-[0_0_12px_rgba(249,115,22,0.4)]' : 'shadow-[0_0_12px_rgba(59,130,246,0.4)]';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="mx-3 mb-3 bg-background/85 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-2xl p-1.5 flex items-center justify-around relative overflow-hidden transition-all duration-300">
        
        {/* Subtle glow background highlight */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-10 bg-primary/20 blur-2xl rounded-full pointer-events-none"></div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = !item.isExternal && (
            item.exact 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          );

          const content = (
            <div className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 group ${
              isActive 
                ? `${activeBgClass} ${activeColorClass} scale-105 font-semibold` 
                : 'text-foreground/60 hover:text-foreground hover:scale-105'
            }`}>
              {/* Active indicator bar */}
              {isActive && (
                <span className={`absolute -top-1 w-5 h-1 rounded-full ${role === 'teacher' ? 'bg-orange-500' : 'bg-primary'} ${activeGlowClass} animate-in fade-in zoom-in-75 duration-200`} />
              )}

              <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                isActive ? `${activeColorClass}` : 'group-hover:text-foreground'
              }`} />

              <span className="text-[11px] mt-0.5 tracking-tight font-medium">
                {item.name}
              </span>
            </div>
          );

          if (item.isExternal) {
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex justify-center text-center"
              >
                {content}
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex justify-center text-center"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Custom SVG Icon for WhatsApp
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.975-1.393A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm.052 16.483h-.008a8.232 8.232 0 01-4.2-1.155l-.301-.179-2.956.828.842-2.876-.196-.312A8.204 8.204 0 013.78 12c0-4.533 3.687-8.22 8.225-8.22 4.532 0 8.216 3.687 8.216 8.22 0 4.534-3.686 8.223-8.22 8.223zm4.512-6.16c-.247-.124-1.463-.722-1.69-.804-.226-.083-.391-.124-.556.124-.165.247-.64.804-.784.97-.144.165-.288.185-.535.061-.247-.123-1.045-.385-1.99-1.229-.737-.657-1.235-1.468-1.38-1.715-.144-.247-.015-.38.109-.504.111-.11.247-.288.371-.433.124-.144.165-.247.247-.412.083-.165.041-.309-.02-.433-.062-.124-.557-1.34-.763-1.835-.2-.483-.404-.418-.557-.426l-.474-.008c-.165 0-.433.062-.66.309-.226.247-.866.846-.866 2.063 0 1.217.887 2.393 1.01 2.558.124.165 1.747 2.668 4.232 3.742.59.255 1.05.408 1.41.522.593.189 1.134.162 1.56.099.475-.07 1.463-.598 1.669-1.176.206-.577.206-1.072.144-1.175-.062-.103-.226-.165-.473-.289z" />
    </svg>
  );
}
