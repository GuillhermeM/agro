import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface FarmFormProps {
  farmData?: {
    id: string;
    name: string;
    size_hectares: number;
    cattle_count: number;
    coordinates: any;
    notes?: string;
  };
  coordinates: any;
  onSuccess: () => void;
}

const FarmForm = ({ farmData, coordinates, onSuccess }: FarmFormProps) => {
  const [name, setName] = useState(farmData?.name || "");
  const [sizeHectares, setSizeHectares] = useState(farmData?.size_hectares?.toString() || "");
  const [cattleCount, setCattleCount] = useState(farmData?.cattle_count?.toString() || "0");
  const [notes, setNotes] = useState(farmData?.notes || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  console.log("🔵 FarmForm renderizado com:", { farmData, coordinates });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🟢 Formulário submetido:", { name, sizeHectares, cattleCount, notes });

    if (!name || !sizeHectares) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("🟡 Usuário autenticado:", user?.id);
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado",
          variant: "destructive",
        });
        return;
      }

      const farmPayload = {
        user_id: user.id,
        name,
        size_hectares: parseFloat(sizeHectares),
        cattle_count: parseInt(cattleCount) || 0,
        coordinates: coordinates,
        notes: notes || null,
      };

      console.log("🟣 Payload da fazenda:", farmPayload);

      if (farmData?.id) {
        // Update existing farm
        console.log("🔵 Atualizando fazenda existente...");
        const { error } = await supabase
          .from("farms")
          .update(farmPayload)
          .eq("id", farmData.id);

        if (error) {
          console.error("❌ Erro ao atualizar:", error);
          throw error;
        }

        console.log("✅ Fazenda atualizada com sucesso!");
        toast({
          title: "Fazenda atualizada!",
          description: "As informações foram atualizadas com sucesso.",
        });
      } else {
        // Insert new farm
        console.log("🟢 Inserindo nova fazenda...");
        const { error } = await supabase
          .from("farms")
          .insert(farmPayload);

        if (error) {
          console.error("❌ Erro ao inserir:", error);
          throw error;
        }

        console.log("✅ Fazenda cadastrada com sucesso!");
        toast({
          title: "Fazenda cadastrada!",
          description: "Sua fazenda foi cadastrada com sucesso.",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar fazenda",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Fazenda *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Fazenda Santa Maria"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="size">Tamanho (hectares) *</Label>
        <Input
          id="size"
          type="number"
          step="0.01"
          value={sizeHectares}
          onChange={(e) => setSizeHectares(e.target.value)}
          placeholder="Ex: 150.5"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cattle">Quantidade de Gado</Label>
        <Input
          id="cattle"
          type="number"
          value={cattleCount}
          onChange={(e) => setCattleCount(e.target.value)}
          placeholder="Ex: 200"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Informações adicionais sobre a fazenda..."
          disabled={loading}
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          farmData ? "Atualizar Fazenda" : "Cadastrar Fazenda"
        )}
      </Button>
    </form>
  );
};

export default FarmForm;