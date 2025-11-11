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

export interface ProductionCost {
  id: string;
  user_id: string;
  farm_id?: string;
  data: string;
  categoria: string;
  tipo: string;
  descricao?: string;
  valor: number;
  quantidade?: number;
  unidade?: string;
  created_at: string;
  updated_at: string;
}

export interface Revenue {
  id: string;
  user_id: string;
  farm_id?: string;
  data: string;
  cultura: string;
  quantidade: number;
  unidade: string;
  preco_unitario: number;
  valor_total: number;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface Productivity {
  id: string;
  user_id: string;
  farm_id?: string;
  data: string;
  cultura: string;
  area_hectares: number;
  producao: number;
  unidade: string;
  produtividade_por_ha?: number;
  safra?: string;
  talhao?: string;
  created_at: string;
  updated_at: string;
}
