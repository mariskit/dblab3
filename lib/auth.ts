import bcrypt from "bcryptjs";
import { executeQuery } from "./database";
import { User } from "../types";

export async function createUser(
  username: string,
  password: string
): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await executeQuery(
      `
      INSERT INTO Users (username, password_hash) 
      OUTPUT INSERTED.id, INSERTED.username, INSERTED.created_at 
      VALUES (@username, @password_hash)
    `,
      {
        username: username,
        password_hash: passwordHash,
      }
    );

    return result.recordset[0];
  } catch (error: any) {
    if (error.number === 2627) {
      throw new Error("El usuario ya existe");
    }
    throw error;
  }
}

export async function verifyUser(
  username: string,
  password: string
): Promise<User | null> {
  try {
    const result = await executeQuery(
      "SELECT * FROM Users WHERE username = @username",
      { username: username }
    );

    if (result.recordset.length === 0) return null;

    const user = result.recordset[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    return isValid ? user : null;
  } catch (error) {
    console.error("Error verifying user:", error);
    return null;
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const result = await executeQuery(
      "SELECT id, username, created_at FROM Users WHERE id = @id",
      { id: id }
    );

    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error("Error getting user by id:", error);
    return null;
  }
}
