import React from "react";
import { Building2 } from "lucide-react";

interface BankLogoProps {
  bankName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Mapeamento dos nomes dos bancos para os arquivos de imagem
const bankImageFiles: Record<string, string> = {
  Nubank: "nubank.png",
  Santander: "santander.png",
  Itaú: "itau.png",
  "Banco do Brasil": "banco-do-brasil.png",
  Caixa: "caixa.png",
  Sicredi: "sicredi.png",
  Sicoob: "sicoob.png",
  Bradesco: "bradesco.jpg", // Arquivo é JPG
  Inter: "inter.png", // Renomeado para minúsculo
  // "Outros": não há arquivo ainda, usará fallback
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
  const [currentPath, setCurrentPath] = React.useState(0);
  const imageFile = bankImageFiles[bankName];
  const fallbackColor = bankFallbackColors[bankName] || "#6B7280";
  const initials = bankInitials[bankName] || "?";

  // Diferentes caminhos para tentar no Lovable
  const imagePaths = [
    `/bank-logos/${imageFile}`,
    `./bank-logos/${imageFile}`,
    `/public/bank-logos/${imageFile}`,
    `./public/bank-logos/${imageFile}`,
  ];

  const handleImageError = () => {
    if (currentPath < imagePaths.length - 1) {
      setCurrentPath(currentPath + 1);
    } else {
      setImageError(true);
    }
  };

  // Se não há arquivo de imagem mapeado ou houve erro em todos os caminhos, mostra fallback
  if (!imageFile || imageError) {
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

  // Tenta carregar a imagem
  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}
    >
      <img
        src={imagePaths[currentPath]}
        alt={`Logo ${bankName}`}
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={() => setImageError(false)}
      />
    </div>
  );
}
