import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import "./App.css";
// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe("pk_test_51IzEK9LptijJjsCh3eLpknxC2Ll6Ej1CN71beUPROGkz0ksjUHlDPv1aifOdaGcnvxa6bjK7UzhQmGChW2raijEt00VvJWsQ65");

const ProductDisplay = ({ handleClick,price }) => (
  <section>
    <p>
      <img
        src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/1200px-Ethereum-icon-purple.svg.png'
        alt="1 ETH"
        />
        <h2>1 ETH = {price}</h2>
        </p>

    <button type="button" id="checkout-button" role="link" onClick={handleClick}>
      Checkout
    </button>
  </section>
);

const Message = ({ message }) => (
  <section>
    {message}
  </section>
);


// Note: the empty deps array [] means
// this useEffect will run once
// similar to componentDidMount()
  
  export default function App() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [ethPrice, setPrice] = useState(0);
  const [message, setMessage] = useState("");

const getEthPrice = ()=>{
  fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD")
    .then(res => res.json())
    .then(
      (result) => {
        const price = result.USD
        setIsLoaded(true);
        setPrice(price);
        console.log(price)
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        setIsLoaded(true);
        setError(error);
      }
      )
}
getEthPrice()
setInterval(() => {
  
  getEthPrice()
}, 5000);
  useEffect(() => {
    
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setMessage( <section>
        <div>
          
                <p>
                  Order Placed, Please confirm your Ethereum address for deposit.
                </p>
                <a href='http://localhost:3000' style={{ textDecoration: 'none', color:'white' }}> 
                <button type="button" id="checkout-button" role="link">
                Go Back to Cash 4 ETH
              </button>
                </a>
        </div>
                </section>);
    }

    if (query.get("canceled")) {
      setMessage(
        <section>
<div>
  
        <p>
          Order canceled, we are always here for you.
        </p>
        <a href='http://localhost:3000' style={{ textDecoration: 'none', color:'white' }}> 
        <button type="button" id="checkout-button" role="link">
        Go Back to Cash 4 ETH
      </button>
        </a>
</div>
        </section>
      );
    }
  }, []);

  const handleClick = async (event) => {
    const stripe = await stripePromise;

    const response = await fetch("/create-checkout-session", {
      method: "POST",
    });

    const session = await response.json();

    
    // When the customer clicks on the button, redirect them to Checkout.
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
    
    console.log(session)
    
    if (result.error) {
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer
      // using `result.error.message`.
    }
  };

  return message ? (
    <Message message={message} />
  ) : (
    <ProductDisplay handleClick={handleClick} price={ethPrice}/>
  );
}
