import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

const url = "http://localhost:8080";
const Product = ({ token, resetStates, favorite, setFavoriteProducts }) => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState(
    "Invalid information, check your input!"
  );
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const timerId = setTimeout(() => setShowMessage(false), 5000);
    //Clean up callback
    return () => clearTimeout(timerId);
  }, [showMessage]);

  const logout = async () => {
    await fetch(url + "/user/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token,
      },
    });
    resetStates();
  };

  const createProduct = (input) => {
    fetch(url + "/product/create", {
      method: "PUT",
      responseType: "text",
      headers: {
        "Content-Type": "application/json",
        token,
      },
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        price: input.price,
      }),
    })
      .then((response) => {
        if (response.ok) {
          setProduct(product);
        }
        return response.text();
      })
      .then((data) => {
        setMessage(data);
        setShowMessage(true);
      })
      .catch((error) => {
        return error.message;
      });
  };

  async function getProducts() {
    await fetch(url + "/product/all", {
      method: "Get",
      headers: {
        token: location.state.usertoken,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      });
  }
  useEffect(() => {
    getProducts();
  }, []);

  const addToFavorite = () => {
    fetch(url + "/product/add-favorite", {
      method: "PUT",
      responseType: "text",
      headers: {
        "Content-Type": "text/plain",
        token,
      },
      body: product.name,
    })
      .then((response) => {
        if (!response.ok) throw new Error(message);
        return response.text();
      })
      .then((data) => {
        setFavoriteProducts(product);
      })
      .catch((error) => {
        return error.message;
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product.name || !product.description || !product.price) return;
    createProduct(product);
  };

  const changeProductData = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  return (
    <>
      <ul>
        {products.map((product, index) => {
          return (
            <li key={index}>
              Name: {product.name} | Price: {product.price}
            </li>
          );
        })}
      </ul>
      <div className="container">
        <div className="product">
          <form onSubmit={handleSubmit}>
            <h3
              style={{
                marginLeft: "3em",
              }}
            >
              Product info:
            </h3>
            <input
              type="text"
              className="input"
              name="name"
              value={product.name}
              placeholder="Product Name"
              style={{ background: "white", width: "100px" }}
              required
              onChange={changeProductData}
            />
            <input
              type="text"
              className="input"
              name="description"
              value={product.description}
              placeholder="Description"
              style={{ background: "white", width: "100px" }}
              required
              onChange={changeProductData}
            />
            <input
              type="text"
              className="input"
              name="price"
              pattern="[0-9]*"
              value={product.price}
              placeholder="Price"
              style={{ background: "white", width: "100px" }}
              required
              onChange={changeProductData}
            />
            <button
              style={{ background: "red", borderRadius: "10px" }}
              onClick={() => {
                let price = Number.parseInt(product.price);
                if (Number.isNaN(price)) {
                  alert("Priset måste vara ett nummer.");
                  return;
                }
                fetch(url + "/product/create", {
                  method: "PUT",
                  headers: {
                    token: location.state.usertoken,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name: product.name,
                    price: price,
                  }),
                }).then((response) => {
                  getProducts();
                });
              }}
            >
              Create Produkt
            </button>
          </form>
          <button
            style={{ background: "red", borderRadius: "10px" }}
            onClick={() => logout()}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Product;
