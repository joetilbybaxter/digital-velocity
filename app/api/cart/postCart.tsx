// app/routes/cart.tsx
import { ActionFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";

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

export let action: ActionFunction = async ({ request }) => {
  const storeUrl = process.env.SHOPIFY_STORE_URL!;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN!;

  const formData = await request.formData();
  const variantId = formData.get("variantId");
  const quantity = formData.get("quantity");

  let cartId = ""; 
  
  if (!cartId) {
    cartId = await createCart(storeUrl, accessToken); // Create a new cart if no cartId
  }

  const response = await fetch(`https://${storeUrl}/api/2023-07/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": accessToken,
    },
    body: JSON.stringify({
      query: `
        mutation {
          cartLinesAdd(cartId: "${cartId}", lines: [{ quantity: ${quantity}, merchandiseId: "${variantId}" }]) {
            cart {
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
    throw new Error("Failed to add item to cart.");
  }

  const data = await response.json();
  return redirect("/cart");
};

// Form component to add items to the cart
export default function Cart() {
  const data = useLoaderData();

  return (
    <div>
      <h1>Cart</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <Form method="post">
        <input type="hidden" name="variantId" value="PRODUCT_VARIANT_ID" />
        <label>
          Quantity:
          <input type="number" name="quantity" min="1" defaultValue="1" />
        </label>
        <button type="submit">Add to Cart</button>
      </Form>
    </div>
  );
}
