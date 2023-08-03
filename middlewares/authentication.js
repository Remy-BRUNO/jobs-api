const jwt = require("jsonwebtoken")
const { UnauthenticatidedError } = require("../errors")

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthenticatidedError("Pas de token fournit")
  }

  const token = authHeader.split(" ")[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = {
      userID: payload.userID,
      name: payload.name,
    }
    next()
  } catch (error) {
    throw new UnauthenticatidedError("Accés non autorisé")
  }
}

module.exports = authenticateUser
