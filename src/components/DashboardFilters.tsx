import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar, Filter } from "lucide-react";

interface DashboardFiltersProps {
  farms: any[];
  selectedFarm: string;
  selectedYear: string;
  selectedMonth: string;
  onFarmChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
}

const DashboardFilters = ({
  farms,
  selectedFarm,
  selectedYear,
  selectedMonth,
  onFarmChange,
  onYearChange,
  onMonthChange,
}: DashboardFiltersProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  const months = [
    { value: "all", label: "Todos os meses" },
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="farm-filter">Fazenda</Label>
          <Select value={selectedFarm} onValueChange={onFarmChange}>
            <SelectTrigger id="farm-filter">
              <SelectValue placeholder="Todas as fazendas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as fazendas</SelectItem>
              {farms.map((farm) => (
                <SelectItem key={farm.id} value={farm.id}>
                  {farm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year-filter">Ano</Label>
          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger id="year-filter">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="month-filter">Mês</Label>
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger id="month-filter">
              <SelectValue placeholder="Todos os meses" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default DashboardFilters;
