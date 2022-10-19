require('dotenv').config();//dotenv allows you to separate secrets from your source code.
const express=require("express");
const app=express();
const ejs=require("ejs");
const path=require("path");
const PORT=process.env.PORT || 3000;
const mongoose=require("mongoose");
const expressLayout=require('express-ejs-layouts');
const session=require('express-session');
const flash=require('express-flash');
const MongoDbStore=require('connect-mongo');//used to store sessionid in the mongo database
const passport=require('passport');
const Emitter=require('events');



// mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zkflz.mongodb.net/pizza?retryWrites=true&w=majority`,{ useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true }).then(()=>{
//     console.log("Database Connected")
// })
// .catch((err)=>{
//   console.log(err);
// })

mongoose.connect(`mongodb://localhost:27017/pizza?retryWrites=true&w=majority`,{ useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true }).then(()=>{
    console.log("Database Connected")
})
.catch((err)=>{
  console.log(err);
})




//Event emitter
const eventEmitter = new Emitter();//if we are on another js file and want to send some info to any other page then we use event emitter
app.set('eventEmitter',eventEmitter);//eventEmiiter is now available everywhere

//Session config
app.use(session({
  secret:process.env.COOKIE_SECRET,
  resave: false,
  // store: MongoDbStore.create({
  //   client:connection.getClient()
  // }),
  store: MongoDbStore.create({
    mongoUrl: ` mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zkflz.mongodb.net/pizza?retryWrites=true&w=majority`, //YOUR MONGODB URL
  }),
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hour session expiration/cookie expiration
}))
//First the client sends the request to the server then the server generates a sessionid to the client and saves it(by default in memory but we will store it in database).Now along with response the server send a mesaage in responseheader to store a cookie to browser.Now when again the client send the request,this time alongwith request cookie is also sent with the help of which the server identifies the user by matchng it with the sessionid stored.Now this time server will not send response to add cookie.This cookie or session id has validity which is set by the developer.


//Passport Config
const passportInit=require('./app/config/passport');
app.use(passport.initialize());
app.use(passport.session());
passportInit(passport);


app.use(flash());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(expressLayout);

//Global Middleware
app.use((req,res,next)=>{
  res.locals.session=req.session;
  res.locals.user=req.user;
  next();
})
//set template engine
const staticPath2 = path.join(__dirname, "/resources/views");
app.set("views", staticPath2);
app.set('view engine','ejs');

//Assets
app.use(express.static('public'));


//Routes

require('./routes/web')(app);//Importing from routes




const server=app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`);
})


const io=require('socket.io')(server);
io.on('connection',(socket)=>{
  // Join
  console.log(socket.id);
  socket.on('join',(orderId)=>{
    // console.log(orderId);
  })
})


//Emitted by statusControler
eventEmitter.on('orderUpdated',(data)=>{
  io.to(`order_${data.id}`).emit('orderUpdated',data);//sent to client(app.js)
})


eventEmitter.on('orderPlaced',(data)=>{
  io.to('adminRoom').emit('orderPlaced',data);
})