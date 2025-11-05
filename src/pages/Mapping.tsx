import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import FarmForm from "@/components/FarmForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, LogOut, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Fix leaflet-draw bug - must be done before importing leaflet-draw
(L as any).GeometryUtil = L.GeometryUtil || {};
(L as any).GeometryUtil.readableArea = function (area: number, isMetric?: boolean, precision?: number) {
  const areaStr = (isMetric ? area : area * 0.836127) + '';
  return areaStr;
};

import "leaflet-draw";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Mapping = () => {
  const [user, setUser] = useState<any>(null);
  const [farm, setFarm] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawnShape, setDrawnShape] = useState<any>(null);
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

    // Check if user has a plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", session.user.id)
      .single();

    if (!profile?.plan_type) {
      navigate("/plan-selection");
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
      .maybeSingle();

    if (error) {
      console.error("Error loading farm:", error);
      return;
    }

    if (data) {
      setFarm(data);
      displayFarmOnMap(data.coordinates);
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

    const DrawControl = (L.Control as any).Draw;
    const drawControl = new DrawControl({
      edit: {
        featureGroup: drawnItemsRef.current,
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: "#16a34a",
            fillColor: "#16a34a",
            fillOpacity: 0.3,
          },
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
      drawnItemsRef.current.clearLayers();
      drawnItemsRef.current.addLayer(layer);
      const geoJSON = layer.toGeoJSON();
      console.log("✅ Shape desenhado:", geoJSON);
      console.log("✅ Definindo drawnShape e abrindo dialog...");
      setDrawnShape(geoJSON);
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
            <h3 className="font-semibold text-foreground mb-4">Informações da Fazenda</h3>
            {farm ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium text-foreground">{farm.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tamanho</p>
                  <p className="font-medium text-foreground">{farm.size_hectares} hectares</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quantidade de Gado</p>
                  <p className="font-medium text-foreground">{farm.cattle_count} cabeças</p>
                </div>
                {farm.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Observações</p>
                    <p className="text-sm text-foreground">{farm.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Use as ferramentas no mapa para desenhar sua fazenda
              </p>
            )}
          </Card>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="p-0 overflow-hidden">
              <div 
                ref={mapContainerRef} 
                className="w-full h-[600px] rounded-lg"
              />
            </Card>
          </div>
        </div>
      </main>

      {/* Dialog for creating/editing farm */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto z-[9999]">
          <DialogHeader>
            <DialogTitle>{farm ? "Editar Fazenda" : "Cadastrar Fazenda"}</DialogTitle>
            <DialogDescription>
              {farm ? "Atualize as informações da sua fazenda" : "Preencha os dados da fazenda desenhada no mapa"}
            </DialogDescription>
          </DialogHeader>
          {drawnShape ? (
            <FarmForm
              farmData={farm}
              coordinates={drawnShape}
              onSuccess={handleFormSuccess}
            />
          ) : (
            <p className="text-muted-foreground">Desenhe uma área no mapa primeiro...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Mapping;