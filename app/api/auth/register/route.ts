import { NextRequest, NextResponse } from "next/server";
import { createUser } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const user = await createUser(username, password);

    return NextResponse.json({
      message: "Usuario creado exitosamente",
      user: user,
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.message === "El usuario ya existe") {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
