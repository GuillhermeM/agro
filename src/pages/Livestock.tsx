import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Beef, 
  ArrowLeft, 
  Plus, 
  Search,
  Edit,
  Trash2,
  TrendingUp,
  Weight
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

interface Animal {
  id: string;
  brinco: string;
  especie: string;
  race?: string;
  lote: string;
  peso: number;
  data_nascimento: string;
  status: string;
}

const Livestock = () => {
  const [user, setUser] = useState<any>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    brinco: "",
    especie: "",
    race: "",
    lote: "",
    peso: "",
    dataNascimento: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadAnimals();
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
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Erro ao carregar animais");
      return;
    }

    setAnimals(data || []);
  };

  const stats = [
    { label: "Total de Animais", value: animals.length, icon: Beef },
    { label: "Peso Médio", value: `${(animals.reduce((sum, a) => sum + a.peso, 0) / animals.length).toFixed(1)} kg`, icon: Weight },
    { label: "Lotes Ativos", value: new Set(animals.map(a => a.lote)).size, icon: TrendingUp },
  ];

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.brinco.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.lote.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = selectedSpecies === "all" || animal.especie === selectedSpecies;
    return matchesSearch && matchesSpecies;
  });

  const handleAddAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('animals')
      .insert({
        user_id: user.id,
        brinco: formData.brinco,
        especie: formData.especie,
        race: formData.race || null,
        lote: formData.lote,
        peso: parseFloat(formData.peso),
        data_nascimento: formData.dataNascimento,
        status: "Ativo",
      });

    if (error) {
      toast.error("Erro ao cadastrar animal");
      return;
    }

    setFormData({ brinco: "", especie: "", race: "", lote: "", peso: "", dataNascimento: "" });
    setIsDialogOpen(false);
    toast.success("Animal cadastrado com sucesso!");
    loadAnimals();
  };

  const handleDeleteAnimal = async (id: string) => {
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erro ao remover animal");
      return;
    }

    toast.success("Animal removido com sucesso!");
    loadAnimals();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Beef className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestão de Rebanho</h1>
                <p className="text-sm text-muted-foreground">Controle de bovinos, suínos, equinos, caprinos e aves</p>
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
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters and Actions */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por brinco ou lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="species">Espécie</Label>
              <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Bovino">Bovino</SelectItem>
                  <SelectItem value="Suíno">Suíno</SelectItem>
                  <SelectItem value="Equino">Equino</SelectItem>
                  <SelectItem value="Caprino">Caprino</SelectItem>
                  <SelectItem value="Ave">Ave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="h-4 w-4" />
                  Novo Animal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Animal</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do animal para cadastro no sistema
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddAnimal} className="space-y-4">
                  <div>
                    <Label htmlFor="brinco">Número do Brinco/RFID</Label>
                    <Input
                      id="brinco"
                      required
                      value={formData.brinco}
                      onChange={(e) => setFormData({ ...formData, brinco: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="especie">Espécie</Label>
                    <Select
                      value={formData.especie}
                      onValueChange={(value) => setFormData({ ...formData, especie: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a espécie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bovino">Bovino</SelectItem>
                        <SelectItem value="Suíno">Suíno</SelectItem>
                        <SelectItem value="Equino">Equino</SelectItem>
                        <SelectItem value="Caprino">Caprino</SelectItem>
                        <SelectItem value="Ave">Ave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="race">Raça (Opcional)</Label>
                    {formData.especie === "Bovino" ? (
                      <Select
                        value={formData.race}
                        onValueChange={(value) => setFormData({ ...formData, race: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a raça" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nelore">Nelore</SelectItem>
                          <SelectItem value="Angus">Angus</SelectItem>
                          <SelectItem value="Brahman">Brahman</SelectItem>
                          <SelectItem value="Gir">Gir</SelectItem>
                          <SelectItem value="Guzerá">Guzerá</SelectItem>
                          <SelectItem value="Tabapuã">Tabapuã</SelectItem>
                          <SelectItem value="Indubrasil">Indubrasil</SelectItem>
                          <SelectItem value="Sindi">Sindi</SelectItem>
                          <SelectItem value="Canchim">Canchim</SelectItem>
                          <SelectItem value="Caracu">Caracu</SelectItem>
                          <SelectItem value="Simental">Simental</SelectItem>
                          <SelectItem value="Hereford">Hereford</SelectItem>
                          <SelectItem value="Senepol">Senepol</SelectItem>
                          <SelectItem value="Brangus">Brangus</SelectItem>
                          <SelectItem value="Braford">Braford</SelectItem>
                          <SelectItem value="Santa Gertrudis">Santa Gertrudis</SelectItem>
                          <SelectItem value="Girolando">Girolando</SelectItem>
                          <SelectItem value="Holandês">Holandês</SelectItem>
                          <SelectItem value="Jersey">Jersey</SelectItem>
                          <SelectItem value="Pardo-Suíço">Pardo-Suíço</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : formData.especie === "Suíno" ? (
                      <Select
                        value={formData.race}
                        onValueChange={(value) => setFormData({ ...formData, race: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a raça" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Duroc">Duroc</SelectItem>
                          <SelectItem value="Landrace">Landrace</SelectItem>
                          <SelectItem value="Large White">Large White</SelectItem>
                          <SelectItem value="Hampshire">Hampshire</SelectItem>
                          <SelectItem value="Pietrain">Pietrain</SelectItem>
                          <SelectItem value="Wessex">Wessex</SelectItem>
                          <SelectItem value="Piau">Piau</SelectItem>
                          <SelectItem value="Moura">Moura</SelectItem>
                          <SelectItem value="Caruncho">Caruncho</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : formData.especie === "Equino" ? (
                      <Select
                        value={formData.race}
                        onValueChange={(value) => setFormData({ ...formData, race: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a raça" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mangalarga Marchador">Mangalarga Marchador</SelectItem>
                          <SelectItem value="Mangalarga Paulista">Mangalarga Paulista</SelectItem>
                          <SelectItem value="Quarto de Milha">Quarto de Milha</SelectItem>
                          <SelectItem value="Crioulo">Crioulo</SelectItem>
                          <SelectItem value="Campolina">Campolina</SelectItem>
                          <SelectItem value="Brasileiro de Hipismo">Brasileiro de Hipismo (BH)</SelectItem>
                          <SelectItem value="Pantaneiro">Pantaneiro</SelectItem>
                          <SelectItem value="Lavradeiro">Lavradeiro</SelectItem>
                          <SelectItem value="Puro Sangue Inglês">Puro Sangue Inglês (PSI)</SelectItem>
                          <SelectItem value="Puro Sangue Árabe">Puro Sangue Árabe</SelectItem>
                          <SelectItem value="Appaloosa">Appaloosa</SelectItem>
                          <SelectItem value="Paint Horse">Paint Horse</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : formData.especie === "Ave" ? (
                      <Select
                        value={formData.race}
                        onValueChange={(value) => setFormData({ ...formData, race: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a raça" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Rhode Island Red">Rhode Island Red</SelectItem>
                          <SelectItem value="Leghorn">Leghorn</SelectItem>
                          <SelectItem value="Plymouth Rock">Plymouth Rock</SelectItem>
                          <SelectItem value="Sussex">Sussex</SelectItem>
                          <SelectItem value="Brahma">Brahma</SelectItem>
                          <SelectItem value="Orpington">Orpington</SelectItem>
                          <SelectItem value="Wyandotte">Wyandotte</SelectItem>
                          <SelectItem value="Cochin">Cochin</SelectItem>
                          <SelectItem value="New Hampshire">New Hampshire</SelectItem>
                          <SelectItem value="Australorp">Australorp</SelectItem>
                          <SelectItem value="Caipira">Caipira</SelectItem>
                          <SelectItem value="Garnisé">Garnisé</SelectItem>
                          <SelectItem value="Cobb">Cobb (Corte)</SelectItem>
                          <SelectItem value="Ross">Ross (Corte)</SelectItem>
                          <SelectItem value="Hubbard">Hubbard (Corte)</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : formData.especie === "Caprino" ? (
                      <Select
                        value={formData.race}
                        onValueChange={(value) => setFormData({ ...formData, race: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a raça" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Boer">Boer</SelectItem>
                          <SelectItem value="Anglo-Nubiana">Anglo-Nubiana</SelectItem>
                          <SelectItem value="Saanen">Saanen</SelectItem>
                          <SelectItem value="Parda Alpina">Parda Alpina</SelectItem>
                          <SelectItem value="Toggenburg">Toggenburg</SelectItem>
                          <SelectItem value="Murciana">Murciana</SelectItem>
                          <SelectItem value="Moxotó">Moxotó</SelectItem>
                          <SelectItem value="Canindé">Canindé</SelectItem>
                          <SelectItem value="Repartida">Repartida</SelectItem>
                          <SelectItem value="Marota">Marota</SelectItem>
                          <SelectItem value="Azul">Azul</SelectItem>
                          <SelectItem value="Nambi">Nambi</SelectItem>
                          <SelectItem value="Bhuj">Bhuj</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="race"
                        value={formData.race}
                        onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                        placeholder="Digite a raça"
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lote">Lote</Label>
                    <Input
                      id="lote"
                      required
                      value={formData.lote}
                      onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      required
                      value={formData.peso}
                      onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      required
                      value={formData.dataNascimento}
                      onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" variant="hero" className="flex-1">
                      Cadastrar
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Animals Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Brinco</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Espécie</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Raça</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Lote</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Peso (kg)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nascimento</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAnimals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{animal.brinco}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{animal.especie}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{animal.race || '-'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{animal.lote}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{animal.peso}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(animal.data_nascimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {animal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteAnimal(animal.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAnimals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum animal encontrado</p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Livestock;
