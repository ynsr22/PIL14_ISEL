import { useState, useEffect, useMemo, useContext, Suspense } from "react";
import { RechercheContext } from "../components/sub-components/Recherche";
import { SkeletonCard } from "../components/sub-components/SqueletteCarte";
import { ProductCard } from "../components/sub-components/CarteProduit";
import MemoizedFilterComponent from "../components/sub-components/Filtre";

export default function Catalogue() {
  interface Item {
    id: number;
    nom: string;
    categorie: string;
    roues: string;
    emplacement: string;
    type_base: string;
    taille: string;
    departement: string;
    prix: number;
    image: string;
  }

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rechercheContext = useContext(RechercheContext);

  // Etats pour les filtres
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0,1000]);
  const [initialPriceRange, setInitialPriceRange] = useState<[number, number]>([0,1000]);

  // Etat pour le tri
  const [sortOption, setSortOption] = useState("name-asc");

  // Fonction pour récupérer la plage de prix
  const getPriceRange = (data: { prix: number }[]) => {
    if (!data.length) return [0,1000] as [number, number];
    const prices = data.map((item) => item.prix);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))] as [number, number];
  };

  // Vérifier si des filtres sont appliqués
  const hasFilters = 
    priceRange[0] !== initialPriceRange[0] ||
    priceRange[1] !== initialPriceRange[1] ||
    selectedDepartments.length > 0 ||
    selectedCategories.length > 0 ||
    sortOption !== "name-asc" ||
    (rechercheContext?.recherche && rechercheContext.recherche.trim().length > 0);

    // Fonction pour réinitialiser les filtres
    const handleResetFilters = () => {
      setPriceRange(initialPriceRange);
      setSelectedDepartments([]);
      setSelectedCategories([]);
      setSortOption("name-asc");
      window.scrollTo({ top: 0, behavior: "smooth" });

      if (rechercheContext) {
        rechercheContext.setRecherche("");
      }
    }

    const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function recupererMoyens() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/moyens`, { signal });

        if (!response.ok) {
          throw new Error(`Erreur serveur: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Format de données invalides");
        }

        // Normalisation des données
        const normalizedData = data.map((item: Record<string, unknown>) => ({
          id: item.id ? parseInt(String(item.id), 10) : 0,
          nom: item.nom as string,
          categorie: item.categorie_id as string,
          roues: item.roue as string,
          emplacement: item.emplacement as string,
          type_base: item.type_base as string,
          taille: item.taille as string,
          departement: item.departement as string,
          prix: item.prix ? parseFloat(String(item.prix)) : 0,
          image: item.image ? `/bases/${item.image}` : "/bases/default.png",
        }));

        setItems(normalizedData);
        setPriceRange(getPriceRange(normalizedData));
        setInitialPriceRange(getPriceRange(normalizedData));

      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Erreur API:", err);
          setError("Impossible de charger les moyens roulants.");
        }
      } finally {
        setLoading(false);
      }
    }

    recupererMoyens();
    return () => controller.abort();
  }, [API_URL]);

  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter((item: {nom?: string; prix?: number; categorie?: string; departement?:string }) => {
      // Filtre par recherche
      if (rechercheContext?.recherche && !item.nom?.toLowerCase().includes(rechercheContext.recherche.toLowerCase())) {
        return false;
      }

      if ((item.prix ?? 0) < priceRange[0] || (item.prix ?? 0) > priceRange[1]) {
        return false;
      }

      if (selectedDepartments.length > 0 && (!item.departement || !selectedDepartments.includes(item.departement))) {
        return false;
      }
      
      if (selectedCategories.length > 0 && (!item.categorie || !selectedCategories.includes(Number(item.categorie)))) {
        return false;
      }      

      return true;
    });

    return filtered.slice().sort((a,b) => {
      switch (sortOption) {
        case "price-asc":
          return a.prix - b.prix;
        case "price-desc":
          return b.prix - a.prix;
        case "name-asc":
          return a.nom.localeCompare(b.nom);
        case "name-desc":
          return b.nom.localeCompare(a.nom);
        default:
          return 0;
      }
    });
  }, [items, rechercheContext?.recherche, priceRange, selectedDepartments, selectedCategories, sortOption]);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar des filtres */}
          <aside className="md:col-span-1">
            <div className="sticky top-8">
              <Suspense fallback={<div className="h-40 bg-gray-100 animate-pulse rounded" />}>
                <MemoizedFilterComponent
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  selectedDepartments={selectedDepartments}
                  setSelectedDepartments={setSelectedDepartments}
                  selectedCategories={selectedCategories.map(Number)}
                  setSelectedCategories={setSelectedCategories} />
              </Suspense>

              {/*Sélecteur de tri */}
              <div className="flex items-center text-sm mt-4">
                <label htmlFor="sort" className="text-sm text-gray-600 mr-2">
                  Trier par:
                </label>
                <select
                  id="sort"
                  aria-label="Sélectionnez un tri"
                  className="text-sm border border-gray-300 rounded p-2 bg-white cursor-pointer"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}>
                  <option value="name-asc">Nom A-Z</option>
                  <option value="name-desc">Nom Z-A</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>
              </div>

              {filteredAndSortedItems.length > 0 && !loading && (
                <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-100">
                  <p className="text-sm text-yellow-700">
                    {filteredAndSortedItems.length > 0 
                      ? `${filteredAndSortedItems.length} produit${filteredAndSortedItems.length > 1 ? "s" : ""} trouvé${filteredAndSortedItems.length > 1 ? "s" : ""}`
                      : "Aucun produit trouvé"}
                  </p>
                </div> 
              )}

              {/* Bouton pour réinitialiser les filtres */}
              {hasFilters && (
                <button
                  className="w-full mt-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center cursor-pointer justify-center"
                  aria-label="Réinitialiser tous les filtres"
                  onClick={handleResetFilters}
                  >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Réinitialiser tous les filtres
                </button>
              )}
            </div>
          </aside>

          {/* Grille des produits */}
          <section className="md:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(9).fill(0).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : filteredAndSortedItems.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun produit trouvé.
                </h3>
                <p className="text-gray-500">
                  Essayez de modifier vos filtres ou votre recherche.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedItems.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  )
}