import React from "react";
import { Building2 } from "lucide-react";

// Importações das imagens dos logos
import nubankLogo from "/public/bank-logos/nubank.png";
import santanderLogo from "/public/bank-logos/santander.png";
import itauLogo from "/public/bank-logos/itau.png";
import bancoBrasilLogo from "/public/bank-logos/banco-do-brasil.png";
import caixaLogo from "/public/bank-logos/caixa.png";
import sicrediLogo from "/public/bank-logos/sicredi.png";
import sicoobLogo from "/public/bank-logos/sicoob.png";
import bradescoLogo from "/public/bank-logos/bradesco.jpg";
import interLogo from "/public/bank-logos/inter.png";

interface BankLogoProps {
  bankName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Mapeamento dos nomes dos bancos para as imagens importadas
const bankLogos: Record<string, string> = {
  Nubank: nubankLogo,
  Santander: santanderLogo,
  Itaú: itauLogo,
  "Banco do Brasil": bancoBrasilLogo,
  Caixa: caixaLogo,
  Sicredi: sicrediLogo,
  Sicoob: sicoobLogo,
  Bradesco: bradescoLogo,
  Inter: interLogo,
  // "Outros": não há arquivo, usará fallback
};

// Cores de fallback para cada banco (caso a imagem não carregue)
const bankFallbackColors: Record<string, string> = {
  Nubank: "#8A05BE",
  Santander: "#EC1C24",
  Itaú: "#EC7000",
  "Banco do Brasil": "#FFF100",
  Caixa: "#0066CC",
  Sicredi: "#00A859",
  Sicoob: "#00A859",
  Bradesco: "#CC092F",
  Inter: "#FF7A00",
  Outros: "#6B7280",
};

// Iniciais para fallback
const bankInitials: Record<string, string> = {
  Nubank: "Nu",
  Santander: "S",
  Itaú: "I",
  "Banco do Brasil": "BB",
  Caixa: "C",
  Sicredi: "SC",
  Sicoob: "SB",
  Bradesco: "B",
  Inter: "IN",
  Outros: "🏦",
};

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

export function BankLogo({
  bankName,
  size = "md",
  className = "",
}: BankLogoProps) {
  const [imageError, setImageError] = React.useState(false);
  const logoSrc = bankLogos[bankName];
  const fallbackColor = bankFallbackColors[bankName] || "#6B7280";
  const initials = bankInitials[bankName] || "?";

  // Se não há logo importado ou houve erro, mostra fallback
  if (!logoSrc || imageError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`}
        style={{ backgroundColor: fallbackColor }}
      >
        {bankName === "Outros" ? (
          <Building2 className="w-3/5 h-3/5 text-white" />
        ) : (
          <span
            className={`font-bold text-white ${
              size === "sm"
                ? "text-xs"
                : size === "md"
                ? "text-sm"
                : "text-base"
            }`}
          >
            {initials}
          </span>
        )}
      </div>
    );
  }

  // Mostra a imagem importada
  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}
    >
      <img
        src={logoSrc}
        alt={`Logo ${bankName}`}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
        onLoad={() => setImageError(false)}
      />
    </div>
  );
}
