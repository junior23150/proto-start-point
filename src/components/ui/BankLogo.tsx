import React from 'react';
import { Building2 } from 'lucide-react';

interface BankLogoProps {
  bankName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const bankLogos: Record<string, React.ReactNode> = {
  "Nubank": (
    <div className="w-full h-full bg-[#8A05BE] rounded-full flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-3/5 h-3/5 fill-white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    </div>
  ),
  "Santander": (
    <div className="w-full h-full bg-[#EC1C24] rounded-full flex items-center justify-center">
      <span className="text-white font-bold text-xs">S</span>
    </div>
  ),
  "Itaú": (
    <div className="w-full h-full bg-[#EC7000] rounded-full flex items-center justify-center">
      <span className="text-white font-bold text-xs">I</span>
    </div>
  ),
  "Banco do Brasil": (
    <div className="w-full h-full bg-[#FFF100] rounded-full flex items-center justify-center">
      <span className="text-black font-bold text-xs">BB</span>
    </div>
  ),
  "Caixa": (
    <div className="w-full h-full bg-[#0066CC] rounded-full flex items-center justify-center">
      <span className="text-white font-bold text-xs">C</span>
    </div>
  ),
  "Sicredi": (
    <div className="w-full h-full bg-[#00A859] rounded-full flex items-center justify-center">
      <span className="text-white font-bold text-xs">SC</span>
    </div>
  ),
  "Sicoob": (
    <div className="w-full h-full bg-[#00A859] rounded-full flex items-center justify-center">
      <span className="text-white font-bold text-xs">SB</span>
    </div>
  ),
  "Bradesco": (
    <div className="w-full h-full bg-[#CC092F] rounded-full flex items-center justify-center">
      <span className="text-white font-bold text-xs">B</span>
    </div>
  ),
  "Inter": (
    <div className="w-full h-full bg-[#FF7A00] rounded-full flex items-center justify-center">
      <span className="text-white font-bold text-xs">IN</span>
    </div>
  ),
  "Outros": (
    <div className="w-full h-full bg-[#6B7280] rounded-full flex items-center justify-center">
      <Building2 className="w-3/5 h-3/5 text-white" />
    </div>
  ),
};

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

export function BankLogo({ bankName, size = 'md', className = '' }: BankLogoProps) {
  const logo = bankLogos[bankName];
  
  if (!logo) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-500 rounded-full flex items-center justify-center ${className}`}>
        <Building2 className="w-3/5 h-3/5 text-white" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {logo}
    </div>
  );
}
