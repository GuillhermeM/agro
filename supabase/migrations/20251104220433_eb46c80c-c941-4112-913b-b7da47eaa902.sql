-- Adicionar campo de plano no profiles
ALTER TABLE public.profiles ADD COLUMN plan_type text;

-- Criar check constraint para validar os tipos de plano
ALTER TABLE public.profiles ADD CONSTRAINT valid_plan_type 
  CHECK (plan_type IN ('suinos', 'bovinos', 'equinos', 'aves', 'caprinos', 'completo'));

-- Adicionar índice para melhor performance
CREATE INDEX idx_profiles_plan_type ON public.profiles(plan_type);