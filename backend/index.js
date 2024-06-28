const express = require('express');
const fs = require('fs');
const session = require('express-session');
const cors = require('cors');
const app = express();
const port = 3001;

const usersFilePath = './users.json';
const productsFilePath = './products.json';

// Middleware do parsowania ciała żądania
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Konfiguracja sesji
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Ustaw na true, jeśli używasz HTTPS
}));

// Funkcja do odczytywania użytkowników z pliku JSON
const readUsersFromFile = () => {
  if (fs.existsSync(usersFilePath)) {
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
  }
  return {};
};

// Funkcja do zapisywania użytkowników do pliku JSON
const writeUsersToFile = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Funkcja do walidacji danych logowania
const validateLogin = (username, password) => {
  const users = readUsersFromFile();
  return users[username] && users[username].password === password;
};

// Endpoint do logowania
app.get('/login/:username/:password', (req, res) => {
  const { username, password } = req.params;

  if (validateLogin(username, password)) {
    const users = readUsersFromFile();
    res.json({ success: true, money: users[username].money });
    console.log("Zalogowano! IP:" + req.ip);
  } else {
    res.json({ success: false });
    console.log("Nie udalo sie zalogowac! IP:" + req.ip);
  }
});

// Endpoint do rejestracji
app.get('/register/:username/:password', (req, res) => {
  const { username, password } = req.params;
  const users = readUsersFromFile();

  if (users[username]) {
    res.send('false'); // Użytkownik już istnieje
  } else {
    users[username] = { password: password, money: 10000 };
    writeUsersToFile(users);
    res.send('true');
  }
});

// Endpoint do pobierania listy produktów
app.get('/productslist', (req, res) => {
  if (fs.existsSync(productsFilePath)) {
    const data = fs.readFileSync(productsFilePath);
    const products = JSON.parse(data);
    res.json(products);
  } else {
    res.status(404).json({ error: 'Products file not found' });
  }
});

// Get all products
app.get('/products', (req, res) => {
    if (fs.existsSync(productsFilePath)) {
        const data = fs.readFileSync(productsFilePath);
        const products = JSON.parse(data);
        res.json(products);
    } else {
        res.status(404).json({ error: 'Products file not found' });
    }
});

// Edit product
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body;

  const data = fs.readFileSync(productsFilePath);
  let products = JSON.parse(data);

  const productIndex = products.findIndex(p => p.id == id);
  
  if (productIndex !== -1) {
    console.log("test");
      // Sprawdź, czy title jest częścią updatedProduct i czy jest różne od oryginalnego title
      if (updatedProduct.title && updatedProduct.title !== products[productIndex].title) {
          // Sprawdź, czy nowy title nie jest już zajęty przez inny produkt
          const newTitleExists = products.some(p => p.title === updatedProduct.title);
          if (newTitleExists) {
              return res.status(400).json({ message: 'New title already exists' });
          }
      }

      // Zaktualizuj title produktu
      products[productIndex].title = updatedProduct.title;

      fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
      res.json(products[productIndex]);
  } else {
      res.status(404).json({ message: 'Product not found' });
  }
});

// Delete product
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    const updatedProduct = req.body;

    const data = fs.readFileSync(productsFilePath);
    let products = JSON.parse(data);

    const productIndex = products.findIndex(p => p.id == id);

    console.log(id);
    console.log(productIndex);

    if (productIndex !== -1) {
        products.splice(productIndex, 1);
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
        res.json({ message: 'Product deleted' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});