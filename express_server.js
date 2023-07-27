const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };  
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id]};
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
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});