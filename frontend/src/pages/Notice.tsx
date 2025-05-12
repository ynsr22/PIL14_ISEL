import { FC, memo } from "react";

// Composant Section réutilisable
interface SectionProps {
  title: string;
  content: React.ReactNode;
}

const Section: FC<SectionProps> = memo(({ title, content }) => (
  <section className="mb-8" aria-labelledby={title.replace(/\s+/g, "-").toLowerCase()}>
    <h2 id={title.replace(/\s+/g, "-").toLowerCase()} className="text-xl font-semibold mb-4">
      {title}
    </h2>
    {content}
  </section>
));

Section.displayName = "Section";

// Composant Notice principal
const Notice: FC = memo(() => {
  const sections = [
    {
      title: "1. Introduction",
      content: (
        <p className="text-gray-700">
          Dans le cadre du Projet d’Innovation Logistique (PIL) de l’ISEL, notre équipe a été missionnée par Renault pour concevoir une marketplace dédiée à la gestion des commandes de moyens logistiques non motorisés. L’objectif : proposer une solution digitale intuitive, capable de centraliser les besoins internes et de fluidifier les processus de commande.
        </p>
      ),
    },
    {
      title: "2. Stack technologique",
      content: (
        <ul className="list-disc pl-6 text-gray-700">
          <li>Frontend : React.js (SPA), TypeScript, react-router-dom, react-three-fiber, @google/model-viewer, TailwindCSS</li>
          <li>Backend : Go avec Echo</li>
          <li>Base de données : PostgreSQL</li>
        </ul>
      ),
    },
    {
      title: "3. Infrastructure & déploiement",
      content: (
        <ul className="list-disc pl-6 text-gray-700">
          <li>Docker (conteneurs isolés : frontend, backend, BDD)</li>
          <li>Reverse proxy : Traefik</li>
          <li>Hébergement : VPS dédié</li>
        </ul>
      ),
    },
    {
      title: "4. Fonctionnalités développées",
      content: (
        <ul className="list-disc pl-6 text-gray-700">
          <li>Catalogue : interface de consultation des moyens disponibles</li>
          <li>Filtres dynamiques : tri et affinage des résultats en temps réel</li>
          <li>Panier : ajout, suppression et gestion des articles sélectionnés</li>
          <li>Bon de commande : génération automatique au format PDF</li>
          <li>Accessoires : sélection d’accessoires compatibles selon le moyen choisi</li>
          <li>Visualisation 3D : inspection interactive du moyen dans le navigateur</li>
          <li>Réalité augmentée : projection du moyen en AR via le navigateur</li>
        </ul>
      ),
    },
    {
      title: "5. Évolutions envisageables",
      content: (
        <ul className="list-disc pl-6 text-gray-700">
          <li>Recueil des données et enrichissement du catalogue avec visuels et fichiers 3D</li>
          <li>Suivi du planning des commandes avec module calendrier et alertes</li>
          <li>Système de validation multi-étapes structuré par rôles avec notifications</li>
          <li>Suivi budgétaire et tableau de bord financier avec alertes de dépassement</li>
          <li>Gestion multi-fournisseurs pour comparaison et attribution des commandes</li>
          <li>Standardisation multi-sites pour déploiement homogène</li>
          <li>Gestion des rôles et workflows avec interfaces dédiées</li>
          <li>Historique des commandes, inventaire départemental et bibliothèque de pratiques</li>
          <li>Recommandation d’accessoires via algorithme LightGCN</li>
          <li>Multilingue pour usage international</li>
        </ul>
      ),
    },
    {
      title: "6. Code source et accès",
      content: (
        <p className="text-gray-700">
          Le code source est disponible sur <a href="https://github.com/ynsr22/PIL14_ISEL" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">GitHub</a> et l’outil est consultable en ligne à <a href="https://projet.srairi.fr" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">https://projet.srairi.fr</a>.
        </p>
      ),
    },
    {
      title: "7. Équipe projet",
      content: (
        <p className="text-gray-700">
          Projet réalisé par Amira Aoudia, Souhail Ejnaini et Yanis Srairi, étudiants en cinquième année à l’ISEL.
        </p>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notice</h1>
      {sections.map((section, index) => (
        <Section key={index} title={section.title} content={section.content} />
      ))}
    </div>
  );
});

Notice.displayName = "Notice";

// Composant de la page
const Page: FC = () => (
  <main>
    <Notice />
  </main>
);

export default Page;
