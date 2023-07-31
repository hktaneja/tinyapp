const express = require("express");
const cookieParser = require('cookie-parser'); // Require cookie-parser
const bcrypt = require("bcryptjs");

const app = express();
app.use(cookieParser()); // Use cookie-parser as middleware

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//users database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

//urls database
/*const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};*/

//Express library to translate or parse the body. 
app.use(express.urlencoded({ extended: true }));

//Generate a Random Short URL ID
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    //get a random number in the range of [0, characters.length] and rounds down a given number to the nearest integer
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

// User LookUp Function
const getUserById = function (id) {
  for (const key in users) {
    if (users[key].id  === id ) {
      return users[key]; // Return the entire user object if found
    }
  }
  return null; // Return null if not found
};
// Email LookUp Function
const getUserByEmail = function (email) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key]; // Return the entire user object if found
    }
  }
  return null; // Return null if not found
};

// URLs of logged in user
const urlsForUser = function (user) {
  const userURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === user.id) {
      userURLs[key] = urlDatabase[key];
    }
  }
  return userURLs;
}

// route definitions 
app.get("/", (req, res) => {
  res.send("Welcome!");
});

app.get("/login", (req, res) => {
  if(req.cookies.user_id) {
    let  templateVars = {};
    const user = getUserById(req.cookies.user_id)
    templateVars = { user: user, urls: urlDatabase };
    res.render("urls_index", templateVars);  
  } else {
      const templateVars = { user: users[req.cookies.user_id]};
      res.render("login", templateVars); 
  } 
});


app.get("/register",(req,res)=>{
  if(req.cookies.user_id) {
    let  templateVars = {};
    const user = getUserById(req.cookies.user_id)
    templateVars = { user: user, urls: urlDatabase };
    res.render("urls_index", templateVars);    
  } else { 
    const templateVars = { user: users[req.cookies.user_id]};
    res.render("registration", templateVars); 
  }
});

app.get("/urls", (req, res) => {
  let  templateVars = {}; 
  const user = getUserById(req.cookies.user_id)
  if (user) {    
    const userURLs = urlsForUser(user);    
    templateVars = { user: user, urls: userURLs };
    res.render("urls_index", templateVars);
  } else {
      templateVars = { user: null, urls: userURLs };
      res.redirect("/login");
  }
});

app.get("/urls/new", (req, res) => {
  let  templateVars = {};
  const user = getUserById(req.cookies.user_id)
  if (user) {
    templateVars = { user: user};
    res.render("urls_new", templateVars);
  } else {
    templateVars = { user: null};
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  let  templateVars = {};
  const user = getUserById(req.cookies.user_id);
  const url = urlDatabase[req.params.id];
  if (user && url && url.userID === user.id) {
    templateVars = { 
      user: user, 
      id: req.params.id,
      longURL:url.longURL
    };
    res.render("urls_show", templateVars);
  } else {
    templateVars = { user: null,id: req.params.id, longURL:url.longURL};
    res.status(400).send("URL doesn't exist or you don't have permission.");
  }  
});

app.get("/u/:id", (req, res) => {  
  const longURL = urlDatabase[req.params.id];  
  res.redirect(longURL);
});

// handle POST request for new id
app.post("/urls", (req, res) => {
  const user = getUserById(req.cookies.user_id);
  if (user) {
    const newId = generateRandomString();
    urlDatabase[newId] = {
      longURL: req.body.longURL,
      userID: user.id,
    };
    res.redirect(`/urls/${newId}`);
  }
  else {
    res.status(400).send("Please Login first.");
  }  
});

// handle POST request for delete
app.post("/urls/:id/delete", (req, res) => { 
  const idToBeDeleted = req.params.id;  
  delete urlDatabase[idToBeDeleted];   
  res.redirect("/urls");
});

// handle POST request for edit link
app.post("/urls/:id", (req, res) => { 
  const idToBeEdited = req.params.id;
  urlDatabase[idToBeEdited].longURL = req.body.longURL;
  res.redirect("/urls");
});

// handle POST request for login
app.post("/login", (req, res)=>{
  const userEmail = req.body.email; 
  const user = getUserByEmail(req.body.email);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.cookie("user_id", user.id); // Store the user id in the cookie
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid email or password.");
  }
})

// handle POST request for register
app.post("/register", (req, res)=>{
  if (req.body.email.trim() !== '' && req.body.password.trim() !== '') {
    const user = getUserByEmail(req.body.email.trim());
    if (user) {
      res.status(400).send("This email already exists.");      
    } else {
      const newUserId = generateRandomString();
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);
      const newUser = {
        id: newUserId,
        email: req.body.email,
        password: hashedPassword,
      };
      users[newUserId] = newUser;
      res.cookie("user_id", newUserId);
      res.redirect("/urls");
    }
  } else {
    res.status(400).send("Email and password cannot be empty.");
  }  
});
// handle POST request for logout
app.post("/logout", (req, res)=>{
  res.clearCookie('user_id');
  res.redirect("/login");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});