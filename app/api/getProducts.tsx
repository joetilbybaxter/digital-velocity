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
  variants: {
    edges: {
      node: {
        id: string; // Variant ID
      };
    }[];
  };
}

interface ShopifyApiResponse {
  data: {
    products: {
      edges: {
        node: Product;
      }[];
    };
  };
}

const SHOPIFY_API_URL =
  "https://velocity-tech-test.myshopify.com/api/2023-01/graphql.json";
const STOREFRONT_ACCESS_TOKEN = "17f299654847e46fb1e78e0fd590a0e8";

const PRODUCTS_QUERY = `
{
  products(first: 10) {
    edges {
      node {
        id
        title
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          edges {
            node {
              src
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
}`;

// Shopify API Fetch function
export async function fetchShopifyProducts(): Promise<Product[]> {
  try {
    const response = await fetch(SHOPIFY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: PRODUCTS_QUERY }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch products from Shopify API: ${response.statusText}`
      );
    }

    const data: ShopifyApiResponse = await response.json();
    if (data && data.data && data.data.products) {
      // Return the list of products
      return data.data.products.edges.map((edge) => edge.node);
    }

    throw new Error("No products found in the API response");
  } catch (error) {
    console.error("Error fetching Shopify products:", error);
    throw error;
  }
}
