import { insertarMaterial } from "./insertarMaterial.js";

const boutonFrom = document.querySelector("#bouton-bodega");
const boutonAnnuler = document.querySelector(
  "#bouton-annuler-bodega"
);
const boutonSauvegarder = document.querySelector(
  "#bouton-sauv-bodega"
);
const formulaire = document.querySelector("#form-bodega");

boutonFrom.addEventListener("click", apparaitreform);
boutonAnnuler.addEventListener("click", annuler);
formulaire.addEventListener("submit", ajoutMat);

function apparaitreform() {
  formulaire.hidden = false;
  boutonFrom.hidden = true;

  document.querySelector("#nom-bodega").focus();
}

function annuler() {
  formulaire.reset();
  formulaire.hidden = true;
  boutonFrom.hidden = false;
}

async function ajoutMat(event) {
  event.preventDefault();

  boutonSauvegarder.disabled = true;

  try {
    await insertarMaterial("material_bodega", {
      nom: document.querySelector("#nom-bodega").value,

      quantite: document.querySelector(
        "#quantite-bodega"
      ).value,

      lieu:
        document
          .querySelector("#lieu-bodega")
          .value.trim() || null,

      etat: "disponible"
    });

    formulaire.reset();
    formulaire.hidden = true;
    boutonFrom.hidden = false;

    alert("Matériel ajouté correctement");
  } catch (error) {
    console.error("Erreur lors de l'ajout :", error);
    alert(`Erreur : ${error.message}`);
  } finally {
    boutonSauvegarder.disabled = false;
  }
}