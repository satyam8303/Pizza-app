//Use of controller--jo code ham app.get()   me likhte ho baad me bahut sara ho sakta h usko hm controller me likhte h taki code saaf rhe 
//Controller me Factory function hote h
//Factory function--function which return objects
const Menu = require("../../models/menu");
function homeController() {  //Factory function
    return {
        async index(req, res) {
            const pizzas = await Menu.find();
            // console.log(pizzas);
            return res.render("home", { pizzas: pizzas });        //same as index:fuunction(){  }                          
        }
    }
}

module.exports = homeController;