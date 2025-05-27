export const validateRequest = (schema) => async (req, res, next) => {
  try {
    if (schema) {
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
    }
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      console.log(req.body);
      
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors
      });
    }
    next(error);
  }
};

export const validateQuery = (schema) => async (req, res, next) => {
  try {
    if (schema) {
      const validatedData = await schema.parseAsync(req.query);
      req.query = validatedData;
    }
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Tham số không hợp lệ",
        errors
      });
    }
    next(error);
  }
};

export const validateParams = (schema) => async (req, res, next) => {
  try {
    if (schema) {
      const validatedData = await schema.parseAsync(req.params);
      req.params = validatedData;
    }
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Tham số không hợp lệ",
        errors
      });
    }
    next(error);
  }
}; 