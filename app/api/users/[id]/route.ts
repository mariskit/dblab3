import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "../../../../lib/database";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

    // Verificar que el usuario existe
    const userResult = await executeQuery(
      "SELECT id FROM Users WHERE id = @userId",
      { userId: userId }
    );

    if (userResult.recordset.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    await executeQuery("DELETE FROM Users WHERE id = @userId", {
      userId: userId,
    });

    return NextResponse.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }
}
