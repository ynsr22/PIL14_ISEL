import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header, Navigation } from "./components/Header";
import Catalogue from "./pages/Catalogue";
import ARModele from "./pages/ARModele";
import PageProduit from "./pages/PageProduit";
import Panier from "./pages/Panier";
import Notice from "./pages/Notice";
import { RechercheProvider } from "./components/sub-components/Recherche";
import { Toaster } from 'sonner';

import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <RechercheProvider>
      <Header />
      <Navigation />
      <main className="container mx-auto px-4">
        <Outlet />
      </main>
    </RechercheProvider>
  );
}

function AppContent() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Catalogue />} />
        <Route path="/ar-modele" element={<ARModele />} />
        <Route path="/produit/:id" element={<PageProduit />} />
        <Route path="/panier" element={<Panier />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="*" element={<h1>404 - Page non trouvée</h1>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="bottom-right" />
      <AppContent />
    </Router>
  );
}

export default App;
