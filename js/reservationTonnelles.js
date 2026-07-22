import { supabase } from "./supabase.js";

const formulaireReservation = document.querySelector(
  "#form-reservation-tonnelle"
);

const selectionTonnelle = document.querySelector(
  "#selection-tonnelle-reservation"
);

const nomReservation = document.querySelector(
  "#nom-reservation"
);

const responsableReservation = document.querySelector(
  "#responsable-reservation"
);

const telephoneReservation = document.querySelector(
  "#telephone-reservation"
);

const dateDebutReservation = document.querySelector(
  "#date-debut-reservation"
);

const dateFinReservation = document.querySelector(
  "#date-fin-reservation"
);

const notesReservation = document.querySelector(
  "#notes-reservation"
);

const boutonEnregistrerReservation =
  document.querySelector(
    "#bouton-enregistrer-reservation"
  );

const messageReservation = document.querySelector(
  "#message-reservation"
);

initialiserPageReservation();


async function initialiserPageReservation() {
  const dateAujourdhui = obtenirDateAujourdhui();

  dateDebutReservation.min = dateAujourdhui;
  dateFinReservation.min = dateAujourdhui;

  dateDebutReservation.addEventListener(
    "change",
    actualiserDateFinMinimum
  );

  formulaireReservation.addEventListener(
    "submit",
    enregistrerReservation
  );

  await remplirSelectionTonnelles();
}


function obtenirDateAujourdhui() {
  const date = new Date();
  const decalage = date.getTimezoneOffset();

  return new Date(
    date.getTime() - decalage * 60000
  )
    .toISOString()
    .slice(0, 10);
}


function actualiserDateFinMinimum() {
  dateFinReservation.min =
    dateDebutReservation.value;

  if (
    dateFinReservation.value &&
    dateFinReservation.value <
      dateDebutReservation.value
  ) {
    dateFinReservation.value =
      dateDebutReservation.value;
  }
}


async function recupererTonnelles() {
  const { data, error } = await supabase
    .from("tonnelles")
    .select("id, nombre")
    .order("nombre", {
      ascending: true
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


async function remplirSelectionTonnelles() {
  try {
    const tonnelles = await recupererTonnelles();

    tonnelles.forEach((tonnelle) => {
      const option = document.createElement("option");

      option.value = tonnelle.id;
      option.textContent = tonnelle.nombre;

      selectionTonnelle.appendChild(option);
    });
  } catch (error) {
    afficherMessageReservation(
      `Impossible de charger les tonnelles : ${error.message}`,
      true
    );
  }
}


function verifierDatesReservation() {
  if (
    !dateDebutReservation.value ||
    !dateFinReservation.value
  ) {
    throw new Error(
      "Les dates de réservation sont obligatoires"
    );
  }

  if (
    dateFinReservation.value <
    dateDebutReservation.value
  ) {
    throw new Error(
      "La date de fin doit être postérieure à la date de début"
    );
  }
}


async function enregistrerReservation(event) {
  event.preventDefault();

  boutonEnregistrerReservation.disabled = true;
  afficherMessageReservation("");

  try {
    verifierDatesReservation();

    const nouvelleReservation = {
      tonnelle_id: selectionTonnelle.value,

      nom_reservation:
        nomReservation.value.trim(),

      responsable:
        responsableReservation.value.trim(),

      telephone:
        telephoneReservation.value.trim() ||
        null,

      date_debut:
        dateDebutReservation.value,

      date_fin:
        dateFinReservation.value,

      statut: "confirmee",

      notes:
        notesReservation.value.trim() ||
        null
    };

    const { error } = await supabase
      .from("reservations_tonnelles")
      .insert(nouvelleReservation);

    if (error) {
      throw error;
    }

    formulaireReservation.reset();

    const dateAujourdhui =
      obtenirDateAujourdhui();

    dateDebutReservation.min =
      dateAujourdhui;

    dateFinReservation.min =
      dateAujourdhui;

    afficherMessageReservation(
      "Réservation enregistrée correctement."
    );
  } catch (error) {
    console.error(
      "Erreur lors de la réservation :",
      error
    );

    if (error.code === "23P01") {
      afficherMessageReservation(
        "Cette tonnelle est déjà réservée pendant cette période.",
        true
      );

      return;
    }

    afficherMessageReservation(
      error.message ||
        "Impossible d'enregistrer la réservation.",
      true
    );
  } finally {
    boutonEnregistrerReservation.disabled = false;
  }
}


function afficherMessageReservation(
  message,
  estErreur = false
) {
  messageReservation.textContent = message;

  messageReservation.classList.toggle(
    "message-erreur",
    estErreur
  );

  messageReservation.classList.toggle(
    "message-succes",
    Boolean(message) && !estErreur
  );
}