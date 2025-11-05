// Temporary type definitions until Supabase types are regenerated
export interface Farm {
  id: string;
  user_id: string;
  name: string;
  size_hectares: number;
  cattle_count: number;
  coordinates: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Animal {
  id: string;
  user_id: string;
  farm_id?: string;
  brinco: string;
  especie: string;
  race?: string;
  lote: string;
  peso: number;
  data_nascimento: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  user_id: string;
  animal_id?: string;
  tipo: string;
  data: string;
  descricao?: string;
  veterinario?: string;
  custo?: number;
  created_at: string;
  updated_at: string;
  animals?: {
    brinco: string;
    especie: string;
  };
}

export interface Profile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}
