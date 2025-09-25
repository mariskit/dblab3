import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "../../../../lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // 👈 await aquí

    const result = await executeQuery(
      `
      SELECT p.*, u.username as author_username, pt.name as post_type_name
      FROM Posts p
      INNER JOIN Users u ON p.author_id = u.id
      INNER JOIN PostTypes pt ON p.post_type_id = pt.id
      WHERE p.id = @id
    `,
      { id: parseInt(id) }
    );

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Error fetching post" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, content, post_type_id } = await request.json();

    const result = await executeQuery(
      `
      UPDATE Posts 
      SET title = @title, content = @content, post_type_id = @post_type_id, updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE id = @id
    `,
      {
        id: parseInt(id),
        title,
        content,
        post_type_id,
      }
    );

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Error updating post" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await executeQuery("DELETE FROM Posts WHERE id = @id", {
      id: parseInt(id),
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Error deleting post" }, { status: 500 });
  }
}
