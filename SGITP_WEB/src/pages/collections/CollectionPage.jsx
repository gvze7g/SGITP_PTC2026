import CollectionGrid from '../../components/collections/CollectionGrid';
import CollectionIntro from '../../components/collections/CollectionIntro';
import PublicFooter from '../../components/home/PublicFooter';
import PublicNavbar from '../../components/home/PublicNavbar';

function CollectionPage() {
  return (
    <div className="collection-page">
      <PublicNavbar activeItem="collections" />
      <CollectionIntro />
      <CollectionGrid />
      <PublicFooter />
    </div>
  );
}

export default CollectionPage;
