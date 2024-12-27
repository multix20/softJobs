export const logger = (req, res, next) => {
    const { method, url, body } = req;
    console.log(`[${new Date().toISOString()}] ${method} ${url}`, body);
    next(); // Pasar al siguiente middleware o controlador
  };
  