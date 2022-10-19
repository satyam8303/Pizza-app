const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require("../../models/user");
function authController() {//Factory function
   const _getRedirectUrl = (req) => {
      return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders'
   }
   return {


      login(req, res) {
         res.render("auth/login");      //same as index:fuunction(){  }                     
      },
      register(req, res) {
         res.render("auth/register");      //same as index:fuunction(){  }                     

      },
      postLogin(req, res, next) {
         const { email, password } = req.body
         // Validate request 
         if (!email || !password) {
            req.flash('error', 'All fields are required')
            return res.redirect('/login')
         }


         passport.authenticate('local', (err, user, info) => {
            if (err) {
               req.flash('error', info.message);
               return next(err);
            }

            if (!user) {
               req.flash('error', info.message)
               return res.redirect('/login');
            }

            req.logIn(user, (err) => {
               if (err) {
                  req.flash('error', info.message);
                  return next(err);
               }


               return res.redirect(_getRedirectUrl(req));
            })
         })(req, res, next)
      },

      async postRegister(req, res) {
         const { name, email, password } = req.body;
         //Validate request
         if (!name || !email || !password) {
            req.flash('error', 'All fields are required');//with the healp of flash
            req.flash('name', name);//to send the name and email written by user so that he dont have to write again
            req.flash('email', email);
            return res.redirect('/register');
         }

         //Check if email exists
         User.exists({ email: email }, (error, result) => {
            if (result) {
               req.flash('error', 'Email Already Exists!');
               req.flash('name', name);
               req.flash('email', email);
               return res.redirect('/register');
            }
         })

         //Hash the password
         const hashedPassword = await bcrypt.hash(password, 10);

         //Create user in database
         const user = new User({
            name: name,
            email: email,
            password: hashedPassword
         })

         user.save().then((user) => {
            // Login
            return res.redirect('/')
         }).catch(err => {
            req.flash('error', 'Something went wrong')
            return res.redirect('/register')
         })

      },

      logout(req, res) {
         req.logout();
         return res.redirect('/login');
      }
   }

}

module.exports = authController;