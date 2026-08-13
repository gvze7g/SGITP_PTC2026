import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import ProductDetailView from '../../components/products/ProductDetailView';
import PublicNavbar from '../../components/home/PublicNavbar';
import { addItemToCart } from '../../services/cartService';
import {
  formatProductPrice,
  getCatalogProductById,
  getCatalogProducts,
  getProductImage,
  getProductMaterial,
} from '../../services/catalogService';

function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [selectedSize, setSelectedSize] = useState('0-3M');
  const [rawProduct, setRawProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const request = productId
      ? getCatalogProductById(productId)
      : getCatalogProducts().then((products) => products?.[0] || null);

    request
      .then((data) => {
        if (isMounted) setRawProduct(data);
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

  const product = useMemo(() => {
    if (!rawProduct) return null;

    return {
      id: rawProduct._id,
      name: rawProduct.name || 'Producto Peques',
      price: formatProductPrice(rawProduct.price),
      image: getProductImage(rawProduct, 1400),
      description: rawProduct.description || 'Producto seleccionado del catalogo Peques.',
      notes: [
        rawProduct.category ? `Categoria: ${rawProduct.category}` : 'Categoria Peques',
        getProductMaterial(rawProduct),
        `${rawProduct.variants?.length || 0} variantes disponibles`,
      ],
      sizes: rawProduct.variants?.map((variant) => variant.size).filter(Boolean),
    };
  }, [rawProduct]);

  const handleAddToCart = async () => {
    if (!rawProduct?._id) return;

    try {
      await addItemToCart(rawProduct._id, 1);
      toast.success('Producto agregado al carrito.');
      navigate('/cart');
    } catch (requestError) {
      toast.error(requestError.message);
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
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          onAddToCart={handleAddToCart}
          onBack={() => navigate(-1)}
          onOpenStoreSearch={() => navigate('/stores')}
        />
      ) : null}
    </div>
  );
}

export default ProductDetailPage;
