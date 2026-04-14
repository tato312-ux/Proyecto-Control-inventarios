const databaseErrorMap = {
  "23503": "La referencia enviada no existe o no es valida",
  "23505": "El registro ya existe",
  "22P02": "Uno de los valores enviados no tiene un formato valido"
};

export function sendError(res, status, message) {
  return res.status(status).json({ message });
}

export function sendDatabaseError(res, error, fallbackMessage) {
  console.error(error);

  const message = databaseErrorMap[error?.code] || fallbackMessage;
  const status = error?.code && databaseErrorMap[error.code] ? 400 : 500;

  return sendError(res, status, message);
}

export function sendInternalError(res, error, fallbackMessage = "Error interno del servidor") {
  console.error(error);
  return sendError(res, 500, fallbackMessage);
}
