const { validationResult } = require('express-validator')



//check the validation in authMiddlewar 
module.exports.checkResultsMiddleware =(req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }
  next()
}

