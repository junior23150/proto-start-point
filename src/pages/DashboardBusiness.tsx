import { useAuth } from "@/contexts/AuthContext";

export default function DashboardBusiness() {
  const { profile } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Dashboard - Meu Negócio</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao dashboard empresarial, {profile?.full_name || 'usuário'}!
        </p>
        <div className="mt-8 p-8 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
          <p className="text-muted-foreground">
            Este dashboard estará disponível em breve com funcionalidades específicas para empresas.
          </p>
        </div>
      </div>
    </div>
  );
}