import React, { useEffect, useState } from "react";
import { fetchShopifyProducts } from "../../api/getProducts";
import { ProductCard } from "../ProductCard/ProductCard";
import "./ProductList.css";

interface Product {
  id: string;
  title: string;
  description: string;
  images: {
    edges: {
      node: {
        src: string;
      };
    }[];
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShopifyProducts()
      .then((fetchedProducts) => {
        setProducts(fetchedProducts);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) {
    return <p>Error loading products: {error}</p>;
  }

  return (
    <>
      <h1 className="page-title">This is a page title</h1>
      <div className="product-list">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              description={product.description}
              imageSrc={product.images.edges[0]?.node.src || ""}
              price={{
                amount: product.priceRange.minVariantPrice.amount,
                currencyCode: product.priceRange.minVariantPrice.currencyCode,
              }}
            />
          ))
        ) : (
          <p>No products found</p>
        )}
      </div>
    </>
  );
};
