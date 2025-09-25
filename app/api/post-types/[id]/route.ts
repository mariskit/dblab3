import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "../../../../lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await executeQuery(
      "SELECT * FROM PostTypes WHERE id = @id",
      { id: parseInt(params.id) }
    );

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: "Tipo de post no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching post type:", error);
    return NextResponse.json(
      { error: "Error fetching post type" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description } = await request.json();

    // Verificar si el tipo existe
    const checkResult = await executeQuery(
      "SELECT id FROM PostTypes WHERE id = @id",
      { id: parseInt(params.id) }
    );

    if (checkResult.recordset.length === 0) {
      return NextResponse.json(
        { error: "Tipo de post no encontrado" },
        { status: 404 }
      );
    }

    const result = await executeQuery(
      `
      UPDATE PostTypes 
      SET name = @name, description = @description
      OUTPUT INSERTED.*
      WHERE id = @id
    `,
      {
        id: parseInt(params.id),
        name: name,
        description: description,
      }
    );

    return NextResponse.json(result.recordset[0]);
  } catch (error: any) {
    console.error("Error updating post type:", error);

    if (error.number === 2627) {
      // Violación de unique constraint
      return NextResponse.json(
        { error: "Ya existe un tipo con ese nombre" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error updating post type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el tipo existe
    const checkResult = await executeQuery(
      "SELECT id FROM PostTypes WHERE id = @id",
      { id: parseInt(params.id) }
    );

    if (checkResult.recordset.length === 0) {
      return NextResponse.json(
        { error: "Tipo de post no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si hay posts usando este tipo
    const postsResult = await executeQuery(
      "SELECT COUNT(*) as postCount FROM Posts WHERE post_type_id = @id",
      { id: parseInt(params.id) }
    );

    const postCount = postsResult.recordset[0].postCount;
    if (postCount > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar. Hay ${postCount} posts usando este tipo.`,
        },
        { status: 400 }
      );
    }

    await executeQuery("DELETE FROM PostTypes WHERE id = @id", {
      id: parseInt(params.id),
    });

    return NextResponse.json({ message: "Tipo eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting post type:", error);
    return NextResponse.json(
      { error: "Error deleting post type" },
      { status: 500 }
    );
  }
}
