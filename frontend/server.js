const express = require('express');
const session = require('express-session');
const path = require('path');
const hbs = require('hbs');
const alert = require('alert');
const axios = require('axios'); // Do komunikacji z API


let products = [];

const app = express();
const port = 3000;


hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
      case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
      case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
          return options.inverse(this);
  }
});

// Rejestracja katalogu z częściowymi szablonami
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// Konfiguracja silnika szablonów Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Obsługa statycznych plików (CSS, JS, obrazy itp.)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware do parsowania danych JSON i danych z formularzy
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware sesji
app.use(session({
  secret: 'KajetanCiesielski2024',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Ustaw na true, jeśli używasz HTTPS
}));

// Middleware do sprawdzania logowania
function checkAuth(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Strona główna
app.get('/', checkAuth, (req, res) => {
  res.render('index', {
    username: req.session.username,
    money: req.session.money,
    cartItems: req.session.cart.length,
    products: products
  });
});

// Strona logowania
app.get('/login', (req, res) => {
  res.render('login', { error: req.session.error });
  delete req.session.error; // Usuwanie błędu po renderowaniu
});

// Obsługa logowania
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const productsResponse = await axios.get('http://localhost:3001/productslist');
    products = productsResponse.data; // Assign the fetched products to the products array

    if (username && password) {
      const response = await axios.get(`http://localhost:3001/login/${username}/${password}`);
      if (response.data.success === true) {
        req.session.loggedIn = true;
        req.session.username = username;
        req.session.money = response.data.money;
        req.session.cart = []; // Koszyk
        res.redirect('/');
      } else {
        req.session.error = 'Błędny login lub hasło.';
        res.redirect('/login');
      }
    } else {
      req.session.error = 'Proszę podać login i hasło.';
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    req.session.error = 'Błędny login lub hasło.';
    res.redirect('/login');
  }
});

app.post('/register', async (req, res) => {
  const { registerUsername, registerPassword } = req.body;

  if (registerUsername && registerPassword) {
    try {
      const response = await axios.get(`http://localhost:3001/register/${registerUsername}/${registerPassword}`);
      if (response.data === true) {
        res.redirect('/login');
        alert.toast("Zarejestrowano konto", registerUsername)
      } else {
        res.json({ success: false, message: 'Rejestracja nie powiodła się.', redirectUrl: '/login' });
      }
    } catch (error) {
      console.error('Błąd podczas rejestracji:', error);
      res.json({ success: false, message: 'Błąd podczas rejestracji.', redirectUrl: '/login' });
    }
  } else {
    res.json({ success: false, message: 'Proszę wprowadzić login i hasło.', redirectUrl: '/login' });
  }
});

app.post('/add-to-cart', (req, res) => {
  let productId = req.body.id;
  productId = parseInt( productId, 10);

  console.log(productId);
  
  const product = products.find(p => p.id === productId); // Find the product by its id

  console.log(product);
  console.log(req.session.money);
  console.log(product.price);

  if (product && req.session.money >= product.price) {
    console.log("idzie dalej...");
    const cartItem = req.session.cart.find(item => item.id == productId);
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      req.session.cart.push({ ...product, quantity: 1 });
    }
    req.session.money -= product.price;
    res.json({
      success: true,
      money: req.session.money,
      cartItems: req.session.cart.length
    });
  } else {
    res.json({
      success: false,
      message: 'Nie masz wystarczająco pieniędzy, aby kupić ten produkt.'
    });
  }
});

// Endpoint do usuwania produktów z koszyka
app.post('/remove-from-cart', (req, res) => {
  let productId = req.body.id;
  productId = parseInt( productId, 10);
  const cart = req.session.cart;
  const productIndex = cart.findIndex(item => item.id == productId);

  if (productIndex > -1) {
    const product = cart[productIndex];
    let newQuantity = 0;
    if (product.quantity > 1) {
      product.quantity -= 1;
      req.session.money += product.price;
      newQuantity = product.quantity;
    } else {
      req.session.money += product.price;
      cart.splice(productIndex, 1);
    }
    res.json({
      success: true,
      money: req.session.money,
      cartItems: cart.length,
      quantity: newQuantity, // Zwracamy aktualną ilość lub 0, jeśli produkt został całkowicie usunięty
      totalPrice: cart.reduce((total, item) => total + item.price * item.quantity, 0)
    });
  } else {
    res.json({
      success: false,
      message: 'Produkt nie został znaleziony w koszyku.'
    });
  }
});

app.get('/cart', (req, res) => {
  const cart = req.session.cart;
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  res.json({
    success: true,
    cart: cart,
    totalPrice: totalPrice
  });
});

// Wylogowanie
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.redirect('/login');
  });
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Serwer działa na http://localhost:${port}`);
});