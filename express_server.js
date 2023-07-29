const express = require("express");
const cookieParser = require('cookie-parser'); // Require cookie-parser

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

//urls database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

// route definitions 
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register",(req,res)=>{ 
  const templateVars = { user: users[req.cookies.user_id]};
  res.render("login", templateVars); 
});

app.get("/urls", (req, res) => {
  let  templateVars = {};
  for(let key in users) {
    if(key === req.cookies["user_id"]) {
      templateVars = { user: users[req.cookies.user_id], urls: urlDatabase};
      break;
    }
    else {
      templateVars = { user: {},urls: urlDatabase};
    }
   }
 res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let  templateVars = {};
  for(let key in users) {
    if(key === req.cookies["user_id"]) {
      templateVars = { user: users[req.cookies.user_id] };
      break;
    }
    else {
      templateVars = {user: {}};
    }
   }
  res.render("urls_new", templateVars); 
  
});

app.get("/urls/:id", (req, res) => {
  let  templateVars = {};
  for(let key in users) {
    if(key === req.cookies["user_id"]) {
      templateVars = { user: users[req.cookies.user_id],id: req.params.id, longURL:urlDatabase[req.params.id]};       
      break;
    }
    else {
      templateVars = { user: {},id: req.params.id, longURL:urlDatabase[req.params.id]};
    }
   }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


// handle POST request for new id
app.post("/urls", (req, res) => {
  const newId = generateRandomString();
  urlDatabase[newId] = req.body.longURL;
  res.redirect(`/urls/${newId}`);
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
  urlDatabase[idToBeEdited] = req.body.longURL;
  res.redirect("/urls");
});

// handle POST request for login
app.post("/login", (req, res)=>{
  res.cookie("user_id", req.body.username);
  res.redirect("/urls");
})
// handle POST request for register

app.post("/register", (req, res)=>{
  const newUserId = generateRandomString();
  const newUser = {
    id: newUserId,
    email: req.body.email,
    password: req.body.password,
  };
  users[newUserId] = newUser;
  res.cookie("user_id", newUserId);
  res.redirect("/urls");
})
// handle POST request for logout
app.post("/logout", (req, res)=>{
  res.clearCookie('user_id');
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});