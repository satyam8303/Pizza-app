
function initRoutes(app){



    // app.get('/',(req,res)=>{
    //     res.render("home");//Iske andr jo dher sara code likhte h wo controllers se aega
    // })



    const homeController=require("../app/http/controllers/homeController");//returns object
    const authController=require("../app/http/controllers/authController");
    const cartController=require("../app/http/controllers/customers/cartController");
    const orderController=require("../app/http/controllers/customers/orderController")
    const adminOrderController=require("../app/http/controllers/admin/orderController")
    const statusController=require("../app/http/controllers/admin/statusController")
    const guest=require("../app/http/middleware/guest");//guest middleware
    const admin=require("../app/http/middleware/admin");//admin middleware
    const auth=require("../app/http/middleware/auth");//guest middleware
    
    app.get('/',homeController().index);//(req,res)=>{code} ye homeController k index method se aa rha h

    app.get('/cart',cartController().index);
    app.post('/update-cart',cartController().update);
    
    app.get("/login",guest,authController().login);
    app.post("/login",authController().postLogin);
    app.post("/logout",authController().logout);
    
    app.get("/register",guest,authController().register);
    app.post("/register",authController().postRegister);


    //Customer Routes
    app.post("/orders",auth,orderController().store);
    app.get("/customer/orders",auth, orderController().index);
    app.get("/customer/orders/:id",auth, orderController().show);



    //Admin Routes
    app.get("/admin/orders",admin,adminOrderController().index);
    app.post("/admin/order/status",admin,statusController().update);

    
}



module.exports=initRoutes;