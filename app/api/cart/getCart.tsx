import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// Utility function to create a new cart if one doesn't exist
const createCart = async (storeUrl: string, accessToken: string) => {
  const response = await fetch(`https://${storeUrl}/api/2023-07/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": accessToken,
    },
    body: JSON.stringify({
      query: `
        mutation {
          cartCreate {
            cart {
              id
            }
          }
        }
      `,
    }),
  });

  const result = await response.json();
  const newCartId = result.data.cartCreate.cart.id;

  return newCartId;
};

// Define your loader function to fetch cart data
export let loader: LoaderFunction = async ({ request }) => {
  const storeUrl = process.env.SHOPIFY_STORE_URL!;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN!;


  let cartId = "your_existing_cart_id"; 
  
  if (!cartId) {
    // Create a new cart if no cartId is found
    cartId = await createCart(storeUrl, accessToken);
  }

  // Fetch the cart data with the cartId
  const response = await fetch(`https://${storeUrl}/api/2023-07/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": accessToken,
    },
    body: JSON.stringify({
      query: `
        {
          cart(id: "${cartId}") {
            id
            lines(first: 10) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      priceV2 {
                        amount
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch cart data.");
  }

  const data = await response.json();
  return json(data);
};

export default function Cart() {
  const data = useLoaderData();

  return (
    <div>
      <h1>Cart</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
