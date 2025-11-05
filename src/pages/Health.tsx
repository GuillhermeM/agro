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
import type { HealthRecord as HealthRecordType, Animal } from "@/lib/database.types";

interface HealthRecordWithAnimal extends HealthRecordType {
  animalBrinco?: string;
}

const Health = () => {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<HealthRecordWithAnimal[]>([]);
  const [animals, setAnimals] = useState<Pick<Animal, 'id' | 'brinco'>[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    animal_id: "",
    tipo: "",
    descricao: "",
    data: "",
    veterinario: "",
    custo: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadAnimals();
      loadRecords();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
  };

  const loadAnimals = async () => {
    const { data, error } = await supabase
      .from('animals')
      .select('id, brinco')
      .eq('user_id', user.id);

    if (error) {
      console.error("Erro ao carregar animais:", error);
      return;
    }

    setAnimals(data || []);
  };

  const loadRecords = async () => {
    const { data, error } = await supabase
      .from('health_records')
      .select(`
        *,
        animals (brinco)
      `)
      .eq('user_id', user.id)
      .order('data', { ascending: false });

    if (error) {
      toast.error("Erro ao carregar registros");
      return;
    }

    const formattedRecords = data?.map(record => {
      const { animals, ...rest } = record as any;
      return {
        ...rest,
        animalBrinco: animals?.brinco || 'N/A'
      } as HealthRecordWithAnimal;
    }) || [];

    setRecords(formattedRecords);
  };

  const stats = [
    { label: "Registros de Saúde", value: records.length, icon: Syringe, color: "text-primary" },
    { label: "Animais Monitorados", value: animals.length, icon: Calendar, color: "text-secondary" },
    { label: "Este Mês", value: records.filter(r => {
      const recordDate = new Date(r.data);
      const now = new Date();
      return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
    }).length, icon: Bell, color: "text-destructive" },
  ];

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('health_records')
      .insert({
        user_id: user.id,
        animal_id: formData.animal_id,
        tipo: formData.tipo,
        descricao: formData.descricao || null,
        data: formData.data,
        veterinario: formData.veterinario || null,
        custo: formData.custo ? parseFloat(formData.custo) : null,
      });

    if (error) {
      toast.error("Erro ao cadastrar registro");
      return;
    }

    setFormData({ animal_id: "", tipo: "", descricao: "", data: "", veterinario: "", custo: "" });
    setIsDialogOpen(false);
    toast.success("Registro de saúde adicionado!");
    loadRecords();
  };

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
        {records.length > 0 && (
          <Card className="p-6 mb-8 border-secondary bg-secondary/5">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-secondary mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Registros Recentes</h3>
                <div className="space-y-2">
                  {records.slice(0, 3).map((record) => (
                    <div key={record.id} className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{record.animalBrinco}</span>
                      {" - "}
                      {record.tipo}
                      {" em "}
                      {new Date(record.data).toLocaleDateString('pt-BR')}
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
                  Histórico de Saúde Animal
                </h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="hero" size="sm">
                      <Plus className="h-4 w-4" />
                      Novo Registro
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Registrar Evento de Saúde</DialogTitle>
                      <DialogDescription>
                        Registre vacinas, tratamentos ou outros eventos de saúde animal
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddRecord} className="space-y-4">
                      <div>
                        <Label htmlFor="animal_id">Animal</Label>
                        <Select
                          value={formData.animal_id}
                          onValueChange={(value) => setFormData({ ...formData, animal_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o animal" />
                          </SelectTrigger>
                          <SelectContent>
                            {animals.map((animal) => (
                              <SelectItem key={animal.id} value={animal.id}>
                                {animal.brinco}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="tipo">Tipo de Evento</Label>
                        <Select
                          value={formData.tipo}
                          onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Vacina">Vacina</SelectItem>
                            <SelectItem value="Tratamento">Tratamento</SelectItem>
                            <SelectItem value="Exame">Exame</SelectItem>
                            <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                            <SelectItem value="Medicação">Medicação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          placeholder="Detalhes sobre o procedimento..."
                          value={formData.descricao}
                          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="data">Data</Label>
                        <Input
                          id="data"
                          type="date"
                          required
                          value={formData.data}
                          onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="veterinario">Veterinário Responsável</Label>
                        <Input
                          id="veterinario"
                          placeholder="Nome do veterinário"
                          value={formData.veterinario}
                          onChange={(e) => setFormData({ ...formData, veterinario: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="custo">Custo (R$)</Label>
                        <Input
                          id="custo"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.custo}
                          onChange={(e) => setFormData({ ...formData, custo: e.target.value })}
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
                {records.length > 0 ? (
                  records.map((record) => (
                    <div key={record.id} className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{record.tipo}</h3>
                          <p className="text-sm text-muted-foreground">Animal: {record.animalBrinco}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                          {new Date(record.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {record.veterinario && <p>Veterinário: {record.veterinario}</p>}
                        {record.custo && <p>Custo: R$ {record.custo.toFixed(2)}</p>}
                        {record.descricao && <p className="italic">"{record.descricao}"</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">Nenhum registro de saúde ainda</p>
                )}
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
