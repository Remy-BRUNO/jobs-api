const jwt = require("jsonwebtoken")
const db = require("../db")
const {
  BadRequestError,
  UnauthenticatidedError,
  NotFoundError,
} = require("../errors")
const { StatusCodes } = require("http-status-codes")

const bcrypt = require("bcryptjs")
bcrypt.genSalt(10, function (err, salt) {
  bcrypt.hash("B4c0//", salt, function (err, hash) {
    // Store hash in your password DB.
  })
})

const register = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || name.length < 3 || name.length > 50) {
    throw new BadRequestError(
      "Veuiller fournir un nom entre 3 et 50 carractères"
    )
  }

  const isValidEmail =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    )

  if (!email || !isValidEmail) {
    throw new BadRequestError("Veuiller fournir un email valide.")
  }

  if (!password || password.length < 6) {
    throw new BadRequestError(
      "Veuiller fournir un mot de passe avec au moins 6 caractères"
    )
  }

  // crypter le mot de passe
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // inserer l'user avec le mdp hashed
  const { rows: user } = await db.query(
    "insert into users(name,email,password) values($1,$2,$3) returning *",
    [name, email, hashedPassword]
  )

  // generer un token
  const token = jwt.sign(
    { userID: user.user_id, name: user.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  )

  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token })
}

// login
const login = async (req, res) => {
  // recupere le req.body
  const { email, password } = req.body
  // valider les input
  if (!email) {
    throw new BadRequestError("Veuiller fournir un email valide.")
  }

  if (!password) {
    throw new BadRequestError(
      "Veuiller fournir un mot de passe avec au moins 6 caractères"
    )
  }

  // récupère l'user dans la BDD grace a l'email
  const {
    rows: [user],
  } = await db.query("select * from users where email=$1 ", [email])

  //soit pas d'user
  if (!user) {
    throw new UnauthenticatidedError("Utilisateur inexistant")
  }
  //erreur
  //comparer le mdp

  const isPasswordCorrect = await bcrypt.compare(password, user.password)

  if (!isPasswordCorrect) {
    throw new UnauthenticatidedError("password invalid")
  }

  //generer le token
  const token = jwt.sign(
    { userID: user.user_id, name: user.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  )
  //envoyer le token dans la réponse

  res.status(StatusCodes.OK).json({ user: { name: user.name }, token })
}

module.exports = { register, login }
