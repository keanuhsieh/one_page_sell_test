import React, { useState, useContext } from 'react';
import type { Product } from '../types.ts';
import { AppContext } from '../context/AppContext.ts';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.tsx';

interface ProductSectionProps {
  product: Product;
}

const ProductSection: React.FC<ProductSectionProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const context = useContext(AppContext);

  if (!context) {
    return null;
  }
  const { addToCart, setView } = context;

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    setView('cart');
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center bg-white p-8 rounded-xl shadow-lg">
      {/* Image Carousel */}
      <div className="relative">
        <img
          src={product.images[currentImageIndex]}
          alt={`${product.name} - view ${currentImageIndex + 1}`}
          className="w-full h-auto object-cover rounded-lg shadow-md aspect-video"
        />
        {product.images.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white transition">
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white transition">
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Product Details */}
      <div>
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{product.name}</h2>
        <p className="mt-4 text-lg text-gray-600">{product.description}</p>

        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-700">Specifications:</h3>
          <ul className="mt-2 list-disc list-inside text-gray-600 space-y-1">
            {Object.entries(product.specs).map(([key, value]) => (
                <li key={key}><strong>{key}:</strong> {value}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8 flex items-center justify-between">
          <p className="text-4xl font-bold text-blue-600">
            ${product.price.toLocaleString()}
          </p>
          <div className="flex items-center gap-3">
            <label htmlFor="quantity" className="font-semibold">Qty:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
              className="w-20 p-2 border border-gray-300 rounded-md text-center"
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSection;