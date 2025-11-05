import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import FarmForm from "@/components/FarmForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, LogOut, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import type { Farm } from "@/lib/database.types";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Mapping = () => {
  const [user, setUser] = useState<any>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawnShape, setDrawnShape] = useState<any>(null);
  const [isNewFarm, setIsNewFarm] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user && !mapRef.current && mapContainerRef.current) {
      initializeMap();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFarmData();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  };

  const loadFarmData = async () => {
    const { data, error } = await supabase
      .from("farms")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading farms:", error);
      return;
    }

    if (data && data.length > 0) {
      setFarms(data);
      setSelectedFarm(data[0]);
      displayAllFarmsOnMap(data, data[0].id);
    }
  };

  const initializeMap = () => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current).setView([-15.7801, -47.9292], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add satellite layer as alternative
    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "© Esri",
        maxZoom: 19,
      }
    );

    // Layer control
    const baseMaps = {
      "Mapa": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
      }),
      "Satélite": satelliteLayer,
    };

    L.control.layers(baseMaps).addTo(map);

    drawnItemsRef.current.addTo(map);

    // Customizar o Leaflet Draw para exigir mínimo de 4 pontos
    const originalPolygonHandler = (L.Draw as any).Polygon.prototype.addVertex;
    (L.Draw as any).Polygon.prototype.addVertex = function(latlng: L.LatLng) {
      originalPolygonHandler.call(this, latlng);
      
      // Mostrar tooltip informativo
      if (this._markers && this._markers.length > 0 && this._markers.length < 4) {
        this._tooltip.updateContent({
          text: `Clique para adicionar pontos. Mínimo: 4 pontos (${this._markers.length}/4)`
        });
      }
    };

    const DrawControl = (L.Control as any).Draw;
    const drawControl = new DrawControl({
      edit: {
        featureGroup: drawnItemsRef.current,
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          drawError: {
            color: '#e74c3c',
            message: '<strong>Erro!</strong> As bordas não podem se cruzar!'
          },
          icon: new L.DivIcon({
            iconSize: new L.Point(8, 8),
            className: 'leaflet-div-icon leaflet-editing-icon'
          }),
          touchIcon: new L.DivIcon({
            iconSize: new L.Point(20, 20),
            className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
          }),
          guidelineDistance: 20,
          maxGuideLineLength: 4000,
          shapeOptions: {
            stroke: true,
            color: '#16a34a',
            weight: 4,
            opacity: 0.5,
            fill: true,
            fillColor: '#16a34a',
            fillOpacity: 0.3,
            clickable: true
          },
          metric: true,
          repeatMode: false
        },
        polyline: false,
        rectangle: {
          shapeOptions: {
            color: "#16a34a",
            fillColor: "#16a34a",
            fillOpacity: 0.3,
          },
        },
        circle: false,
        circlemarker: false,
        marker: false,
      },
    });

    map.addControl(drawControl);

    const DrawEvent = (L as any).Draw.Event;

    map.on(DrawEvent.CREATED, (event: any) => {
      const layer = event.layer;
      
      // Validar se o polígono tem pelo menos 4 pontos
      if (layer instanceof L.Polygon) {
        const coordinates = layer.getLatLngs()[0] as L.LatLng[];
        console.log('Polígono criado com', coordinates.length, 'pontos');
        
        if (coordinates.length < 4) {
          toast({
            title: "Polígono inválido",
            description: "O polígono precisa ter pelo menos 4 pontos. Tente novamente.",
            variant: "destructive",
          });
          // Remover a camada inválida
          map.removeLayer(layer);
          return;
        }
      }
      
      drawnItemsRef.current.clearLayers();
      drawnItemsRef.current.addLayer(layer);
      const geoJSON = layer.toGeoJSON();
      setDrawnShape(geoJSON);
      setIsNewFarm(true);
      setDialogOpen(true);
    });

    map.on(DrawEvent.EDITED, (event: any) => {
      const layers = event.layers;
      layers.eachLayer((layer: any) => {
        setDrawnShape(layer.toGeoJSON());
      });
    });

    mapRef.current = map;
  };

  const displayAllFarmsOnMap = (farmsData: any[], selectedFarmId?: string) => {
    if (!mapRef.current || !farmsData || farmsData.length === 0) return;

    drawnItemsRef.current.clearLayers();
    
    farmsData.forEach((farm) => {
      const isSelected = farm.id === selectedFarmId;
      const layer = L.geoJSON(farm.coordinates, {
        style: {
          color: isSelected ? "#16a34a" : "#3b82f6",
          fillColor: isSelected ? "#16a34a" : "#3b82f6",
          fillOpacity: isSelected ? 0.4 : 0.2,
          weight: isSelected ? 3 : 2,
        }
      });
      
      layer.bindPopup(`
        <div>
          <strong>${farm.name}</strong><br/>
          ${farm.size_hectares} hectares<br/>
          ${farm.cattle_count} cabeças de gado
        </div>
      `);
      
      layer.eachLayer((l) => {
        drawnItemsRef.current.addLayer(l);
      });
    });

    if (drawnItemsRef.current.getLayers().length > 0) {
      mapRef.current.fitBounds(drawnItemsRef.current.getBounds());
    }
  };

  const displayFarmOnMap = (coordinates: any) => {
    if (!mapRef.current || !coordinates) return;

    drawnItemsRef.current.clearLayers();
    const layer = L.geoJSON(coordinates);
    layer.eachLayer((l) => {
      drawnItemsRef.current.addLayer(l);
    });

    mapRef.current.fitBounds(drawnItemsRef.current.getBounds());
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setIsNewFarm(false);
    loadFarmData();
  };

  const handleSelectFarm = (farm: any) => {
    setSelectedFarm(farm);
    displayAllFarmsOnMap(farms, farm.id);
  };

  const handleNewFarm = () => {
    setIsNewFarm(true);
    setSelectedFarm(null);
    drawnItemsRef.current.clearLayers();
    setDialogOpen(false);
  };

  const handleDeleteFarm = async (farmId: string) => {
    const { error } = await supabase
      .from("farms")
      .delete()
      .eq("id", farmId);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar fazenda",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Fazenda deletada!",
      description: "A fazenda foi removida com sucesso.",
    });
    loadFarmData();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mapeamento da Fazenda</h1>
                <p className="text-sm text-muted-foreground">Desenhe e salve sua propriedade</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleNewFarm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Fazenda
              </Button>
              {selectedFarm && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Editar Informações</Button>
                  </DialogTrigger>
                  <DialogContent className="z-[9999]">
                    <DialogHeader>
                      <DialogTitle>Editar Fazenda</DialogTitle>
                    </DialogHeader>
                    <FarmForm
                      farmData={selectedFarm}
                      coordinates={drawnShape || selectedFarm.coordinates}
                      onSuccess={handleFormSuccess}
                    />
                  </DialogContent>
                </Dialog>
              )}
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="p-4 lg:col-span-1 h-fit">
            <h3 className="font-semibold text-foreground mb-4">Fazendas Cadastradas</h3>
            {farms.length > 0 ? (
              <div className="space-y-2 mb-4">
                {farms.map((farm) => (
                  <div
                    key={farm.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFarm?.id === farm.id
                        ? "bg-primary/10 border-primary"
                        : "bg-card hover:bg-muted/20"
                    }`}
                    onClick={() => handleSelectFarm(farm)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{farm.name}</p>
                        <p className="text-xs text-muted-foreground">{farm.size_hectares} ha</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFarm(farm.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                Nenhuma fazenda cadastrada
              </p>
            )}
            
            {selectedFarm && (
              <>
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Detalhes</h4>
                  <div>
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="font-medium text-foreground">{selectedFarm.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tamanho</p>
                    <p className="font-medium text-foreground">{selectedFarm.size_hectares} hectares</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quantidade de Gado</p>
                    <p className="font-medium text-foreground">{selectedFarm.cattle_count} cabeças</p>
                  </div>
                  {selectedFarm.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground">Observações</p>
                      <p className="text-sm text-foreground">{selectedFarm.notes}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Map */}
          <div className="lg:col-span-3 relative">
            <Card className="p-0 overflow-hidden">
              <div 
                ref={mapContainerRef} 
                className="w-full h-[600px] rounded-lg relative z-0"
              />
            </Card>
          </div>
        </div>
      </main>

      {(isNewFarm || !selectedFarm) && drawnShape && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="z-[9999]">
            <DialogHeader>
              <DialogTitle>Cadastrar Fazenda</DialogTitle>
            </DialogHeader>
            <FarmForm
              coordinates={drawnShape}
              onSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Mapping;