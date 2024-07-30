const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;
  const GOOGLE_CLIENT_ID = "368370196148-ujdcojd8gb2e5fhbob3nen0e7rm64s4a.apps.googleusercontent.com"
  const GOOGLE_CLIENT_SECRET = "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"
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser(function (user, done) {
done(null, user)
});
passport.deserializeUser(function (user, done) {
  done(null, user)
  });