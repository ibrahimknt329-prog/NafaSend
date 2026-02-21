import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  console.log("Nouvelle commande reçue :", data);

  return NextResponse.json({
    success: true,
    message: "Commande enregistrée avec succès 🚚"
  });
}
