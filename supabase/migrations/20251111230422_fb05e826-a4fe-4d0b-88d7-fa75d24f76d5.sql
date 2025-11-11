-- Tabela de informações específicas de equinos
CREATE TABLE public.equine_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  pelagem TEXT,
  altura_metros NUMERIC,
  registro TEXT,
  pai TEXT,
  mae TEXT,
  finalidade TEXT, -- Esporte, Trabalho, Reprodução, Lazer
  nivel_treinamento TEXT,
  temperamento TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de treinamentos e competições
CREATE TABLE public.equine_training (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  data DATE NOT NULL,
  tipo TEXT NOT NULL, -- Treinamento, Competição, Avaliação
  modalidade TEXT, -- Adestramento, Salto, Corrida, etc
  instrutor TEXT,
  local TEXT,
  duracao_minutos INTEGER,
  desempenho TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.equine_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equine_training ENABLE ROW LEVEL SECURITY;

-- RLS Policies para equine_details
CREATE POLICY "Users can view their own equine details"
ON public.equine_details FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own equine details"
ON public.equine_details FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own equine details"
ON public.equine_details FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own equine details"
ON public.equine_details FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies para equine_training
CREATE POLICY "Users can view their own training records"
ON public.equine_training FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training records"
ON public.equine_training FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training records"
ON public.equine_training FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training records"
ON public.equine_training FOR DELETE
USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_equine_details_updated_at
BEFORE UPDATE ON public.equine_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equine_training_updated_at
BEFORE UPDATE ON public.equine_training
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();