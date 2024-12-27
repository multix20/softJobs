export const verificarCredenciales = (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }
  
    next(); // Pasar al siguiente middleware o controlador
  };
  