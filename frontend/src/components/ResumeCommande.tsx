import { memo, useMemo } from "react";

interface Accessoire {
    id: number;
    nom: string;
    prix: number;
    image?: string;
}

interface ResumeCommandeProps {
    quantite: number;
    accessoiresParDefaut: Accessoire[];
    selectedAccessoiresOptionnels: Accessoire[];
    totalPrice: number;
    prixProduit: number;
}

const ResumeCommande = memo(({ quantite, accessoiresParDefaut, selectedAccessoiresOptionnels, totalPrice, prixProduit }: ResumeCommandeProps) => {
    const totalPrixAccessoiresParDefaut = useMemo(() => 
        accessoiresParDefaut.reduce((sum, acc) => sum + acc.prix, 0), 
        [accessoiresParDefaut]
    );

    const totalPrixAccessoiresOptionnels = useMemo(() => 
        selectedAccessoiresOptionnels.reduce((sum, acc) => sum + acc.prix, 0), 
        [selectedAccessoiresOptionnels]
    );

    const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(price);

    return (
        <div className="bg-gray-50 p-3 rounded-lg h-auto">
            <h3 className="text-sm font-semibold mb-2">Résumé de la commande</h3>
            <div className="text-xs space-y-2">
                <p>Produit : {formatPrice(prixProduit)} x {quantite}</p>
                <p>Total accessoires par défaut : {formatPrice(totalPrixAccessoiresParDefaut)} x {quantite} = {formatPrice(totalPrixAccessoiresParDefaut * quantite)}</p>
                <p>Total accessoires optionnels : {formatPrice(totalPrixAccessoiresOptionnels)} x {quantite} = {formatPrice(totalPrixAccessoiresOptionnels * quantite)}</p>

                <div className="border-t border-gray-300 pt-2 mt-2" />
                <p className="text-base font-bold">Total : {formatPrice(totalPrice)}</p>
            </div>
        </div>
    );
});

ResumeCommande.displayName = "ResumeCommande";

export default ResumeCommande;
