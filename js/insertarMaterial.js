import { supabase } from "./supabase.js";

export async function insertarMaterial(table, donnee) {
  if (!table) {
    throw new Error("La table n'est pas definie");
  }

  if (!donnee.nombre?.trim()) {
    throw new Error("Le nom est obligatoire");
  }

  const materiel = {
    ...donnee,
    nom: donnee.nom.trim(),
    quantite: Number(donnee.quantite ?? 0),
    stock_minim: Number(donnee.stock_minim ?? 0)
  };

  const { data, error } = await supabase
    .from(table)
    .insert(materiel)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
}