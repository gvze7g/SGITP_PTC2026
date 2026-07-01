import HeroSection from '../../components/home/HeroSection';
import OffersSection from '../../components/home/OffersSection';
import ProductRail from '../../components/home/ProductRail';
import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';
import StoresSection from '../../components/home/StoresSection';

function HomePage() {
  return (
    <div className="public-home-page">
      <PublicNavbar />
      <HeroSection />
      <ProductRail />
      <OffersSection />
      <StoresSection />
      <PublicFooter />
    </div>
  );
}

export default HomePage;
