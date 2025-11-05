
-- Migration: 20251105182142

-- Migration: 20251104214520
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create farms table
CREATE TABLE public.farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  size_hectares numeric NOT NULL,
  cattle_count integer NOT NULL DEFAULT 0,
  coordinates jsonb NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS on farms
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

-- Farms policies
CREATE POLICY "Users can view their own farms"
  ON public.farms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farms"
  ON public.farms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farms"
  ON public.farms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farms"
  ON public.farms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Migration: 20251105181233
-- Create animals table
CREATE TABLE public.animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  brinco TEXT NOT NULL,
  especie TEXT NOT NULL,
  race TEXT,
  lote TEXT NOT NULL,
  peso NUMERIC NOT NULL,
  data_nascimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for animals
CREATE POLICY "Users can view their own animals" 
ON public.animals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own animals" 
ON public.animals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own animals" 
ON public.animals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own animals" 
ON public.animals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for animals
CREATE TRIGGER update_animals_updated_at
BEFORE UPDATE ON public.animals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create health_records table
CREATE TABLE public.health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  veterinario TEXT,
  custo NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for health_records
CREATE POLICY "Users can view their own health records" 
ON public.health_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health records" 
ON public.health_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health records" 
ON public.health_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health records" 
ON public.health_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for health_records
CREATE TRIGGER update_health_records_updated_at
BEFORE UPDATE ON public.health_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_animals_user_id ON public.animals(user_id);
CREATE INDEX idx_animals_farm_id ON public.animals(farm_id);
CREATE INDEX idx_animals_especie ON public.animals(especie);
CREATE INDEX idx_health_records_user_id ON public.health_records(user_id);
CREATE INDEX idx_health_records_animal_id ON public.health_records(animal_id);


-- Migration: 20251105182941
-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate policies with explicit authentication requirement
CREATE POLICY "Authenticated users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Migration: 20251105185800
-- Remove the unique constraint on user_id from farms table
-- This allows users to have multiple farms
ALTER TABLE public.farms 
DROP CONSTRAINT IF EXISTS farms_user_id_key;
