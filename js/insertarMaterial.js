import { supabase } from "./supabase.js";

export async function insertarMaterial(tabla, datos) {
  if (!tabla) {
    throw new Error("La tabla no está definida");
  }

  if (!datos.nombre?.trim()) {
    throw new Error("El nombre es obligatorio");
  }

  const material = {
    ...datos,
    nombre: datos.nombre.trim(),
    cantidad: Number(datos.cantidad ?? 0),
    stock_minimo: Number(datos.stock_minimo ?? 0)
  };

  const { data, error } = await supabase
    .from(tabla)
    .insert(material)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
}