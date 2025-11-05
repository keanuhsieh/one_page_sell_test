import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  console.log("[ecpay-post-proxy] Received POST request from ECPay.");
  
  // Log the incoming POST request from ECPay for debugging
  // Note: formData() can only be called once. If you need to process the data later,
  // store it in a variable after calling formData().
  const formData = await req.formData();
  const data = Object.fromEntries(formData.entries());
  console.log("[ecpay-post-proxy] ECPay POST data:", JSON.stringify(data, null, 2));

  // Construct the client-side URL with query parameters
  // We can pass some ECPay data as query params if needed, but for now,
  // just the 'from_ecpay' flag is enough to trigger the client-side logic.
  // You might want to pass specific transaction details here if your frontend needs them immediately.
  const clientRedirectUrl = `${context.site.url}/?from_ecpay=1`;

  // Perform a client-side redirect (HTTP 302) to the SPA's URL.
  // This converts the POST from ECPay into a GET for the browser,
  // allowing the Netlify static rewrite rules and the client-side React app to handle it.
  return new Response(null, {
    status: 302,
    headers: {
      Location: clientRedirectUrl,
    },
  });
};
