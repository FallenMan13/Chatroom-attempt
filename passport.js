module.exports = function (app, io){
  var passport = require('passport');
  var Auth0Strategy = require('passport-auth0');

  var strategy = new Auth0Strategy({
      domain:       "fallenman13.eu.auth0.com",
      clientID:     "ddCpIAzWF0jU4N4XDWggADYI1ASUdIml",
      clientSecret: "PsSWY8e7NCoFKtwD8fjRGKFEsfI_PVuGKV63KLE3RtOHecjM1kA2JZC4TOnSNAeX",
      callbackURL:  "http://" + app.get("ipaddr") + ":" + app.get("port") + "/callback"
    }, function(accessToken, refreshToken, extraParams, profile, done) {
      // accessToken is the token to call Auth0 API (not needed in the most cases)
      // extraParams.id_token has the JSON Web Token
      // profile has all the information from the user
      return done(null, profile);
    });

  passport.use(strategy);

  // This can be used to keep a smaller payload
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
  function(req, res) {
    var users = app.get("users")
    users.push(req.user.nickname)
    io.sockets.emit("connectedChange");
    res.redirect(req.session.returnTo || '/chatroom');
  });
}
