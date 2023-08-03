const { StatusCodes } = require("http-status-codes")

const errorHandlerMiddleware = (err, req, res, next) => {
  const customError = {
    statusCode: err.statusCode || 500,
    message: err.message || "Une erreur s'est produite",
  }
  if (err.code && err.code === "23505") {
    customError.msg = `${err.detail} Veuillez choisir une autre adresse email`
    customError.statusCode = StatusCodes.BAD_REQUEST
  }

  res.status(customError.statusCode).json({ msg: customError.message })
}

module.exports = errorHandlerMiddleware
