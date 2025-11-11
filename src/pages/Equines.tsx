import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Beef, Plus, Search, Calendar, Trophy, Activity, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Equine {
  id: string;
  brinco: string;
  race: string;
  peso: number;
  data_nascimento: string;
  lote: string;
  status: string;
  farm_id?: string;
  equine_details?: {
    pelagem?: string;
    altura_metros?: number;
    registro?: string;
    pai?: string;
    mae?: string;
    finalidade?: string;
    nivel_treinamento?: string;
    temperamento?: string;
  };
}

interface Training {
  id: string;
  data: string;
  tipo: string;
  modalidade?: string;
  instrutor?: string;
  local?: string;
  duracao_minutos?: number;
  desempenho?: string;
  observacoes?: string;
}

const Equines = () => {
  const [user, setUser] = useState<any>(null);
  const [equines, setEquines] = useState<Equine[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [selectedEquine, setSelectedEquine] = useState<Equine | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    brinco: "",
    race: "",
    peso: "",
    data_nascimento: "",
    lote: "",
    farmId: "",
    pelagem: "",
    altura_metros: "",
    registro: "",
    pai: "",
    mae: "",
    finalidade: "",
    nivel_treinamento: "",
    temperamento: "",
  });

  // Training form state
  const [trainingData, setTrainingData] = useState({
    data: new Date().toISOString().split('T')[0],
    tipo: "Treinamento",
    modalidade: "",
    instrutor: "",
    local: "",
    duracao_minutos: "",
    desempenho: "",
    observacoes: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadEquines();
      loadFarms();
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

  const loadFarms = async () => {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', user.id);
    
    if (!error && data) {
      setFarms(data);
    }
  };

  const loadEquines = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('animals')
      .select(`
        *,
        equine_details (*)
      `)
      .eq('user_id', user.id)
      .eq('especie', 'Equino')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading equines:', error);
      toast.error('Erro ao carregar equinos');
    } else if (data) {
      setEquines(data as any);
    }
    setLoading(false);
  };

  const loadTrainings = async (animalId: string) => {
    const { data, error } = await supabase
      .from('equine_training')
      .select('*')
      .eq('animal_id', animalId)
      .order('data', { ascending: false });

    if (!error && data) {
      setTrainings(data);
    }
  };

  const handleAddEquine = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brinco || !formData.race || !formData.peso || !formData.data_nascimento) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Insert animal
    const { data: animalData, error: animalError } = await supabase
      .from('animals')
      .insert({
        user_id: user.id,
        farm_id: formData.farmId && formData.farmId !== 'none' ? formData.farmId : null,
        brinco: formData.brinco,
        especie: 'Equino',
        race: formData.race,
        peso: parseFloat(formData.peso),
        data_nascimento: formData.data_nascimento,
        lote: formData.lote || 'Geral',
        status: 'Ativo',
      })
      .select()
      .single();

    if (animalError) {
      toast.error("Erro ao cadastrar equino");
      console.error(animalError);
      return;
    }

    // Insert equine details
    if (animalData) {
      const { error: detailsError } = await supabase
        .from('equine_details')
        .insert({
          animal_id: animalData.id,
          user_id: user.id,
          pelagem: formData.pelagem || null,
          altura_metros: formData.altura_metros ? parseFloat(formData.altura_metros) : null,
          registro: formData.registro || null,
          pai: formData.pai || null,
          mae: formData.mae || null,
          finalidade: formData.finalidade || null,
          nivel_treinamento: formData.nivel_treinamento || null,
          temperamento: formData.temperamento || null,
        });

      if (detailsError) {
        console.error("Error inserting equine details:", detailsError);
      }
    }

    toast.success("Equino cadastrado com sucesso!");
    setDialogOpen(false);
    resetForm();
    loadEquines();
  };

  const handleAddTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEquine || !trainingData.tipo) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const { error } = await supabase
      .from('equine_training')
      .insert({
        animal_id: selectedEquine.id,
        user_id: user.id,
        data: trainingData.data,
        tipo: trainingData.tipo,
        modalidade: trainingData.modalidade || null,
        instrutor: trainingData.instrutor || null,
        local: trainingData.local || null,
        duracao_minutos: trainingData.duracao_minutos ? parseInt(trainingData.duracao_minutos) : null,
        desempenho: trainingData.desempenho || null,
        observacoes: trainingData.observacoes || null,
      });

    if (error) {
      toast.error("Erro ao registrar atividade");
      console.error(error);
      return;
    }

    toast.success("Atividade registrada com sucesso!");
    setTrainingDialogOpen(false);
    resetTrainingForm();
    if (selectedEquine) {
      loadTrainings(selectedEquine.id);
    }
  };

  const handleDeleteEquine = async (id: string) => {
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erro ao deletar equino");
      return;
    }

    toast.success("Equino deletado com sucesso!");
    loadEquines();
  };

  const resetForm = () => {
    setFormData({
      brinco: "",
      race: "",
      peso: "",
      data_nascimento: "",
      lote: "",
      farmId: "",
      pelagem: "",
      altura_metros: "",
      registro: "",
      pai: "",
      mae: "",
      finalidade: "",
      nivel_treinamento: "",
      temperamento: "",
    });
  };

  const resetTrainingForm = () => {
    setTrainingData({
      data: new Date().toISOString().split('T')[0],
      tipo: "Treinamento",
      modalidade: "",
      instrutor: "",
      local: "",
      duracao_minutos: "",
      desempenho: "",
      observacoes: "",
    });
  };

  const filteredEquines = equines.filter(equine => 
    equine.brinco.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equine.race?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <Beef className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Beef className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestão de Equinos</h1>
                <p className="text-sm text-muted-foreground">Controle completo do seu plantel</p>
              </div>
            </div>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por brinco ou raça..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Equino
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto z-[9999]">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Equino</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddEquine} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brinco">Brinco / Identificação *</Label>
                    <Input
                      id="brinco"
                      value={formData.brinco}
                      onChange={(e) => setFormData({...formData, brinco: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="race">Raça *</Label>
                    <Input
                      id="race"
                      value={formData.race}
                      onChange={(e) => setFormData({...formData, race: e.target.value})}
                      placeholder="Ex: Mangalarga, Quarto de Milha"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="peso">Peso (kg) *</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.01"
                      value={formData.peso}
                      onChange={(e) => setFormData({...formData, peso: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pelagem">Pelagem</Label>
                    <Input
                      id="pelagem"
                      value={formData.pelagem}
                      onChange={(e) => setFormData({...formData, pelagem: e.target.value})}
                      placeholder="Ex: Alazão, Tordilho"
                    />
                  </div>
                  <div>
                    <Label htmlFor="altura_metros">Altura (metros)</Label>
                    <Input
                      id="altura_metros"
                      type="number"
                      step="0.01"
                      value={formData.altura_metros}
                      onChange={(e) => setFormData({...formData, altura_metros: e.target.value})}
                      placeholder="Ex: 1.55"
                    />
                  </div>
                  <div>
                    <Label htmlFor="registro">Registro</Label>
                    <Input
                      id="registro"
                      value={formData.registro}
                      onChange={(e) => setFormData({...formData, registro: e.target.value})}
                      placeholder="Número de registro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="farm">Fazenda</Label>
                    <Select value={formData.farmId} onValueChange={(value) => setFormData({...formData, farmId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a fazenda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem fazenda</SelectItem>
                        {farms.map((farm) => (
                          <SelectItem key={farm.id} value={farm.id}>
                            {farm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pai">Pai</Label>
                    <Input
                      id="pai"
                      value={formData.pai}
                      onChange={(e) => setFormData({...formData, pai: e.target.value})}
                      placeholder="Nome do pai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mae">Mãe</Label>
                    <Input
                      id="mae"
                      value={formData.mae}
                      onChange={(e) => setFormData({...formData, mae: e.target.value})}
                      placeholder="Nome da mãe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="finalidade">Finalidade</Label>
                    <Select value={formData.finalidade} onValueChange={(value) => setFormData({...formData, finalidade: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Esporte">Esporte</SelectItem>
                        <SelectItem value="Trabalho">Trabalho</SelectItem>
                        <SelectItem value="Reprodução">Reprodução</SelectItem>
                        <SelectItem value="Lazer">Lazer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nivel_treinamento">Nível de Treinamento</Label>
                    <Select value={formData.nivel_treinamento} onValueChange={(value) => setFormData({...formData, nivel_treinamento: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Iniciante">Iniciante</SelectItem>
                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                        <SelectItem value="Avançado">Avançado</SelectItem>
                        <SelectItem value="Profissional">Profissional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="temperamento">Temperamento</Label>
                    <Input
                      id="temperamento"
                      value={formData.temperamento}
                      onChange={(e) => setFormData({...formData, temperamento: e.target.value})}
                      placeholder="Ex: Dócil, Ativo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lote">Lote</Label>
                    <Input
                      id="lote"
                      value={formData.lote}
                      onChange={(e) => setFormData({...formData, lote: e.target.value})}
                      placeholder="Ex: Reprodução 2024"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Cadastrar Equino
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Equines List */}
        {filteredEquines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquines.map((equine) => (
              <Card key={equine.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Beef className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{equine.brinco}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEquine(equine.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Badge variant="default">{equine.race}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Idade</p>
                      <p className="font-medium">{calculateAge(equine.data_nascimento)} anos</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Peso</p>
                      <p className="font-medium">{equine.peso} kg</p>
                    </div>
                    {equine.equine_details?.[0]?.pelagem && (
                      <div>
                        <p className="text-muted-foreground">Pelagem</p>
                        <p className="font-medium">{equine.equine_details[0].pelagem}</p>
                      </div>
                    )}
                    {equine.equine_details?.[0]?.altura_metros && (
                      <div>
                        <p className="text-muted-foreground">Altura</p>
                        <p className="font-medium">{equine.equine_details[0].altura_metros}m</p>
                      </div>
                    )}
                    {equine.equine_details?.[0]?.finalidade && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Finalidade</p>
                        <p className="font-medium">{equine.equine_details[0].finalidade}</p>
                      </div>
                    )}
                    {equine.equine_details?.[0]?.nivel_treinamento && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Nível</p>
                        <Badge variant="outline">{equine.equine_details[0].nivel_treinamento}</Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-3 border-t flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedEquine(equine);
                        loadTrainings(equine.id);
                        setTrainingDialogOpen(true);
                      }}
                    >
                      <Trophy className="h-4 w-4 mr-1" />
                      Treinos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Beef className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Nenhum equino encontrado" : "Nenhum equino cadastrado ainda"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Equino
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Training Dialog */}
      <Dialog open={trainingDialogOpen} onOpenChange={setTrainingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[9999]">
          <DialogHeader>
            <DialogTitle>
              Treinos e Competições - {selectedEquine?.brinco}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddTraining} className="space-y-4 border-b pb-4">
            <h3 className="font-semibold">Registrar Nova Atividade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={trainingData.data}
                  onChange={(e) => setTrainingData({...trainingData, data: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={trainingData.tipo} onValueChange={(value) => setTrainingData({...trainingData, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Treinamento">Treinamento</SelectItem>
                    <SelectItem value="Competição">Competição</SelectItem>
                    <SelectItem value="Avaliação">Avaliação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="modalidade">Modalidade</Label>
                <Input
                  id="modalidade"
                  value={trainingData.modalidade}
                  onChange={(e) => setTrainingData({...trainingData, modalidade: e.target.value})}
                  placeholder="Ex: Adestramento, Salto"
                />
              </div>
              <div>
                <Label htmlFor="instrutor">Instrutor</Label>
                <Input
                  id="instrutor"
                  value={trainingData.instrutor}
                  onChange={(e) => setTrainingData({...trainingData, instrutor: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={trainingData.local}
                  onChange={(e) => setTrainingData({...trainingData, local: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="duracao">Duração (minutos)</Label>
                <Input
                  id="duracao"
                  type="number"
                  value={trainingData.duracao_minutos}
                  onChange={(e) => setTrainingData({...trainingData, duracao_minutos: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="desempenho">Desempenho</Label>
                <Input
                  id="desempenho"
                  value={trainingData.desempenho}
                  onChange={(e) => setTrainingData({...trainingData, desempenho: e.target.value})}
                  placeholder="Ex: Excelente, Médio, Precisa melhorar"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={trainingData.observacoes}
                  onChange={(e) => setTrainingData({...trainingData, observacoes: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Registrar Atividade
            </Button>
          </form>

          <div className="space-y-4">
            <h3 className="font-semibold">Histórico de Atividades</h3>
            {trainings.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {trainings.map((training) => (
                  <div key={training.id} className="p-3 border rounded-lg bg-muted/20">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {training.tipo === 'Competição' ? (
                          <Trophy className="h-4 w-4 text-primary" />
                        ) : (
                          <Activity className="h-4 w-4 text-accent" />
                        )}
                        <span className="font-medium">{training.tipo}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(training.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {training.modalidade && (
                      <p className="text-sm text-muted-foreground">
                        Modalidade: {training.modalidade}
                      </p>
                    )}
                    {training.instrutor && (
                      <p className="text-sm text-muted-foreground">
                        Instrutor: {training.instrutor}
                      </p>
                    )}
                    {training.desempenho && (
                      <p className="text-sm">
                        Desempenho: <Badge variant="outline">{training.desempenho}</Badge>
                      </p>
                    )}
                    {training.observacoes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {training.observacoes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma atividade registrada ainda
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Equines;
