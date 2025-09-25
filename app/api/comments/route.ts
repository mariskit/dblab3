import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "../../../lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    let query = `
      SELECT c.*, u.username as author_username
      FROM Comments c
      INNER JOIN Users u ON c.author_id = u.id
    `;

    const inputs: any = {};

    if (postId) {
      query += ` WHERE c.post_id = @postId`;
      inputs.postId = parseInt(postId);
    }

    query += ` ORDER BY c.created_at ASC`;

    const result = await executeQuery(query, inputs);
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Error fetching comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { post_id, author_id, content } = await request.json();

    const result = await executeQuery(
      `
      INSERT INTO Comments (post_id, author_id, content) 
      OUTPUT INSERTED.* 
      VALUES (@post_id, @author_id, @content)
    `,
      {
        post_id: post_id,
        author_id: author_id,
        content: content,
      }
    );

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Error creating comment" },
      { status: 500 }
    );
  }
}
