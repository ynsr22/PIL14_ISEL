import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { toast } from 'sonner';
import ResumeCommande from '../components/ResumeCommande';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import CarteAccessoire from '../components/CarteAccessoire';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import QRCodeGenerator from '../components/QRCodeGenerator';

interface Produit {
  id: number;
  nom: string;
  categorie_id: number;
  image?: string;
  prix: number;
}

interface Accessoires {
  id: number;
  nom: string;
  prix: number;
  image?: string;
}

const QUANTITE_MIN = 1;
const QUANTITE_MAX = 999;

function useFetch<T, D = unknown>(url: string | null, transform?: (data: D) => T) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error("Erreur lors de la récupération des données");

      const json = await res.json();
      setData(transform ? transform(json) : json);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name !== "AbortError") {
          setError(err.message || "Erreur inconnue");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [url, transform]);
  
  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  return { data, loading, error, refetch: () => fetchData() };
}

const transformProduit = (data: Produit): Produit => ({
  id: data.id,
  nom: data.nom,
  categorie_id: data.categorie_id,
  image: data.image ? `/bases/${data.image}` : "/bases/default.png",
  prix: data.prix || 0,
});

const transformAccessoire = (item: Record<string, unknown>): Accessoires => ({
  id: Number(item.id),
  nom: String(item.nom || ''),
  prix: Number(item.prix || 0),
  image: item.image ? `/accessoires/${String(item.image)}` : "/accessoires/default.png",
});

const transformAccessoires = (data: Record<string, unknown>[]): Accessoires[] => data.map(transformAccessoire);

const slidesBreakpoints = {
  320: { slidesPerView: 1 },
  640: { slidesPerView: 2 },
  768: { slidesPerView: 3 },
  1024: { slidesPerView: 4 },
};

// Component to load and display 3D model
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} dispose={null} />;
}

const PageProduit = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedAccessoires, setSelectedAccessoires] = useState<number[]>([]);
  const [quantite, setQuantite] = useState<number>(QUANTITE_MIN);

  // State to check 3D model availability
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);

  // State to toggle between image and 3D view
  const [view3D, setView3D] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Check model availability on mount, preload if exists
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const url = `/3d/${id}.glb`;
    fetch(url, { method: 'HEAD' })
      .then((res) => {
        if (!cancelled) {
          const ct = res.headers.get('content-type')?.toLowerCase() || '';
          const isGlb = res.ok && (ct.includes('model') || ct.includes('application/octet-stream'));
          setModelAvailable(isGlb);
          if (isGlb) useGLTF.preload(url);
        }
      })
      .catch(() => {
        if (!cancelled) setModelAvailable(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const {
    data: produit,
    loading: loadingProduit,
    error: errorProduit,
  } = useFetch<Produit>(
    id ? `${API_URL}/moyens/${id}` : null,
    transformProduit as (data: unknown) => Produit
  );

  const moyenId = produit?.id;

  const {
    data: accessoiresOptionnels,
    loading: loadingAccessoiresOptionnels,
    error: errorAccessoiresOptionnels,
  } = useFetch<Accessoires[]>(
    moyenId ? `${API_URL}/moyens/${moyenId}/accessoires` : null,
    transformAccessoires as (data: unknown) => Accessoires[]
  );

  const {
    data: accessoiresParDefaut,
    loading: loadingAccessoiresParDefaut,
    error: errorAccessoiresParDefaut,
  } = useFetch<Accessoires[]>(
    moyenId ? `${API_URL}/moyens/${moyenId}/accessoires_defauts` : null,
    transformAccessoires as (data: unknown) => Accessoires[]
  );

  const imageProduit = produit?.image;

  const handleQuantiteChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValeur = e.target.value.replace(/\D/g, "");
    const valeur = sanitizedValeur === "" ? QUANTITE_MIN : parseInt(sanitizedValeur, 10);
    setQuantite(Math.min(Math.max(valeur, QUANTITE_MIN), QUANTITE_MAX));
  }, []);

  const toggleAccessoire = useCallback((accessoireId: number) => {
    setSelectedAccessoires((prev) =>
      prev.includes(accessoireId) ? prev.filter(id => id !== accessoireId) : [...prev, accessoireId]
    );
  }, []);

  const selectedAccessoiresOptionnels = useMemo(() => {
    if (!Array.isArray(accessoiresOptionnels)) return [];
    const selectedIdsSet = new Set(selectedAccessoires);
    return accessoiresOptionnels.filter(accessoire => selectedIdsSet.has(accessoire.id));
  }, [accessoiresOptionnels, selectedAccessoires]);

  const totalPrice = useMemo(() => {
    const prixAccessoiresDefauts = accessoiresParDefaut?.reduce((sum, accessoire) => sum + accessoire.prix, 0) || 0;
    const prixAccessoiresOptionnels = selectedAccessoiresOptionnels?.reduce((sum, accessoire) => sum + accessoire.prix, 0) || 0;
    return (((produit?.prix || 0) + prixAccessoiresDefauts + prixAccessoiresOptionnels) * quantite);
  }, [quantite, accessoiresParDefaut, selectedAccessoiresOptionnels, produit?.prix]);

  const arUrl = useMemo(() => id ? `${window.location.origin}/ar-modele?id=${id}` : '', [id]);
  const modelUrl = useMemo(() => id ? `/3d/${id}.glb` : '', [id]);

  const handleAjoutPanier = () => {
    if (!produit) return;
    
    const itemPanier = {
      produit: produit.nom,
      imageProduit: produit.image,
      quantite,
      accessoires: selectedAccessoiresOptionnels,
      accessoiresParDefaut,
      totalPrice,
    };

    let panierExistant = [];
    try {
      panierExistant = JSON.parse(localStorage.getItem("panier") || "[]");
      if (!Array.isArray(panierExistant)) panierExistant = [];
    } catch (error) {
      console.error("Erreur lors de la récupération du panier:", error);
      panierExistant = [];
    }

    localStorage.setItem("panier", JSON.stringify([...panierExistant, itemPanier]));
    toast('Article ajouté au panier');
  };

  if (!produit) {
    return <div className="text-red-500">Produit introuvable</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">

      <h1 className="text-xl font-bold mb-4 text-gray-800">
        {produit?.nom ?? "Produit introuvable"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          {loadingProduit ? (
            <div className="w-full h-80 sm:h-96 md:h-[500px] bg-gray-200 animate-pulse rounded-lg" />
          ) : errorProduit ? (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              Erreur : {errorProduit}
            </div>
          ) : (
            <div className="relative w-full h-80 sm:h-96 md:h-[500px] mb-4 bg-gray-100 rounded-lg overflow-hidden">
              {modelAvailable && (
                <button
                  onClick={() => setView3D(!view3D)}
                  className="absolute top-2 right-2 z-10 bg-white/70 text-gray-700 p-1 rounded text-xs hover:bg-white/90 transition"
                >
                  {view3D ? '🔙' : '3D'}
                </button>
              )}
              {view3D && modelAvailable ? (
                <Canvas
                  camera={{ position: [0, 0, 5], fov: 45 }}
                  gl={{ toneMappingExposure: 0.65 }}
                  style={{ background: '#f0f0f0' }}
                  className="w-full h-full"
                >
                  <ambientLight intensity={0.05} />
                  <directionalLight position={[5, 5, 5]} intensity={0.5} />
                  <Environment preset="city" blur={0.8} />

                  <Suspense fallback={null}>
                    <Model url={modelUrl} />
                  </Suspense>

                  <OrbitControls enableZoom enablePan target={[0, 0, 0]} />
                  <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={5} blur={1.5} far={1} />
                </Canvas>
              ) : (
                <img
                  src={imageProduit}
                  alt={produit?.nom}
                  className="w-full h-full object-contain p-4"
                />
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="quantite" className="text-sm text-gray-700">Quantité:</label>
            <input
              id="quantite"
              type="number"
              min={QUANTITE_MIN}
              max={QUANTITE_MAX}
              value={quantite}
              onChange={handleQuantiteChange}
              className="mt-1 block w-full p-1 border border-gray-300 rounded"
            />
          </div>

          <ResumeCommande
            quantite={quantite}
            accessoiresParDefaut={accessoiresParDefaut || []}
            selectedAccessoiresOptionnels={selectedAccessoiresOptionnels}
            totalPrice={totalPrice}
            prixProduit={produit.prix}
          />

          <button
            onClick={handleAjoutPanier}
            className="w-full bg-yellow-500 text-white rounded cursor-pointer px-3 py-1 hover:bg-yellow-600 transition-colors"
          >
            Ajouter au panier
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Accessoires par défaut</h2>
        {loadingAccessoiresParDefaut ? (
          <p>Chargement...</p>
        ) : errorAccessoiresParDefaut ? (
          <p className="text-red-500">Erreur: {errorAccessoiresParDefaut}</p>
        ) : accessoiresParDefaut && accessoiresParDefaut.length === 0 ? (
          <p>Aucun accessoire par défaut.</p>
        ) : (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={slidesBreakpoints}
            navigation
            pagination={{ clickable: true }}
            className="accessories-swiper"
          >
            {accessoiresParDefaut?.map((accessoire) => (
              <SwiperSlide key={accessoire.id}>
                <CarteAccessoire
                  accessoire={accessoire}
                  isSelected={false}
                  isSelectable={false}
                  onClick={() => {}}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Accessoires optionnels</h2>
        {loadingAccessoiresOptionnels ? (
          <p>Chargement...</p>
        ) : errorAccessoiresOptionnels ? (
          <p className="text-red-500">Erreur: {errorAccessoiresOptionnels}</p>
        ) : accessoiresOptionnels && accessoiresOptionnels.length === 0 ? (
          <p>Aucun accessoire optionnel.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {accessoiresOptionnels?.map((accessoire) => (
              <div key={accessoire.id} className="relative">
                <CarteAccessoire
                  accessoire={accessoire}
                  isSelected={selectedAccessoires.includes(accessoire.id)}
                  isSelectable
                  onClick={() => toggleAccessoire(accessoire.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {modelAvailable && (
        <div className="my-4 flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-2">Scanner ce QR code pour AR</p>
          <QRCodeGenerator url={arUrl} size={100} />
        </div>
      )}
    </div>
  );
};

export default PageProduit;
