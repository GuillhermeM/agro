import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tractor, 
  Users, 
  MapPin, 
  TrendingUp, 
  AlertCircle,
  Beef,
  Bird,
  Rabbit,
  LogOut
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [totalAnimals, setTotalAnimals] = useState(0);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  };

  const loadDashboardData = async () => {
    // Load farms
    const { data: farmsData } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', user.id);
    
    if (farmsData) {
      // Load animals count for each farm
      const farmsWithAnimals = await Promise.all(
        farmsData.map(async (farm) => {
          const { count } = await supabase
            .from('animals')
            .select('*', { count: 'exact', head: true })
            .eq('farm_id', farm.id);
          
          return {
            ...farm,
            animals: count || 0
          };
        })
      );
      setFarms(farmsWithAnimals);
    }

    // Load total animals
    const { count: animalsCount } = await supabase
      .from('animals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    setTotalAnimals(animalsCount || 0);

    // Load health alerts (records from last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: alertsCount } = await supabase
      .from('health_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('data', sevenDaysAgo.toISOString());
    
    setTotalAlerts(alertsCount || 0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) {
    return null;
  }

  const stats = [
    { label: "Total de Animais", value: totalAnimals.toString(), icon: Beef, trend: "+12%", color: "text-primary" },
    { label: "Fazendas Ativas", value: farms.length.toString(), icon: MapPin, trend: "100%", color: "text-secondary" },
    { label: "Produtividade", value: "94%", icon: TrendingUp, trend: "+5%", color: "text-accent" },
    { label: "Alertas", value: totalAlerts.toString(), icon: AlertCircle, trend: "-2", color: "text-destructive" },
  ];

  const modules = [
    { 
      title: "Gestão de Rebanho", 
      description: "Controle de bovinos, suínos, caprinos e aves",
      icon: Beef,
      path: "/livestock",
      color: "bg-primary/10 text-primary"
    },
    { 
      title: "Mapeamento", 
      description: "Demarcar áreas, talhões e perímetros",
      icon: MapPin,
      path: "/mapping",
      color: "bg-accent/10 text-accent"
    },
    { 
      title: "Saúde Animal", 
      description: "Vacinas, tratamentos e controle sanitário",
      icon: AlertCircle,
      path: "/health",
      color: "bg-secondary/10 text-secondary"
    },
    { 
      title: "Gestão de Usuários", 
      description: "Equipe, permissões e colaboradores",
      icon: Users,
      path: "/users",
      color: "bg-primary/10 text-primary"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tractor className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">AgroGestão</h1>
                <p className="text-sm text-muted-foreground">Sistema de Gestão Agropecuária</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                    <p className={`text-sm font-medium ${stat.color}`}>{stat.trend}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Farms Overview */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Suas Fazendas
          </h2>
          {farms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {farms.map((farm) => (
                <div 
                  key={farm.id}
                  className="p-4 rounded-lg border border-border bg-gradient-to-br from-card to-muted/20 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-foreground mb-2">{farm.name}</h3>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Área: {farm.size_hectares} ha</span>
                    <span>{farm.animals} animais</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Nenhuma fazenda cadastrada ainda</p>
          )}
        </Card>

        {/* Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Módulos do Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.path} to={module.path}>
                  <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
