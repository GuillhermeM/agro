-- Tabela de Custos de Produção
CREATE TABLE public.production_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  categoria TEXT NOT NULL, -- Mão de obra, Insumos, Maquinário, Outros
  tipo TEXT NOT NULL, -- Fertilizantes, Defensivos, Sementes, etc
  descricao TEXT,
  valor NUMERIC NOT NULL,
  quantidade NUMERIC,
  unidade TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Receitas
CREATE TABLE public.revenues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  cultura TEXT NOT NULL, -- Soja, Milho, Gado, etc
  quantidade NUMERIC NOT NULL,
  unidade TEXT NOT NULL,
  preco_unitario NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Produtividade
CREATE TABLE public.productivity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  cultura TEXT NOT NULL,
  area_hectares NUMERIC NOT NULL,
  producao NUMERIC NOT NULL,
  unidade TEXT NOT NULL,
  produtividade_por_ha NUMERIC GENERATED ALWAYS AS (producao / NULLIF(area_hectares, 0)) STORED,
  safra TEXT,
  talhao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.production_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity ENABLE ROW LEVEL SECURITY;

-- RLS Policies para production_costs
CREATE POLICY "Users can view their own costs"
ON public.production_costs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own costs"
ON public.production_costs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own costs"
ON public.production_costs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own costs"
ON public.production_costs FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies para revenues
CREATE POLICY "Users can view their own revenues"
ON public.revenues FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own revenues"
ON public.revenues FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenues"
ON public.revenues FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenues"
ON public.revenues FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies para productivity
CREATE POLICY "Users can view their own productivity"
ON public.productivity FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own productivity"
ON public.productivity FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own productivity"
ON public.productivity FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own productivity"
ON public.productivity FOR DELETE
USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_production_costs_updated_at
BEFORE UPDATE ON public.production_costs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revenues_updated_at
BEFORE UPDATE ON public.revenues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_productivity_updated_at
BEFORE UPDATE ON public.productivity
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();