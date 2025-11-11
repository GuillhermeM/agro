export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      animals: {
        Row: {
          brinco: string
          created_at: string
          data_nascimento: string
          especie: string
          farm_id: string | null
          id: string
          lote: string
          peso: number
          race: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brinco: string
          created_at?: string
          data_nascimento: string
          especie: string
          farm_id?: string | null
          id?: string
          lote: string
          peso: number
          race?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brinco?: string
          created_at?: string
          data_nascimento?: string
          especie?: string
          farm_id?: string | null
          id?: string
          lote?: string
          peso?: number
          race?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "animals_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      equine_details: {
        Row: {
          altura_metros: number | null
          animal_id: string
          created_at: string
          finalidade: string | null
          id: string
          mae: string | null
          nivel_treinamento: string | null
          pai: string | null
          pelagem: string | null
          registro: string | null
          temperamento: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          altura_metros?: number | null
          animal_id: string
          created_at?: string
          finalidade?: string | null
          id?: string
          mae?: string | null
          nivel_treinamento?: string | null
          pai?: string | null
          pelagem?: string | null
          registro?: string | null
          temperamento?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          altura_metros?: number | null
          animal_id?: string
          created_at?: string
          finalidade?: string | null
          id?: string
          mae?: string | null
          nivel_treinamento?: string | null
          pai?: string | null
          pelagem?: string | null
          registro?: string | null
          temperamento?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equine_details_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      equine_training: {
        Row: {
          animal_id: string
          created_at: string
          data: string
          desempenho: string | null
          duracao_minutos: number | null
          id: string
          instrutor: string | null
          local: string | null
          modalidade: string | null
          observacoes: string | null
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          data: string
          desempenho?: string | null
          duracao_minutos?: number | null
          id?: string
          instrutor?: string | null
          local?: string | null
          modalidade?: string | null
          observacoes?: string | null
          tipo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          data?: string
          desempenho?: string | null
          duracao_minutos?: number | null
          id?: string
          instrutor?: string | null
          local?: string | null
          modalidade?: string | null
          observacoes?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equine_training_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          cattle_count: number
          coordinates: Json
          created_at: string
          id: string
          name: string
          notes: string | null
          size_hectares: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cattle_count?: number
          coordinates: Json
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          size_hectares: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cattle_count?: number
          coordinates?: Json
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          size_hectares?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          animal_id: string | null
          created_at: string
          custo: number | null
          data: string
          descricao: string | null
          id: string
          tipo: string
          updated_at: string
          user_id: string
          veterinario: string | null
        }
        Insert: {
          animal_id?: string | null
          created_at?: string
          custo?: number | null
          data: string
          descricao?: string | null
          id?: string
          tipo: string
          updated_at?: string
          user_id: string
          veterinario?: string | null
        }
        Update: {
          animal_id?: string | null
          created_at?: string
          custo?: number | null
          data?: string
          descricao?: string | null
          id?: string
          tipo?: string
          updated_at?: string
          user_id?: string
          veterinario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      production_costs: {
        Row: {
          categoria: string
          created_at: string
          data: string
          descricao: string | null
          farm_id: string | null
          id: string
          quantidade: number | null
          tipo: string
          unidade: string | null
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data: string
          descricao?: string | null
          farm_id?: string | null
          id?: string
          quantidade?: number | null
          tipo: string
          unidade?: string | null
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string | null
          farm_id?: string | null
          id?: string
          quantidade?: number | null
          tipo?: string
          unidade?: string | null
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_costs_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      productivity: {
        Row: {
          area_hectares: number
          created_at: string
          cultura: string
          data: string
          farm_id: string | null
          id: string
          producao: number
          produtividade_por_ha: number | null
          safra: string | null
          talhao: string | null
          unidade: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_hectares: number
          created_at?: string
          cultura: string
          data: string
          farm_id?: string | null
          id?: string
          producao: number
          produtividade_por_ha?: number | null
          safra?: string | null
          talhao?: string | null
          unidade: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_hectares?: number
          created_at?: string
          cultura?: string
          data?: string
          farm_id?: string | null
          id?: string
          producao?: number
          produtividade_por_ha?: number | null
          safra?: string | null
          talhao?: string | null
          unidade?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "productivity_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      revenues: {
        Row: {
          created_at: string
          cultura: string
          data: string
          farm_id: string | null
          id: string
          notas: string | null
          preco_unitario: number
          quantidade: number
          unidade: string
          updated_at: string
          user_id: string
          valor_total: number
        }
        Insert: {
          created_at?: string
          cultura: string
          data: string
          farm_id?: string | null
          id?: string
          notas?: string | null
          preco_unitario: number
          quantidade: number
          unidade: string
          updated_at?: string
          user_id: string
          valor_total: number
        }
        Update: {
          created_at?: string
          cultura?: string
          data?: string
          farm_id?: string | null
          id?: string
          notas?: string | null
          preco_unitario?: number
          quantidade?: number
          unidade?: string
          updated_at?: string
          user_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "revenues_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
