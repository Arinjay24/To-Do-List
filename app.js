//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost: 27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemschema = {
  name: String
};

const Item = mongoose.model("Item", itemschema);

const item1 = new Item({
  name: "Welcome to your todolist! "
});

const item2 = new Item({
  name: "Hit the + button to add a new item "
});

const item3 = new Item({
  name: "<-- Hit this to delete an item "
});

const defaultitem = [item1, item2, item3];

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {
  //  const day = date.getDate();

  Item.find({}, function(err, founditem) {
    if (err)
      console.log(err);
    else {
      if (founditem.length == 0) {

        Item.insertMany(defaultitem, function(err) {
          if (err)
            console.log(err);
          else
            console.log("successful");
        });
        res.redirect("/");
      }
       else {

        console.log(founditem);
        res.render("list", {
          listTitle: "Today",
          newListItems: founditem
        });
      }


    }
  });

});

app.post("/", function(req, res) {

  const itemname = req.body.newItem;
  const listname = req.body.list;

  const newitem = new Item({
      name: itemname
  });

  if(listname==="Today")
  {
    newitem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(newitem);
      foundlist.save();
      res.redirect("/"+listname);
    });
  }


});

app.post("/delete",function(req,res){
  const checkeditemid=_(req.body.checkbox);
    const customlistname=(req.body.listname);

    if(customlistname==="Today")
  {
    Item.findByIdAndRemove(checkeditemid,function(err){
      if(!err)
      {
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  }
  else
  {
    List.findOneAndUpdate({name:customlistname} , {$pull: {items : {_id:checkeditemid}}}, function(err,founditem){
      if(!err)
      {
        res.redirect("/"+customlistname);
      }
    });
  }


});

const listschema={
  name: String,
  items: [itemschema]
};

const List= mongoose.model("List" , listschema);

app.get("/:customlistname" , function(req,res){
  const customlistname=_.capitalize(req.params.customlistname);

List.findOne({name:customlistname},function(err,foundlist){
  if(!err)
  {
    if(!foundlist)
  {
    //create a new list
    const list=new List({
      name: customlistname,
      items:defaultitem
    });
    list.save();
    res.redirect("/"+customlistname);
  }
  else
  {
    //show existing list
    res.render("list", {
      listTitle: foundlist.name,
      newListItems: foundlist.items
    });
  }
  }
});


} );

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
