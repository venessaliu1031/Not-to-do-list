//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://venessaliu:lst1031DB@cluster0.3nljc.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = new mongoose.Schema ({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name: "Welcome to your to-do list :)"
});

const item2 = new Item ({
  name: "Keep up the good works!"
});


const defaultItems = [item1, item2];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = new mongoose.model("List", listSchema);




app.get("/", function(req, res) {


// const day = date.getDate();

  Item.find({}, function(err, founditems){
    if (founditems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted");
        }
      });
      res.redirect("/")
    } else {
      res.render("list", {listTitle: "Today", newListItems: founditems});
    }

  })



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }





  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (foundList) {
      // show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      console.log(foundList);
    } else {
      // creat a new list
      const list = new List ({
        name: customListName,
        items: defaultItems
      });

      list.save();

      res.redirect("/"+ customListName);

    }
  })



})

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("deleted");
        res.redirect("/")
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
      if (!err) {
        res.redirect("/"+listName);
      }
    })
  }




});



// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
