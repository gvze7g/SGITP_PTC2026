import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import ProductDetailView from '../../components/products/ProductDetailView';
import PublicNavbar from '../../components/home/PublicNavbar';
import { useAuth } from '../../context/AuthContext';
import { addItemToCart } from '../../services/cartService';
import { addFavorite, getMyFavorites, removeFavorite } from '../../services/favoriteService';
import {
  formatProductPrice,
  getCatalogProductById,
  getCatalogProducts,
  getProductImage,
} from '../../services/catalogService';

const NEW_ARRIVAL_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { isAuthenticated } = useAuth();

  const [rawProduct, setRawProduct] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [favoriteProductIds, setFavoriteProductIds] = useState([]);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const request = productId
      ? getCatalogProductById(productId)
      : getCatalogProducts().then((products) => products?.[0] || null);

    request
      .then((data) => {
        if (!isMounted) return;
        setRawProduct(data);
        setIsNew(
          Boolean(data?.createdAt) &&
            Date.now() - new Date(data.createdAt).getTime() < NEW_ARRIVAL_WINDOW_MS
        );

        const firstVariant = data?.variants?.[0];
        setSelectedSize(firstVariant?.size || null);
        setSelectedColor(firstVariant?.color || null);
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Trae la lista de favoritos del cliente autenticado para saber si este producto ya esta guardado
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let isMounted = true;

    getMyFavorites()
      .then((favorites) => {
        if (!isMounted) return;
        const ids = (Array.isArray(favorites) ? favorites : []).map(
          (fav) => fav.product_id?._id || fav.product_id
        );
        setFavoriteProductIds(ids);
      })
      .catch(() => {
        // No romper el detalle de producto si falla la carga de favoritos
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const isFavorite = Boolean(
    rawProduct?._id && favoriteProductIds.includes(rawProduct._id)
  );

  const variants = useMemo(() => rawProduct?.variants || [], [rawProduct]);

  const sizeOptions = useMemo(() => {
    const list = [];
    variants.forEach((variant) => {
      if (variant.size && !list.includes(variant.size)) list.push(variant.size);
    });
    return list;
  }, [variants]);

  const colorsForSelectedSize = useMemo(
    () => variants.filter((variant) => variant.size === selectedSize),
    [variants, selectedSize]
  );

  const selectedVariant = useMemo(
    () =>
      colorsForSelectedSize.find((variant) => variant.color === selectedColor) ||
      colorsForSelectedSize[0] ||
      null,
    [colorsForSelectedSize, selectedColor]
  );

  const handleSelectSize = (size) => {
    setSelectedSize(size);

    const stillHasColor = variants.some(
      (variant) => variant.size === size && variant.color === selectedColor
    );

    if (!stillHasColor) {
      const fallbackVariant = variants.find((variant) => variant.size === size);
      setSelectedColor(fallbackVariant?.color || null);
    }
  };

  const product = useMemo(() => {
    if (!rawProduct) return null;

    const images = rawProduct.images?.length
      ? rawProduct.images.map((img) => img.image)
      : [getProductImage(rawProduct, 1400)];

    const hasVariants = variants.length > 0;
    const stock = Number(selectedVariant?.stock || 0);
    const inStock = hasVariants ? stock > 0 : true;
    const materialParts = [selectedVariant?.color, selectedVariant?.fabric || rawProduct.category].filter(
      Boolean
    );

    return {
      id: rawProduct._id,
      name: rawProduct.name || 'Producto Peques',
      category: rawProduct.category || 'Peques',
      price: formatProductPrice(rawProduct.hasActiveOffer ? rawProduct.finalPrice : rawProduct.price),
      hasActiveOffer: Boolean(rawProduct.hasActiveOffer),
      originalPrice: rawProduct.hasActiveOffer ? formatProductPrice(rawProduct.originalPrice) : null,
      discountPercentage: rawProduct.hasActiveOffer ? Math.round(rawProduct.discountPercentage) : null,
      isNew,
      images,
      description: rawProduct.description || 'Producto seleccionado del catalogo Peques.',
      material: materialParts.join(' / ') || 'Producto Peques',
      design: selectedVariant?.design || '',
      inStock,
      stockLabel: !hasVariants ? '' : stock > 0 ? (stock <= 5 ? `Quedan ${stock}` : 'En stock') : 'Agotado',
    };
  }, [rawProduct, variants, selectedVariant, isNew]);

  const handleAddToCart = async () => {
    if (!rawProduct?._id) return;

    if (selectedVariant && Number(selectedVariant.stock || 0) <= 0) {
      toast.error('Esa combinacion de talla y color esta agotada.');
      return;
    }

    try {
      await addItemToCart(rawProduct._id, 1);
      toast.success('Producto agregado al carrito.');
      navigate('/cart');
    } catch (requestError) {
      toast.error(requestError.message);
    }
  };

  const handleToggleFavorite = async () => {
    if (!rawProduct?._id) return;

    if (!isAuthenticated) {
      toast.error('Inicia sesion para guardar tus favoritos.');
      navigate('/login');
      return;
    }

    if (favoriteBusy) return;
    setFavoriteBusy(true);

    try {
      if (isFavorite) {
        await removeFavorite(rawProduct._id);
        setFavoriteProductIds((ids) => ids.filter((id) => id !== rawProduct._id));
        toast.success('Se quito de tus favoritos.');
      } else {
        await addFavorite(rawProduct._id);
        setFavoriteProductIds((ids) => [...ids, rawProduct._id]);
        toast.success('Guardado en tus favoritos.');
      }
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setFavoriteBusy(false);
    }
  };

  return (
    <div className="product-shell">
      <PublicNavbar />

      {loading ? <p className="catalog-status-text product-status-text">Cargando producto...</p> : null}
      {error ? <p className="catalog-status-text product-status-text">{error}</p> : null}
      {!loading && product ? (
        <ProductDetailView
          product={product}
          sizeOptions={sizeOptions}
          selectedSize={selectedSize}
          onSelectSize={handleSelectSize}
          colorsForSelectedSize={colorsForSelectedSize}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          isFavorite={isFavorite}
          favoriteBusy={favoriteBusy}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={handleAddToCart}
          onBack={() => navigate(-1)}
          onOpenStoreSearch={() => navigate('/stores')}
        />
      ) : null}
    </div>
  );
}

export default ProductDetailPage;
