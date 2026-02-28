export default async function handler(req, res) {

  // 🟢 1. Snipcart hace GET para saber qué métodos de pago hay
  if (req.method === "GET") {
    return res.status(200).json({
      paymentMethods: [
        {
          id: "mercadopago",
          name: "Mercado Pago"
        }
      ]
    });
  }

  // 🟢 2. Snipcart hace POST para crear el pago
  if (req.method === "POST") {

    try {

      const order = req.body;

      const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          items: order.content.items.map(item => ({
            title: item.name,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            currency_id: "ARS"
          })),
          back_urls: {
            success: "https://tusitio.com/success",
            failure: "https://tusitio.com/failure",
            pending: "https://tusitio.com/pending"
          },
          auto_return: "approved"
        })
      });

      const data = await mpResponse.json();

      return res.status(200).json({
        paymentSessionId: data.id
      });

    } catch (error) {
      return res.status(500).json({
        error: "Error creando preferencia en Mercado Pago",
        details: error.message
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
