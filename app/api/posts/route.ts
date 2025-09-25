import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "../../../lib/database";

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT p.*, u.username as author_username, pt.name as post_type_name
      FROM Posts p
      INNER JOIN Users u ON p.author_id = u.id
      INNER JOIN PostTypes pt ON p.post_type_id = pt.id
      ORDER BY p.created_at DESC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Error fetching posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { author_id, post_type_id, title, content } = await request.json();

    const result = await executeQuery(
      `
      INSERT INTO Posts (author_id, post_type_id, title, content) 
      OUTPUT INSERTED.* 
      VALUES (@author_id, @post_type_id, @title, @content)
    `,
      {
        author_id: author_id,
        post_type_id: post_type_id,
        title: title,
        content: content,
      }
    );

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Error creating post" }, { status: 500 });
  }
}
