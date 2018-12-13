var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected!\n");
    //calling start function which establishes our connection.query, and calls our buy() function
    start();
})

function start() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        //connection.end();
        buy();
    });
}

//takes in user input, if valid will call purchase() function 
function buy() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the id of the item you would like to purchase?",
            name: "item_select"
        },
        {
            type: "input",
            message: "How many items would you like to purchase?",
            name: "item_amount"
        }
    ])
        .then(function (answer) {
            if (answer.item_amount > 0, answer.item_select <= 10) {
                purchase(answer.item_select, answer.item_amount);
            }
            else {
                console.log("invalid amount or id selected, please check your input");
                shopAgain();
            }
        })
}

//validates purchase() parameters
function purchase(itemID, itemNum) {
    connection.query("SELECT * FROM products WHERE item_id =" + itemID, function (err, res) {
        if (err) throw err;
        console.log(res);
        if (itemNum <= res[0].stock_quantity) {
            console.log("Order Fulfilled");
            var newNum = res[0].stock_quantity - itemNum;
            updateStock(itemID, newNum);
            console.log("Your total is " + (itemNum * res[0].price) + " dollars.");
            shopAgain();
        }
        else {
            console.log("Insufficient stock, order cancelled.");
            shopAgain();
        }
    })
}

//updates stock amount based on validated parameters
function updateStock(itemID, itemNum) {
    connection.query("UPDATE products SET stock_quantity =" + itemNum + " Where item_id =" + itemID, function (err, res) {
        if (err) throw err;
    })
}

//gives the customer an opportunity to purchase additional items without restarting the app
function shopAgain() {
    inquirer.prompt([
        {
            type: "list",
            message: "Would you like to purchase another item?",
            choices: ["yes", "no"],
            name: "shop_again"
        }
    ])
        .then(function (response) {
            if (response.shop_again === "yes") {
                buy();
            }
            else {
                console.log("Thank you, goodbye!");
                connection.end();
            }
        })
}