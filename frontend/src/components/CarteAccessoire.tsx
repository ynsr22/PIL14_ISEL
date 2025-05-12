import { memo, KeyboardEvent } from "react";

interface Accessoire {
    id: number;
    nom: string;
    prix: number;
    image?: string;
}

interface CarteAccessoireProps {
    accessoire: Accessoire;
    isSelected: boolean;
    isSelectable: boolean;
    onClick: () => void;
}

const CarteAccessoire = memo(
  ({ accessoire, isSelected, isSelectable, onClick }: CarteAccessoireProps) => {
    // Keyboard: support both Enter and Space for accessibility
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!isSelectable) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    };

    return (
      <div
        className={`p-2 border rounded transition-colors relative 
            ${isSelectable 
                ? (isSelected ? 'border-yellow-500 bg-yellow-50 cursor-pointer' : 'border-gray-200 hover:border-yellow-300 cursor-pointer') 
                : 'border-gray-200 bg-gray-50 pointer-events-none'}`}
        onClick={isSelectable ? onClick : undefined}
        role={isSelectable ? 'button' : undefined}
        tabIndex={isSelectable ? 0 : undefined}
        aria-label={accessoire.nom}
        aria-pressed={isSelectable ? isSelected : undefined}
        aria-disabled={!isSelectable}
        onKeyDown={handleKeyDown}
      >
        <div className="relative w-full h-40 flex items-center justify-center bg-gray-100 rounded">
          <img
            src={accessoire.image || "/accessoires/defaut.png"}
            alt={accessoire.nom}
            className="w-full h-full object-contain rounded"
            loading="lazy"
            decoding="async"
            // Optionally add width/height for layout stability
          />
        </div>
        <h3 className="text-sm font-medium mt-2">{accessoire.nom}</h3>
        <p className="text-xs text-gray-600">{accessoire.prix.toLocaleString()}€</p>
        {isSelected && isSelectable && (
          <div className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center absolute top-1 right-1">
            ✓
          </div>
        )}
      </div>
    );
  }
);

CarteAccessoire.displayName = "CarteAccessoire";

export default CarteAccessoire;