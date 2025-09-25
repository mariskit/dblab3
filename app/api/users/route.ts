import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "../../../lib/database";

export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT 
        u.id,
        u.username,
        u.created_at,
        COUNT(p.id) as post_count
      FROM Users u
      LEFT JOIN Posts p ON u.id = p.author_id
      GROUP BY u.id, u.username, u.created_at
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error fetching users" },
      { status: 500 }
    );
  }
}
