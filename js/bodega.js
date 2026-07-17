import { insertarMaterial } from "./insertarMaterial.js";

const botonMostrar = document.querySelector("#boton-mostrar-bodega");
const botonCancelar = document.querySelector("#boton-cancelar-bodega");
const botonGuardar = document.querySelector("#boton-guardar-bodega");
const formulario = document.querySelector("#form-bodega");

botonMostrar.addEventListener("click", () => {
  formulario.hidden = false;
  botonMostrar.hidden = true;

  document.querySelector("#nombre-bodega").focus();
});

botonCancelar.addEventListener("click", () => {
  formulario.reset();
  formulario.hidden = true;
  botonMostrar.hidden = false;
});

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  botonGuardar.disabled = true;

  try {
    await insertarMaterial("material_bodega", {
      nombre: document.querySelector("#nombre-bodega").value,
      cantidad: document.querySelector("#cantidad-bodega").value,
      ubicacion:
        document.querySelector("#ubicacion-bodega").value.trim() || null,
      estado: "disponible"
    });

    formulario.reset();
    formulario.hidden = true;
    botonMostrar.hidden = false;

    alert("Material añadido correctamente");
  } catch (error) {
    alert(`Error: ${error.message}`);
  } finally {
    botonGuardar.disabled = false;
  }
});