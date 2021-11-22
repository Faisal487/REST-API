require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("DB connected"))
  .catch(()=>console.log("Connection failed!",err))

//Defining Schema

const articleSchema = new mongoose.Schema({
  title: String,
  content: String
});

// Compiling our Schema into a Model

const Article = mongoose.model("Article", articleSchema);

////////////// Requests Targetting all Articles //////////////////////

app
  .route("/articles")

  .get((req, res) => {
    //Express provides us this shortcut
    Article.find(function (err, foundArticles) {
      // to not repeat the same /articles route averytime..
      if (!err) {
        res.send(foundArticles);
      } else {
        res.send(err);
      }
    });
  })

  .post((req, res) => {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });
    newArticle.save((err) => {
      if (!err) {
        res.send("Successfully added a new article.");
      } else {
        res.send(err);
      }
    });
  })

  .delete((req, res) => {
    Article.deleteMany(function (err) {
      if (!err) {
        res.send("Successfully deleted all the articles.");
      } else {
        res.send(err);
      }
    });
  });

////////////// Requests Targetting A Specific Articles //////////////////////

app
  .route("/articles/:articleTitle")

  // req.params.articleTitle = "Jack Baeur"

  .get((req, res) => {
    Article.findOne({ title: req.params.articleTitle }, (err, foundArticle) => {
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send("No articles matching that title was found.");
      }
    });
  })

  .put((req, res) => {
    Article.update(
      { title: req.params.articleTitle },
      { title: req.body.title, content: req.body.content },
      { overwrite: true },
      function (err) {
        if (!err) {
          res.send("Successfully updated article.");
        } else {
          res.send(err);
        }
      }
    );
  })

  .patch((req, res) => {
    Article.update(
      { title: req.params.articleTitle },
      { $set: req.body }, // Dynamic so that client can update whatevar they want.
      function (err) {
        // req.body will the whole object that client wants to update.
        if (!err) {
          res.send("Successfully updated article.");
        } else {
          res.send(err);
        }
      }
    );
  })

  .delete((req, res) => {
    Article.deleteOne({ title: req.params.articleTitle }, function (err) {
      if (!err) {
        res.send("Successfully deleted the corresponding article.");
      } else {
        res.send(err);
      }
    });
  });

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`App is ready on port ${port}`);
});