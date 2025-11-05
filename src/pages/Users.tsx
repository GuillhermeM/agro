import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users as UsersIcon, 
  ArrowLeft, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Shield,
  UserCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface User {
  id: string;
  nome: string;
  email: string;
  funcao: string;
  fazenda: string;
  status: string;
  dataCadastro: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    funcao: "",
    fazenda: "",
  });

  const stats = [
    { label: "Total de Usuários", value: users.length, icon: UsersIcon },
    { label: "Ativos", value: users.filter(u => u.status === "Ativo").length, icon: UserCheck },
    { label: "Administradores", value: users.filter(u => u.funcao === "Administrador").length, icon: Shield },
  ];

  const roleColors: Record<string, string> = {
    "Administrador": "bg-destructive/10 text-destructive",
    "Gestor": "bg-primary/10 text-primary",
    "Técnico": "bg-secondary/10 text-secondary",
    "Trabalhador de Campo": "bg-accent/10 text-accent",
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.funcao === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Date.now().toString(),
      nome: formData.nome,
      email: formData.email,
      funcao: formData.funcao,
      fazenda: formData.fazenda,
      status: "Ativo",
      dataCadastro: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    setFormData({ nome: "", email: "", funcao: "", fazenda: "" });
    setIsDialogOpen(false);
    toast.success("Usuário cadastrado com sucesso!");
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast.success("Usuário removido com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UsersIcon className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestão de Usuários</h1>
                <p className="text-sm text-muted-foreground">Controle de equipe e permissões</p>
              </div>
            </div>
            <Link to="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters and Actions */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="role">Função</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Gestor">Gestor</SelectItem>
                  <SelectItem value="Técnico">Técnico</SelectItem>
                  <SelectItem value="Trabalhador de Campo">Trabalhador de Campo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="h-4 w-4" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do usuário e defina suas permissões
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="funcao">Função</Label>
                    <Select
                      value={formData.funcao}
                      onValueChange={(value) => setFormData({ ...formData, funcao: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                        <SelectItem value="Gestor">Gestor</SelectItem>
                        <SelectItem value="Técnico">Técnico</SelectItem>
                        <SelectItem value="Trabalhador de Campo">Trabalhador de Campo</SelectItem>
                        <SelectItem value="Consultor">Consultor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fazenda">Fazenda</Label>
                    <Select
                      value={formData.fazenda}
                      onValueChange={(value) => setFormData({ ...formData, fazenda: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a fazenda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fazenda São José">Fazenda São José</SelectItem>
                        <SelectItem value="Sítio Vale Verde">Sítio Vale Verde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" variant="hero" className="flex-1">
                      Cadastrar
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Função</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fazenda</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{user.nome}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      <Badge className={roleColors[user.funcao] || "bg-muted"}>
                        {user.funcao}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.fazenda}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        </Card>

        {/* Permissions Info */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Níveis de Permissão</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <Badge className="bg-destructive/10 text-destructive mb-2">Administrador</Badge>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Acesso total ao sistema</li>
                <li>• Gerenciar usuários</li>
                <li>• Configurar fazendas</li>
              </ul>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className="bg-primary/10 text-primary mb-2">Gestor</Badge>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gerenciar rebanho</li>
                <li>• Visualizar relatórios</li>
                <li>• Registrar eventos</li>
              </ul>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className="bg-secondary/10 text-secondary mb-2">Técnico</Badge>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Registrar vacinas</li>
                <li>• Atualizar pesos</li>
                <li>• Visualizar animais</li>
              </ul>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <Badge className="bg-accent/10 text-accent mb-2">Trabalhador</Badge>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Registrar eventos básicos</li>
                <li>• Visualizar lotes</li>
                <li>• App mobile</li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Users;
