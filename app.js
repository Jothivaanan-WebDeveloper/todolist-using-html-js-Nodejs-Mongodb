//jshint esversion:6
const lodash = require('lodash');
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();
//Mongoose Connection
mongoose.connect("mongodb+srv://admin-joe:Jothi%40123@cluster0.htv13wx.mongodb.net/todolistDB",{useNewUrlParser: true}, (err) => {
  if (err) {
      console.log(err);
  }
  else {
    console.log("Connection Successful...");
  }
}); 
//Mongoose Schema Initialization
const itemsSchema = mongoose.Schema({ 
  name: String
});
const listSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
//Mongoose Model Initialization
const Item = mongoose.model("Item",itemsSchema); 
const List = mongoose.model("list",listSchema); 
// Mongoose Document Definition
const item1 = new Item ({
  name: "Welcome to Tododlist"
});
const item2 = new Item ({
  name: "Click + to add new Item"
});
const item3 = new Item ({
  name: "<-- Check here to delete an item"
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Get all list
app.get("/", function(req, res) {
  
  Item.find({}, (err,result) => {
    if (err) {
      console.log(err);
    }
    if (result.length === 0) {
        Item.insertMany([item1, item2, item3], (err) => {
          if (err) {
            console.log(err);
          }
          else {
            console.log("Done");
          }
      });
        res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  });

});

// save new list
app.post("/", function(req, res){

  const item = req.body.newItem;
  const listItem = lodash.capitalize(req.body.list);
  
  const newItem = new Item ({
    name: item
  });

  if (listItem === "Today") {
    newItem.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listItem},(err, result) => {
        result.items.push(newItem);
        result.save();
        res.redirect("/"+listItem);
    });
  }

 

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

// delete a list
app.post("/delete", (req, res) => {
  let deleteItem = req.body.itemId;
  let listName = lodash.capitalize(req.body.listName);

  if (listName === "Today") {
    Item.findByIdAndRemove(deleteItem, (err) => {
      if (err) {
        console.log(err);
      }
      else {
        console.log("Deleted");
      }
  });
  res.redirect("/");
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:deleteItem}}}, (err, result) => {
        if (!err) {
            res.redirect("/"+listName);
        }
    });
  }
  
});

const defaultItems = [item1, item2, item3];
// Custom route
app.get("/:customName", function(req,res){
  const customListName = lodash.capitalize(req.params.customName);
  List.findOne({name: customListName}, (err, result) => {
    if (!result) {
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else {
      res.render("list", {listTitle: customListName, newListItems: result.items});
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});
