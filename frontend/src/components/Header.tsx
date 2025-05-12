import React, { useContext, useCallback, useState, useEffect } from 'react';
import { RechercheContext } from './sub-components/Recherche';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo_renault.png';
import logo_responsive from '../assets/logo_renault_responsive.png';

const IconeRecherche = React.memo(() => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
));

const IconePanier = React.memo(() => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-7 sm:h-7"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
));

const IconeDoc = React.memo(() => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.72" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 stroke-white group-hover:stroke-[#FFEA2F] transition-colors duration-200" ><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>
));

const BarreRecherche: React.FC<{ recherche: string; setRecherche: (recherche: string) => void }> = React.memo(({ recherche, setRecherche }) => {
  const navigate = useNavigate();
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  }, [navigate]);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRecherche(e.target.value);
  }, [setRecherche]);
  return (
    <form
      className="flex items-center w-full max-w-xs sm:max-w-sm md:max-w-md h-8 sm:h-9 bg-white rounded-full overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-black focus-within:ring-opacity-20"
      onSubmit={handleSubmit}
      role="search"
    >
      <input
        type="search"
        value={recherche}
        onChange={handleChange}
        placeholder="Recherche..."
        className="w-full min-w-0 px-2 sm:px-3 py-1 text-sm sm:text-base text-gray-700 bg-transparent focus:outline-none"
        aria-label="Rechercher des produits"
      />
      <button
        type="submit"
        className="flex-shrink-0 flex items-center justify-center w-8 sm:w-10 h-full bg-black text-white hover:bg-gray-800 transition-colors"
        aria-label="Lancer la recherche"
      >
        <IconeRecherche />
      </button>
    </form>
  );
});

const BoutonPanier = React.memo(() => (
  <Link to="/panier" aria-label="Accéder au panier">
    <div className="relative flex-shrink-0 cursor-pointer hover:bg-white rounded-full p-1.5 sm:p-2 transition-colors group touch-manipulation">
      <IconePanier />
    </div>
  </Link>
));


const Header: React.FC = () => {
    const rechercheContext = useContext(RechercheContext);
    const [isNarrow, setIsNarrow] = useState(false);

    // Check screen width on mount and when window is resized
    useEffect(() => {
      const checkWidth = () => {
        setIsNarrow(window.innerWidth < 380);
      };
      
      // Initialize
      checkWidth();
      
      // Add resize listener
      window.addEventListener('resize', checkWidth);
      
      // Cleanup
      return () => window.removeEventListener('resize', checkWidth);
    }, []);
    
    if (!rechercheContext) {
        return null; // or handle the null case appropriately
    }
    const { recherche, setRecherche } = rechercheContext;
  
    return (
      <header className="w-full h-12 sm:h-14 bg-[#FFEA2F] flex items-center justify-between px-2 sm:px-4 relative shadow-sm">
        <div className={`flex items-center absolute ${isNarrow ? 'left-2' : 'left-3 sm:left-4'} z-10`}>
            <Link to="/" className="flex items-center" aria-label="Accueil">
                <img src={logo} alt="Logo Renault" width={110} height={40} className="hidden sm:block" />
                <img src={logo_responsive} alt="Logo Renault" width={30} height={30} className="sm:hidden" />
            </Link>
        </div>
        <div className="flex justify-center items-center w-full px-10 sm:px-16">
          <BarreRecherche recherche={recherche} setRecherche={setRecherche} />
        </div>
        <div className={`flex items-center absolute ${isNarrow ? 'right-2' : 'right-3 sm:right-4'} z-10`}>
          <BoutonPanier />
        </div>
      </header>
    );
  };

  const Navigation: React.FC = () => (
    <nav className="w-full h-10 bg-black shadow-md" aria-label="Navigation principale">
      <div className="max-w-6xl mx-auto h-full flex justify-center items-center">
        <Link to="/notice" className="h-full flex justify-center items-center gap-1 group py-2 px-3 sm:px-4 text-white hover:text-[#FFEA2F] transition-colors duration-200" aria-label="Accéder aux notices d'utilisation">
          <IconeDoc />
          <span className="text-sm sm:text-base font-medium whitespace-nowrap">Notice</span>
        </Link>
      </div>
    </nav>
  );

export { Header, Navigation };
