import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "../../../lib/database";

export async function GET() {
  try {
    const result = await executeQuery("SELECT * FROM PostTypes ORDER BY name");
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching post types:", error);
    return NextResponse.json(
      { error: "Error fetching post types" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `
      INSERT INTO PostTypes (name, description) 
      OUTPUT INSERTED.* 
      VALUES (@name, @description)
    `,
      {
        name: name.trim(),
        description: description?.trim() || null,
      }
    );

    return NextResponse.json(result.recordset[0]);
  } catch (error: any) {
    console.error("Error creating post type:", error);

    if (error.number === 2627) {
      // Violación de unique constraint
      return NextResponse.json(
        { error: "Ya existe un tipo con ese nombre" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error creating post type" },
      { status: 500 }
    );
  }
}
