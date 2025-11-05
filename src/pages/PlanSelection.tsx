import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Beef, Bird, Rabbit, Tractor, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PlanSelection = () => {
  const [user, setUser] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    // Load current plan if exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", session.user.id)
      .single();
    
    if (profile?.plan_type) {
      setSelectedPlan(profile.plan_type);
    }
  };

  const plans = [
    {
      id: "bovinos",
      name: "Plano Bovinos",
      description: "Gestão completa para criação de gado bovino",
      icon: Beef,
      features: [
        "Controle de bovinos",
        "Gestão de peso e genealogia",
        "Controle sanitário para bovinos",
        "Mapeamento de pastagens",
      ],
      color: "bg-primary/10 hover:bg-primary/20",
      iconColor: "text-primary",
    },
    {
      id: "suinos",
      name: "Plano Suínos",
      description: "Especializado em suinocultura",
      icon: Rabbit,
      features: [
        "Controle de suínos",
        "Gestão de lotes e peso",
        "Controle sanitário específico",
        "Mapeamento de instalações",
      ],
      color: "bg-secondary/10 hover:bg-secondary/20",
      iconColor: "text-secondary",
    },
    {
      id: "aves",
      name: "Plano Aves",
      description: "Gestão para avicultura",
      icon: Bird,
      features: [
        "Controle de aves",
        "Gestão de lotes",
        "Vacinação especializada",
        "Mapeamento de aviários",
      ],
      color: "bg-accent/10 hover:bg-accent/20",
      iconColor: "text-accent",
    },
    {
      id: "equinos",
      name: "Plano Equinos",
      description: "Para criadores de cavalos",
      icon: Beef,
      features: [
        "Controle de equinos",
        "Pedigree e genealogia",
        "Controle sanitário",
        "Gestão de haras",
      ],
      color: "bg-destructive/10 hover:bg-destructive/20",
      iconColor: "text-destructive",
    },
    {
      id: "caprinos",
      name: "Plano Caprinos",
      description: "Gestão de caprinos e ovinos",
      icon: Rabbit,
      features: [
        "Controle de caprinos/ovinos",
        "Gestão de rebanho",
        "Controle sanitário",
        "Mapeamento de áreas",
      ],
      color: "bg-primary/10 hover:bg-primary/20",
      iconColor: "text-primary",
    },
    {
      id: "completo",
      name: "Plano Completo",
      description: "Todas as espécies em um único plano",
      icon: Tractor,
      features: [
        "Todos os tipos de animais",
        "Gestão multi-espécie",
        "Controle sanitário completo",
        "Mapeamento ilimitado",
      ],
      color: "bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20",
      iconColor: "text-primary",
      badge: "Recomendado",
    },
  ];

  const handleSelectPlan = async () => {
    if (!selectedPlan) {
      toast({
        title: "Selecione um plano",
        description: "Por favor, escolha o tipo de produção da sua fazenda",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ plan_type: selectedPlan })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Erro ao salvar plano",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Plano atualizado!",
      description: "Suas preferências foram atualizadas com sucesso",
    });

    navigate("/dashboard");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Tractor className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {selectedPlan ? "Alterar Plano" : "Escolha o Tipo da Sua Produção"}
            </h1>
            <p className="text-xl text-muted-foreground">
              Selecione o plano ideal para o tipo de criação da sua fazenda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              
              return (
                <Card
                  key={plan.id}
                  className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-xl relative ${
                    plan.color
                  } ${isSelected ? "ring-2 ring-primary shadow-lg" : ""}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-card ${plan.iconColor}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    {isSelected && (
                      <div className="p-2 rounded-full bg-primary">
                        <Check className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>

                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button
              variant="hero"
              size="lg"
              onClick={handleSelectPlan}
              disabled={!selectedPlan || loading}
              className="w-full md:w-auto"
            >
              {loading ? "Salvando..." : "Continuar com Plano Selecionado"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;
