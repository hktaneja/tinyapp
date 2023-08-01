const { getUserByEmail, generateRandomString, urlsForUser, getUserById} = require('./helpers');

const express = require("express");
var cookieSession = require('cookie-session') // Require cookie-session
const bcrypt = require("bcryptjs");
const { users, urlDatabase } = require('./database.js');

const app = express();
// Use cookie-session as middleware

app.use(
  cookieSession({
    name: 'session',
    keys: ['e1d50c4f-538a-4682-89f4-c002f10a59c8', '2d310699-67d3-4b26-a3a4-1dbf2b67be5c'],
  })
);

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//Express library to translate or parse the body. 
app.use(express.urlencoded({ extended: true }));


// route definitions 
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
    let  templateVars = {};
    let  userURLs ={};
    const user = getUserById(req.session.user_id);
    if(req.session.user_id && user) {
      userURLs = urlsForUser(user);
      templateVars = { user: user, urls: userURLs };
      res.render("urls_index", templateVars);  
  } else {
      const templateVars = { user: users[req.session.user_id]};
      res.render("login", templateVars); 
  } 
});


app.get("/register",(req,res)=>{  
    let  templateVars = {}; 
    let  userURLs ={};  
    const user =  getUserById(req.session.user_id);
    if(req.session.user_id && user) {
      userURLs = urlsForUser(user);   
      templateVars = { user: user, urls: userURLs };
      res.render("urls_index", templateVars);    
    } else { 
    const templateVars = { user: users[req.session.user_id]};
    res.render("registration", templateVars); 
  }
});

app.get("/urls", (req, res) => {
  let  templateVars = {}; 
  let  userURLs ={};
  const user = getUserById(req.session.user_id)
  if (user) {    
    userURLs = urlsForUser(user);    
    templateVars = { user: user, urls: userURLs };
    res.render("urls_index", templateVars);
  } else {
      res.status(400).send("You need to be logged in to view this page.");
  }
});

app.get("/urls/new", (req, res) => {
  let  templateVars = {};
  const user = getUserById(req.session.user_id)
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
  const user = getUserById(req.session.user_id);
  const url = urlDatabase[req.params.id];
  if (user) {
    if (url && url.userID === user.id) {
      templateVars = { 
        user: user, 
        id: req.params.id,
        longURL:url.longURL
      };
      res.render("urls_show", templateVars);
    } else {
        res.status(400).send("URL doesn't exist or you don't have permission.");
    } 
  } else {
    res.status(400).send("Please Login first.");
  }
     
});

app.get("/u/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  if (url) {
    const longURL = url.longURL;
    res.redirect(longURL);
  } else {
      res.status(400).send("URL not found");
  }
});

// handle POST request for new id
app.post("/urls", (req, res) => {
  const user = getUserById(req.session.user_id);
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
  const user = getUserByEmail(req.body.email, users);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid email or password.");
  }
})

// handle POST request for register
app.post("/register", (req, res)=>{
  if (req.body.email.trim() !== '' && req.body.password.trim() !== '') {
    const user = getUserByEmail(req.body.email.trim(), users);
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
      req.session.user_id = newUserId;
      res.redirect("/urls");
    }
  } else {
    res.status(400).send("Email and password cannot be empty.");
  }  
});
// handle POST request for logout
app.post("/logout", (req, res)=>{
  req.session = null;
  res.redirect("/login");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});