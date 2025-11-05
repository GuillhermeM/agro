-- Remover a constraint UNIQUE que só permite uma fazenda por usuário
ALTER TABLE public.farms DROP CONSTRAINT IF EXISTS farms_user_id_key;