import { supabase } from "./supabase.js";

export async function insertarMaterial(table, donnee) {
  if (!table) {
    throw new Error("La table n'est pas définie");
  }

  if (!donnee.nom?.trim()) {
    throw new Error("Le nom est obligatoire");
  }

  const quantite = Number(donnee.quantite ?? 0);

  if (!Number.isInteger(quantite) || quantite < 0) {
    throw new Error(
      "La quantité doit être un nombre entier positif"
    );
  }

  const materiel = {
    nombre: donnee.nom.trim(),
    cantidad: quantite,
    stock_minimo: Number(donnee.stockMinim ?? 0),
    ubicacion: donnee.lieu?.trim() || null,
    estado: donnee.etat || "disponible"
  };

  const { data, error } = await supabase
    .from(table)
    .insert(materiel)
    .select()
    .single();

  if (error) {
    console.error("Erreur Supabase :", error);
    throw new Error(error.message);
  }

  return data;
}