require('dotenv').config()
const stripe = require('stripe')(process.env.SK);
const express = require('express');
const app = express();
app.use(express.static('.'));
const fetch = require('node-fetch');

async function get_request(uri){
  const url = uri
  const res = await fetch(url);
  const data = await res.json();//assuming data is json
  const price = JSON.stringify(data.USD)
  return price
}


const YOUR_DOMAIN = 'http://localhost:3000/checkout';

app.post('/create-checkout-session', async (req, res) => {
  const ok = await Promise.resolve(get_request("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD"))
  var number =await parseInt(ok * 100)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: '1 Etherum =',
            images: ['https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/1200px-Ethereum-icon-purple.svg.png'],
          },
          unit_amount: number,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });
  console.log(session)
  //TODO send this back as encrypted JWT to confirm transaction with stripe API in W3 ETH sender
  res.json({ id: session.id });
});

app.listen(4242, () => console.log('Running on port 4242'));