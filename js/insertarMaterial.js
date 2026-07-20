import { supabase } from "./supabase.js";

export async function insertarMaterial(table, donnee) {
  if (!table) {
    throw new Error("La table n'est pas définie");
  }

  if (!donnee.nom?.trim()) {
    throw new Error("Le nom est obligatoire");
  }

  const materiel = {
    nombre: donnee.nom.trim(),
    cantidad: Number(donnee.quantite ?? 0),
    stock_minimo: Number(donnee.stock_minim ?? 0),
    ubicacion: donnee.lieu?.trim() || null,
    estado: donnee.etat || "disponible"
  };

  if (!Number.isInteger(materiel.cantidad)) {
    throw new Error("La quantité doit être un nombre entier");
  }

  if (materiel.cantidad < 0) {
    throw new Error("La quantité ne peut pas être négative");
  }

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