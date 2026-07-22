import { supabase } from "./supabase.js";

const boutonMinibus =
  document.querySelector("#bouton-minibus");

const boutonSauvegarderMinibus =
  document.querySelector("#bouton-sauv-minibus");

const boutonAnnulerMinibus =
  document.querySelector("#bouton-annuler-minibus");

const formulaireMinibus =
  document.querySelector("#form-minibus");

const fenetreAjoutMinibus =
  document.querySelector("#fenetre-ajout-minibus");

const listeMinibus =
  document.querySelector("#liste-minibus");

boutonMinibus.addEventListener(
  "click",
  afficherFormulaireMinibus
);

boutonAnnulerMinibus.addEventListener(
  "click",
  annulerAjoutMinibus
);

formulaireMinibus.addEventListener(
  "submit",
  ajouterMinibus
);

fenetreAjoutMinibus.addEventListener(
  "click",
  fermerFormulaireMinibus
);

afficherMinibus();


function afficherFormulaireMinibus() {
  fenetreAjoutMinibus.showModal();

  document
    .querySelector("#immatriculation-minibus")
    .focus();
}


function annulerAjoutMinibus() {
  formulaireMinibus.reset();
  fenetreAjoutMinibus.close();
}


function fermerFormulaireMinibus(event) {
  if (event.target !== fenetreAjoutMinibus) {
    return;
  }

  annulerAjoutMinibus();
}


function normaliserImmatriculation(immatriculation) {
  return immatriculation
    .trim()
    .toUpperCase();
}


async function ajouterMinibus(event) {
  event.preventDefault();

  boutonSauvegarderMinibus.disabled = true;

  const nouveauMinibus = {
    immatriculation: normaliserImmatriculation(
      document.querySelector(
        "#immatriculation-minibus"
      ).value
    ),

    nom:
      document
        .querySelector("#nom-minibus")
        .value
        .trim() || null,

    marque:
      document
        .querySelector("#marque-minibus")
        .value
        .trim() || null,

    modele:
      document
        .querySelector("#modele-minibus")
        .value
        .trim() || null,

    capacite: Number(
      document.querySelector(
        "#capacite-minibus"
      ).value
    ),

    lieu:
      document
        .querySelector("#lieu-minibus")
        .value
        .trim() || null,

    etat: "disponible"
  };

  try {
    const { error } = await supabase
      .from("minibus")
      .insert(nouveauMinibus);

    if (error) {
      throw error;
    }

    formulaireMinibus.reset();
    fenetreAjoutMinibus.close();

    await afficherMinibus();

    alert("Minibus ajouté correctement");
  } catch (error) {
    console.error(
      "Erreur lors de l'ajout du minibus :",
      error
    );

    if (error.code === "23505") {
      alert(
        "Un minibus avec cette immatriculation existe déjà."
      );

      return;
    }

    alert(`Erreur : ${error.message}`);
  } finally {
    boutonSauvegarderMinibus.disabled = false;
  }
}


async function recupererMinibus() {
  const { data, error } = await supabase
    .from("minibus")
    .select(`
      id,
      immatriculation,
      nom,
      marque,
      modele,
      capacite,
      lieu,
      etat
    `)
    .order("immatriculation", {
      ascending: true
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


async function afficherMinibus() {
  listeMinibus.textContent =
    "Chargement des minibus...";

  try {
    const minibus = await recupererMinibus();

    listeMinibus.replaceChildren();

    if (minibus.length === 0) {
      listeMinibus.textContent =
        "Aucun minibus enregistré.";

      return;
    }

    minibus.forEach((vehicule) => {
      const carteMinibus =
        document.createElement("article");

      carteMinibus.className =
        "carte-minibus";

      const immatriculation =
        document.createElement("h2");

      immatriculation.textContent =
        vehicule.immatriculation;

      const nom = document.createElement("p");

      nom.textContent =
        `Nom : ${vehicule.nom || "Non renseigné"}`;

      const modele = document.createElement("p");

      modele.textContent =
        `Véhicule : ${
          [vehicule.marque, vehicule.modele]
            .filter(Boolean)
            .join(" ") || "Non renseigné"
        }`;

      const capacite =
        document.createElement("p");

      capacite.textContent =
        `Places : ${vehicule.capacite}`;

      const etat = document.createElement("p");

      etat.textContent =
        `État : ${vehicule.etat}`;

      carteMinibus.append(
        immatriculation,
        nom,
        modele,
        capacite,
        etat
      );

      listeMinibus.appendChild(carteMinibus);
    });
  } catch (error) {
    console.error(
      "Erreur lors du chargement des minibus :",
      error
    );

    listeMinibus.textContent =
      `Impossible de charger les minibus : ${error.message}`;
  }
}