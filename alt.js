var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazondb"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) {
    throw err;
  }
  else {
    console.log("connected as id: " + connection.threadId + "\n=================");
    //runApp function  
    startApp();
  }
});

//global variables used across functions 
var saleItems; //the object to show the user the available items for sale 
//var product_id;// the id the user chooses

//get app to run 
function startApp() {
  connection.query("SELECT * FROM products", function (err, res) {
    if(err) throw err;
    saleItems = res;
    // show table 
    console.table("\n");
    console.table(saleItems);
    console.table("\n");
    // wait .5 sec then prompt  
    setTimeout(function () { promptSale(res)}, 500);
  });
  // run the start function after the connection is made to prompt the user
}


function promptSale(products){
  inquirer.prompt([
    {
      type: "rawlist",
      name: "products",
      choices: function(){
        var optionName = []
        for(var i = 0; i< products.length; i++){
          optionName.push(products[i].product_name)
        }
        return optionName
      },
      message: "What product would you like to buy?"
  },
  {
    type: "input",
    name: "quantity",
    message: "How many would you like to buy?",
    //quantity validation
    validate: function(value){
      if(isNaN(value)== false){
        return true;
      } else {
        return false;
      }
    }
  }
])
  .then(function(answer){
    var name = answer.name;
    var user_quantity =  parseInt(answer.quantity);
    var stock;
    var price;
    var id;

    for(var i = 0; i < products.length; i++){
      if(products[i].product_name === name) {
        stock = products[i].stock_quantity;
        price =  products[i].price;
        break;
      }
    }

    if(user_quantity < stock) {
      var newStock = stock - user_quantity;
      connection.query("UPDATE products SET ? where ? ", [{
          stock_quantity: newStock
        },
        {
          product_name: name
        }
      ], function(err, updatedItem){
        if(err) throw err;
        if(updatedItem.affectedRows === 1){
          console.log("\n___________________________")
            console.log("Bamazon")
            console.log("-----------------------------")
            console.log("Item:", name)
            console.log("Item quanitity:", user_quantity)
            console.log("-----------------------------")
            console.log("sub-total: $", user_quantity * price)
            console.log("___________________________\n")
            console.log("Thank you for shopping!");
          
            // promt user buy more or exit 
            //  startApp()
            // this.connection.end();
        }
      })
    } else {
      // not enough stock to buy this item 
      // prompt user to add a different amount or select another product
    }      
  })
}
