import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertCircle, 
  ArrowLeft, 
  Plus, 
  Calendar,
  Syringe,
  ClipboardCheck,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface VaccineRecord {
  id: string;
  animalBrinco: string;
  vacina: string;
  data: string;
  proximaAplicacao: string;
  veterinario: string;
  observacoes: string;
}

const Health = () => {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<VaccineRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    animalBrinco: "",
    vacina: "",
    data: "",
    proximaAplicacao: "",
    veterinario: "",
    observacoes: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadHealthRecords();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has a plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", session.user.id)
      .single();

    if (!profile?.plan_type) {
      navigate("/plan-selection");
      return;
    }

    setUser(session.user);
  };

  const loadHealthRecords = async () => {
    const { data, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: false });

    if (error) {
      console.error("Error loading health records:", error);
      toast.error("Erro ao carregar registros");
      return;
    }

    setRecords(data.map(r => ({
      id: r.id,
      animalBrinco: r.animal_brinco,
      vacina: r.vacina,
      data: r.data,
      proximaAplicacao: r.proxima_aplicacao,
      veterinario: r.veterinario,
      observacoes: r.observacoes || "",
    })));
  };

  const upcomingVaccines = records
    .filter(r => new Date(r.proximaAplicacao) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(a.proximaAplicacao).getTime() - new Date(b.proximaAplicacao).getTime());

  const stats = [
    { label: "Vacinas Aplicadas", value: records.length.toString(), icon: Syringe, color: "text-primary" },
    { label: "Próximas 30 dias", value: upcomingVaccines.length.toString(), icon: Calendar, color: "text-secondary" },
    { label: "Alertas Ativos", value: upcomingVaccines.filter(v => new Date(v.proximaAplicacao) < new Date()).length.toString(), icon: Bell, color: "text-destructive" },
  ];

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from("health_records")
      .insert({
        user_id: user.id,
        animal_brinco: formData.animalBrinco,
        vacina: formData.vacina,
        data: formData.data,
        proxima_aplicacao: formData.proximaAplicacao,
        veterinario: formData.veterinario,
        observacoes: formData.observacoes,
      });

    if (error) {
      console.error("Error adding health record:", error);
      toast.error("Erro ao adicionar registro");
      return;
    }

    setFormData({ animalBrinco: "", vacina: "", data: "", proximaAplicacao: "", veterinario: "", observacoes: "" });
    setIsDialogOpen(false);
    toast.success("Registro de vacina adicionado!");
    loadHealthRecords();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Saúde Animal</h1>
                <p className="text-sm text-muted-foreground">Controle sanitário e vacinação</p>
              </div>
            </div>
            <Link to="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Upcoming Vaccines Alert */}
        {upcomingVaccines.length > 0 && (
          <Card className="p-6 mb-8 border-secondary bg-secondary/5">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-secondary mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Vacinas Próximas</h3>
                <div className="space-y-2">
                  {upcomingVaccines.map((vaccine) => (
                    <div key={vaccine.id} className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{vaccine.animalBrinco}</span>
                      {" - "}
                      {vaccine.vacina}
                      {" em "}
                      {new Date(vaccine.proximaAplicacao).toLocaleDateString('pt-BR')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vaccine Records */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Histórico de Vacinação
                </h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="hero" size="sm">
                      <Plus className="h-4 w-4" />
                      Nova Vacina
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Registrar Vacinação</DialogTitle>
                      <DialogDescription>
                        Preencha os dados da aplicação da vacina
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddRecord} className="space-y-4">
                      <div>
                        <Label htmlFor="animalBrinco">Animal (Brinco)</Label>
                        <Input
                          id="animalBrinco"
                          required
                          placeholder="Ex: BV-001"
                          value={formData.animalBrinco}
                          onChange={(e) => setFormData({ ...formData, animalBrinco: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="vacina">Vacina</Label>
                        <Select
                          value={formData.vacina}
                          onValueChange={(value) => setFormData({ ...formData, vacina: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a vacina" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Febre Aftosa">Febre Aftosa</SelectItem>
                            <SelectItem value="Brucelose">Brucelose</SelectItem>
                            <SelectItem value="Raiva">Raiva</SelectItem>
                            <SelectItem value="Peste Suína">Peste Suína</SelectItem>
                            <SelectItem value="Newcastle">Newcastle (Aves)</SelectItem>
                            <SelectItem value="Clostridioses">Clostridioses</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="data">Data de Aplicação</Label>
                        <Input
                          id="data"
                          type="date"
                          required
                          value={formData.data}
                          onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="proximaAplicacao">Próxima Aplicação</Label>
                        <Input
                          id="proximaAplicacao"
                          type="date"
                          required
                          value={formData.proximaAplicacao}
                          onChange={(e) => setFormData({ ...formData, proximaAplicacao: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="veterinario">Veterinário Responsável</Label>
                        <Input
                          id="veterinario"
                          required
                          placeholder="Nome do veterinário"
                          value={formData.veterinario}
                          onChange={(e) => setFormData({ ...formData, veterinario: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                          id="observacoes"
                          placeholder="Detalhes sobre a aplicação..."
                          value={formData.observacoes}
                          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" variant="hero" className="flex-1">
                          Registrar
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{record.vacina}</h3>
                        <p className="text-sm text-muted-foreground">Animal: {record.animalBrinco}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                        {new Date(record.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Veterinário: {record.veterinario}</p>
                      <p>Próxima dose: {new Date(record.proximaAplicacao).toLocaleDateString('pt-BR')}</p>
                      {record.observacoes && <p className="italic">"{record.observacoes}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Vaccine Plans */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Planos de Vacinação
              </h2>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg bg-muted/20">
                  <h3 className="font-semibold text-foreground mb-2">Bovinos</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Febre Aftosa - Semestral</li>
                    <li>• Brucelose - Anual</li>
                    <li>• Raiva - Anual</li>
                    <li>• Clostridioses - Anual</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded-lg bg-muted/20">
                  <h3 className="font-semibold text-foreground mb-2">Suínos</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Peste Suína - Semestral</li>
                    <li>• Clostridioses - Anual</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded-lg bg-muted/20">
                  <h3 className="font-semibold text-foreground mb-2">Aves</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Newcastle - Trimestral</li>
                    <li>• Gumboro - Anual</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Health;
