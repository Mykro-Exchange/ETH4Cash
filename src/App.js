import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import "./App.css";
import env from "react-dotenv";
const axios = require('axios').default;


const stripePromise = loadStripe(env.PK);

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


const jwt = 'secret'
let iv = 'noethaddyetgiven'

const ethAddressSubmit =  async ()=>{
    try {
        const resp = await axios.get(`http://127.0.0.1:5000/send_eth/${iv}/${jwt}`);
        console.log(resp.data);
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};

  export default function App() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  // const [items, setItems] = useState([]);
  const [ethPrice, setPrice] = useState(2569.42);
  const [message, setMessage] = useState("");
  const [input, setInput] = useState(''); 

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
      (error) => {
        setIsLoaded(true);
        setError(error);
      }
      )
}
const eth_address_input = (evt) => { 
  let inputVal = evt.target.value
  setInput(inputVal)
  iv = inputVal
  console.log(iv)
}



  useEffect(() => {
    getEthPrice()
      const interval = setInterval(() => getEthPrice(), 2000);
     
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      clearInterval(interval);

      setMessage( <section>
                  <label>

                  {input}
                  </label>
                <p>
                  Order Placed, Please confirm your Ethereum address for deposit.
                  <input  onChange={eth_address_input} />
                </p>
                <button type="button" id="checkout-button" onClick={ethAddressSubmit}>
                Go Back to Cash 4 ETH
              </button>
                </section>);
    }

    if (query.get("canceled")) {
      clearInterval(interval);

      setMessage(
        <section>
        <p>
          Order canceled, we are always here for you.
        </p>
        <a href='http://localhost:3000' style={{ textDecoration: 'none', color:'white' }}> 
        <button type="button" id="checkout-button" role="link">
        Go Back to Cash 4 ETH
      </button>
        </a>
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
