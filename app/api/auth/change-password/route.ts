import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "../../../../lib/database";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Obtener usuario actual
    const userResult = await executeQuery(
      "SELECT * FROM Users WHERE id = @userId",
      { userId: parseInt(userId) }
    );

    if (userResult.recordset.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const user = userResult.recordset[0];

    // Verificar contraseña actual
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 401 }
      );
    }

    // Hashear nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña
    await executeQuery(
      "UPDATE Users SET password_hash = @newPasswordHash WHERE id = @userId",
      {
        userId: parseInt(userId),
        newPasswordHash: newPasswordHash,
      }
    );

    return NextResponse.json({
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
