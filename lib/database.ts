import sql from "mssql";

const dbConfig = {
  server: process.env.DB_SERVER || "your-server.database.windows.net",
  database: process.env.DB_NAME || "your-database",
  user: process.env.DB_USER || "your-username",
  password: process.env.DB_PASSWORD || "your-password",
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 60000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
};

// Crear una nueva conexión para cada solicitud (mejor para serverless)
export async function getConnection() {
  try {
    const pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log("Nueva conexión a SQL Server establecida");
    return pool;
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    throw error;
  }
}

// Función helper para ejecutar consultas con manejo automático de conexión
export async function executeQuery(query: string, inputs?: any) {
  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await getConnection();
    const request = pool.request();

    // Agregar inputs si existen
    if (inputs) {
      Object.keys(inputs).forEach((key) => {
        request.input(key, inputs[key]);
      });
    }

    const result = await request.query(query);
    return result;
  } finally {
    // Cerrar la conexión después de cada consulta
    if (pool) {
      await pool.close();
      console.log("Conexión cerrada");
    }
  }
}

export { sql };
