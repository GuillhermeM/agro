-- Criar tabela de animais (livestock)
CREATE TABLE public.animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  brinco text NOT NULL,
  especie text NOT NULL,
  lote text NOT NULL,
  peso numeric NOT NULL,
  data_nascimento date NOT NULL,
  status text NOT NULL DEFAULT 'Ativo',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on animals
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

-- Animals policies
CREATE POLICY "Users can view their own animals"
  ON public.animals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own animals"
  ON public.animals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own animals"
  ON public.animals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own animals"
  ON public.animals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Criar tabela de registros de saúde (health records)
CREATE TABLE public.health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  animal_brinco text NOT NULL,
  vacina text NOT NULL,
  data date NOT NULL,
  proxima_aplicacao date NOT NULL,
  veterinario text NOT NULL,
  observacoes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on health_records
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

-- Health records policies
CREATE POLICY "Users can view their own health records"
  ON public.health_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health records"
  ON public.health_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health records"
  ON public.health_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health records"
  ON public.health_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Criar tabela de membros da equipe (farm team members)
CREATE TABLE public.farm_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  email text NOT NULL,
  funcao text NOT NULL,
  fazenda text NOT NULL,
  status text NOT NULL DEFAULT 'Ativo',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on farm_members
ALTER TABLE public.farm_members ENABLE ROW LEVEL SECURITY;

-- Farm members policies
CREATE POLICY "Users can view their own farm members"
  ON public.farm_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farm members"
  ON public.farm_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farm members"
  ON public.farm_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farm members"
  ON public.farm_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_animals_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON public.health_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farm_members_updated_at
  BEFORE UPDATE ON public.farm_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();