import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tractor, 
  Users, 
  MapPin, 
  TrendingUp, 
  AlertCircle,
  Beef,
  Activity,
  Calendar,
  DollarSign,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  TrendingDown,
  Percent
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import type { Farm, Animal, HealthRecord, ProductionCost, Revenue, Productivity } from "@/lib/database.types";
import { toast } from "sonner";
import DashboardFilters from "@/components/DashboardFilters";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [recentHealthRecords, setRecentHealthRecords] = useState<HealthRecord[]>([]);
  const [costs, setCosts] = useState<ProductionCost[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [productivity, setProductivity] = useState<Productivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Recarregar dados quando a página ficar visível novamente
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        loadDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
    setLoading(true);
    try {
      // Load farms
      const { data: farmsData, error: farmsError } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (farmsError) {
        console.error('Error loading farms:', farmsError);
        toast.error('Erro ao carregar fazendas');
      } else if (farmsData) {
        setFarms(farmsData);
      }

      // Load all animals
      const { data: animalsData, error: animalsError } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (animalsError) {
        console.error('Error loading animals:', animalsError);
        toast.error('Erro ao carregar animais');
      } else if (animalsData) {
        setAnimals(animalsData);
      }

      // Load health records
      const { data: healthData, error: healthError } = await supabase
        .from('health_records')
        .select('*, animals(brinco, especie)')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .limit(10);
      
      if (healthError) {
        console.error('Error loading health records:', healthError);
      } else if (healthData) {
        setRecentHealthRecords(healthData);
      }

      // Load production costs
      const { data: costsData, error: costsError } = await supabase
        .from('production_costs')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });
      
      if (!costsError && costsData) {
        setCosts(costsData);
      }

      // Load revenues
      const { data: revenuesData, error: revenuesError} = await supabase
        .from('revenues')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });
      
      if (!revenuesError && revenuesData) {
        setRevenues(revenuesData);
      }

      // Load productivity
      const { data: productivityData, error: productivityError } = await supabase
        .from('productivity')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });
      
      if (!productivityError && productivityData) {
        setProductivity(productivityData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  // Filter data based on selected filters
  const filterDataByDate = (data: any[]) => {
    return data.filter(item => {
      const itemDate = new Date(item.data);
      const itemYear = itemDate.getFullYear().toString();
      const itemMonth = (itemDate.getMonth() + 1).toString();
      
      const yearMatch = selectedYear === "all" || itemYear === selectedYear;
      const monthMatch = selectedMonth === "all" || itemMonth === selectedMonth;
      const farmMatch = selectedFarm === "all" || item.farm_id === selectedFarm;
      
      return yearMatch && monthMatch && farmMatch;
    });
  };

  const filteredCosts = filterDataByDate(costs);
  const filteredRevenues = filterDataByDate(revenues);
  const filteredProductivity = filterDataByDate(productivity);

  // Calculate Financial KPIs
  const totalCost = filteredCosts.reduce((sum, cost) => sum + Number(cost.valor), 0);
  const totalRevenue = filteredRevenues.reduce((sum, rev) => sum + Number(rev.valor_total), 0);
  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Average productivity per hectare
  const avgProductivity = filteredProductivity.length > 0
    ? filteredProductivity.reduce((sum, p) => sum + Number(p.produtividade_por_ha || 0), 0) / filteredProductivity.length
    : 0;

  // Cost distribution by category
  const costByCategory = filteredCosts.reduce((acc: any, cost) => {
    acc[cost.categoria] = (acc[cost.categoria] || 0) + Number(cost.valor);
    return acc;
  }, {});

  const costDistributionData = Object.entries(costByCategory).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  // Revenue vs Cost by culture/month
  const revenueVsCostData: any[] = [];
  const cultureMap = new Map();

  filteredRevenues.forEach(rev => {
    if (!cultureMap.has(rev.cultura)) {
      cultureMap.set(rev.cultura, { cultura: rev.cultura, receita: 0, custo: 0 });
    }
    const entry = cultureMap.get(rev.cultura);
    entry.receita += Number(rev.valor_total);
  });

  filteredCosts.forEach(cost => {
    const cultura = cost.tipo || 'Outros';
    if (!cultureMap.has(cultura)) {
      cultureMap.set(cultura, { cultura, receita: 0, custo: 0 });
    }
    const entry = cultureMap.get(cultura);
    entry.custo += Number(cost.valor);
  });

  cultureMap.forEach(value => revenueVsCostData.push(value));

  // Productivity over time (line chart)
  const productivityOverTime = filteredProductivity
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .map(p => ({
      data: new Date(p.data).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      produtividade: Number(p.produtividade_por_ha || 0),
      cultura: p.cultura,
    }));

  // Group by month for line chart
  const productivityByMonth: any = {};
  productivityOverTime.forEach(p => {
    if (!productivityByMonth[p.data]) {
      productivityByMonth[p.data] = { data: p.data, produtividade: 0, count: 0 };
    }
    productivityByMonth[p.data].produtividade += p.produtividade;
    productivityByMonth[p.data].count += 1;
  });

  const productivityChartData = Object.values(productivityByMonth).map((item: any) => ({
    data: item.data,
    produtividade: (item.produtividade / item.count).toFixed(2),
  }));

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <Tractor className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalAnimals = animals.length;
  const activeAnimals = animals.filter(a => a.status === 'Ativo').length;
  const totalFarms = farms.length;
  const totalHectares = farms.reduce((sum, farm) => sum + Number(farm.size_hectares), 0);
  
  // Get alerts from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentAlerts = recentHealthRecords.filter(
    record => new Date(record.data) >= sevenDaysAgo
  ).length;

  // Get last month's alerts for comparison
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const lastMonthAlerts = recentHealthRecords.filter(
    record => new Date(record.data) >= thirtyDaysAgo && new Date(record.data) < sevenDaysAgo
  ).length;
  const alertTrend = lastMonthAlerts > 0 ? ((recentAlerts - lastMonthAlerts) / lastMonthAlerts * 100).toFixed(0) : "0";

  // Animals by species
  const speciesCount = animals.reduce((acc: any, animal) => {
    acc[animal.especie] = (acc[animal.especie] || 0) + 1;
    return acc;
  }, {});

  const speciesData = Object.entries(speciesCount).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(142 50% 40%)', 'hsl(40 70% 50%)'];

  // Financial KPIs stats
  const financialStats = [
    { 
      label: "Receita Total", 
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: DollarSign, 
      subtext: "período selecionado",
      trend: totalRevenue > 0 ? "+100%" : "0%",
      trendUp: true,
      color: "text-primary" 
    },
    { 
      label: "Custo Total", 
      value: `R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: TrendingDown, 
      subtext: "investimento total",
      trend: "-100%",
      trendUp: false,
      color: "text-destructive" 
    },
    { 
      label: "Lucro Líquido", 
      value: `R$ ${netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: TrendingUp, 
      subtext: "margem de lucro",
      trend: `${profitMargin.toFixed(1)}%`,
      trendUp: netProfit >= 0,
      color: netProfit >= 0 ? "text-primary" : "text-destructive"
    },
    { 
      label: "Produtividade Média", 
      value: avgProductivity.toFixed(2), 
      icon: Activity, 
      subtext: "por hectare",
      trend: avgProductivity > 0 ? "+100%" : "0%",
      trendUp: true,
      color: "text-accent" 
    },
  ];

  const stats = [
    { 
      label: "Total de Animais", 
      value: totalAnimals.toString(), 
      icon: Beef, 
      subtext: `${activeAnimals} ativos`,
      trend: totalAnimals > 0 ? "+100%" : "0%",
      trendUp: true,
      color: "text-primary" 
    },
    { 
      label: "Fazendas Ativas", 
      value: totalFarms.toString(), 
      icon: MapPin, 
      subtext: `${totalHectares.toFixed(1)} hectares`,
      trend: "100%",
      trendUp: true,
      color: "text-secondary" 
    },
    { 
      label: "Registros de Saúde", 
      value: recentHealthRecords.length.toString(), 
      icon: Activity, 
      subtext: "últimos 30 dias",
      trend: recentHealthRecords.length > 0 ? "+100%" : "0%",
      trendUp: true,
      color: "text-accent" 
    },
    { 
      label: "Margem de Lucro", 
      value: `${profitMargin.toFixed(1)}%`, 
      icon: Percent, 
      subtext: "rentabilidade",
      trend: profitMargin > 0 ? `+${profitMargin.toFixed(1)}%` : "0%",
      trendUp: profitMargin >= 0,
      color: profitMargin >= 0 ? "text-primary" : "text-destructive"
    },
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
      title: "Gestão de Equinos", 
      description: "Controle completo de cavalos e éguas",
      icon: Activity,
      path: "/equines",
      color: "bg-secondary/10 text-secondary"
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={loadDashboardData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trendUp ? ArrowUpRight : ArrowDownRight;
            return (
              <Card key={stat.label} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <Badge variant={stat.trendUp ? "default" : "destructive"} className="gap-1">
                      <TrendIcon className="h-3 w-3" />
                      {stat.trend}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                    <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <DashboardFilters
          farms={farms}
          selectedFarm={selectedFarm}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onFarmChange={setSelectedFarm}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
        />

        {/* Financial KPIs */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Indicadores Financeiros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financialStats.map((stat) => {
              const Icon = stat.icon;
              const TrendIcon = stat.trendUp ? ArrowUpRight : ArrowDownRight;
              return (
                <Card key={stat.label} className="hover:shadow-lg transition-all duration-300 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <Badge variant={stat.trendUp ? "default" : "destructive"} className="gap-1">
                        <TrendIcon className="h-3 w-3" />
                        {stat.trend}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                      <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Financial Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Cost by Culture */}
          {revenueVsCostData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  Receita x Custo por Cultura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueVsCostData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="cultura" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="receita" fill="hsl(var(--primary))" name="Receita" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="custo" fill="hsl(var(--destructive))" name="Custo" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost Distribution */}
          {costDistributionData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Distribuição de Custos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {costDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {costDistributionData.map((cost: any, index) => (
                    <div key={cost.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {cost.name}: <span className="font-medium text-foreground">
                          R$ {Number(cost.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Productivity Over Time */}
        {productivityChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Produtividade ao Longo do Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productivityChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="data" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="produtividade" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="Produtividade (kg/ha)"
                      dot={{ fill: 'hsl(var(--primary))', r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2 columns wide */}
          <div className="lg:col-span-2 space-y-6">
            {/* Farms Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Suas Fazendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {farms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {farms.map((farm) => {
                      const farmAnimals = animals.filter(a => a.farm_id === farm.id);
                      const farmAnimalsCount = farmAnimals.length;
                      
                      return (
                        <Link key={farm.id} to="/mapping">
                          <div className="p-4 rounded-lg border border-border bg-gradient-to-br from-card to-muted/20 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-foreground">{farm.name}</h3>
                              {farmAnimalsCount > 0 && (
                                <Badge variant="default" className="ml-2">
                                  {farmAnimalsCount} {farmAnimalsCount === 1 ? 'animal' : 'animais'}
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Área:</span>
                                <span className="font-medium">{Number(farm.size_hectares).toFixed(1)} ha</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Animais:</span>
                                <span className={`font-medium ${farmAnimalsCount > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                  {farmAnimalsCount}
                                </span>
                              </div>
                              {farmAnimals.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {Object.entries(
                                    farmAnimals.reduce((acc: any, animal) => {
                                      acc[animal.especie] = (acc[animal.especie] || 0) + 1;
                                      return acc;
                                    }, {})
                                  ).map(([especie, count]) => (
                                    <Badge key={especie} variant="outline" className="text-xs">
                                      {especie}: {String(count)}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            {farm.notes && (
                              <p className="text-xs text-muted-foreground mt-3 line-clamp-2 pt-2 border-t border-border/50">
                                {farm.notes}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground mb-4">Nenhuma fazenda cadastrada ainda</p>
                    <Link to="/mapping">
                      <Button>Adicionar Fazenda</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Animals by Species Chart */}
            {speciesData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beef className="h-5 w-5 text-primary" />
                    Distribuição por Espécie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={speciesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {speciesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {speciesData.map((species: any, index) => (
                      <div key={species.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {species.name}: <span className="font-medium text-foreground">{species.value}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Recent Activities */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentHealthRecords.length > 0 ? (
                  <div className="space-y-4">
                    {recentHealthRecords.slice(0, 8).map((record) => (
                      <div key={record.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground mb-1">{record.tipo}</p>
                          {record.animals && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {record.animals.especie} - Brinco: {record.animals.brinco}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(record.data).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link to="/health">
                      <Button variant="outline" className="w-full">Ver Todos</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground mb-4">Nenhum registro de saúde ainda</p>
                    <Link to="/health">
                      <Button>Adicionar Registro</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

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
