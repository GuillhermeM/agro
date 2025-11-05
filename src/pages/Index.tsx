import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Tractor, 
  MapPin, 
  TrendingUp, 
  Shield, 
  Users, 
  BarChart3,
  ArrowRight,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-farm.jpg";

const Index = () => {
  const features = [
    {
      icon: Tractor,
      title: "Gestão Completa de Rebanho",
      description: "Controle bovinos, suínos, caprinos e aves em um só lugar. Registro individual, lotes, peso, genealogia e muito mais.",
    },
    {
      icon: MapPin,
      title: "Mapeamento Georreferenciado",
      description: "Demarque áreas, talhões e perímetros com precisão. Cálculo automático de hectares e ferramentas de medição.",
    },
    {
      icon: Shield,
      title: "Controle Sanitário",
      description: "Gestão de vacinas, tratamentos e exames. Alertas automáticos para próximas aplicações e prazos de carência.",
    },
    {
      icon: BarChart3,
      title: "Relatórios e BI",
      description: "Dashboards completos com indicadores de produção, custo, lucro e performance por fazenda e lote.",
    },
    {
      icon: TrendingUp,
      title: "Gestão Financeira",
      description: "Controle de custos, receitas, fluxo de caixa e lucratividade. Análise por animal, lote ou fazenda.",
    },
    {
      icon: Users,
      title: "Multi-usuário",
      description: "Permissões por função: administrador, gestor, técnico e trabalhador de campo. Colaboração em tempo real.",
    },
  ];

  const benefits = [
    "Aumento de produtividade em até 30%",
    "Redução de custos operacionais",
    "Decisões baseadas em dados reais",
    "Conformidade com regulamentos sanitários",
    "Acesso de qualquer lugar, a qualquer hora",
    "Suporte técnico especializado",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tractor className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">AgroGestão</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/auth">
                <Button variant="hero">
                  Começar Agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Gestão Agropecuária
                <span className="text-primary"> Inteligente</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Sistema completo para gestão de suínos, caprinos, bovinos e aves. 
                Controle sanitário, mapeamento de áreas e relatórios em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    Teste Grátis por 14 dias
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Acessar Sistema
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Fazenda moderna com gestão tecnológica"
                className="relative rounded-3xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ferramentas completas para gestão moderna da sua propriedade rural
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                Por que escolher o AgroGestão?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Mais de 500 propriedades já otimizaram sua gestão com nossa plataforma.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Pronto para transformar sua gestão?
              </h3>
              <p className="text-muted-foreground mb-6">
                Comece hoje mesmo com 14 dias grátis. Sem compromisso, sem cartão de crédito.
              </p>
              <Link to="/auth">
                <Button variant="hero" size="lg" className="w-full">
                  Criar Conta Grátis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Junte-se a centenas de produtores satisfeitos
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Tractor className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">AgroGestão</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sistema completo de gestão agropecuária para propriedades modernas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Funcionalidades</li>
                <li>Preços</li>
                <li>Segurança</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Sobre</li>
                <li>Blog</li>
                <li>Contato</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 AgroGestão. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
