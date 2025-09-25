import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "../../../../lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await executeQuery(
      `
      SELECT c.*, u.username as author_username
      FROM Comments c
      INNER JOIN Users u ON c.author_id = u.id
      WHERE c.id = @id
    `,
      { id: parseInt(params.id) }
    );

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "Comentario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching comment:", error);
    return NextResponse.json(
      { error: "Error fetching comment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { content } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "El contenido del comentario es requerido" },
        { status: 400 }
      );
    }

    // Primero verificar que el comentario existe
    const checkResult = await executeQuery(
      "SELECT author_id FROM Comments WHERE id = @id",
      { id: parseInt(params.id) }
    );

    if (checkResult.recordset.length === 0) {
      return NextResponse.json(
        { error: "Comentario no encontrado" },
        { status: 404 }
      );
    }

    const result = await executeQuery(
      `
      UPDATE Comments 
      SET content = @content, updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE id = @id
    `,
      {
        id: parseInt(params.id),
        content: content.trim(),
      }
    );

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Error updating comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await executeQuery("DELETE FROM Comments WHERE id = @id", {
      id: parseInt(params.id),
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Error deleting comment" },
      { status: 500 }
    );
  }
}
