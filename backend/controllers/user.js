// Appel du package bcrypt

const bcrypt = require("bcrypt");

// Appel du package jsonwebtoken (TOKEN)

const jwt = require('jsonwebtoken');


const passwordValidator = require('password-validator');
// Appel du model User

const User = require("../models/user");

// Logique métier : User Inscription

const schema = new passwordValidator();
  schema
  .is().min(8)                                    
  .is().max(100)                                                            
  .has().lowercase()                              
  .has().digits(2)                                
  .has().not().spaces()                           
  .is().not().oneOf(['Passw0rd', 'Password123']); 

exports.signup = (req, res, next) => {
  if(!schema.validate(req.body.password)) {
    throw  {error: "invalide"}  
}
  else {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
    });
    user.save()
    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
    .catch(error => res.status(400).json({ error }));
  })
  .catch(error => res.status(500).json({ error }));
}
};

// Logique métier : User Connexion

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};