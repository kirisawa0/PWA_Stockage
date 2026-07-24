import { supabase } from "./supabase.js";

const formulaireReservation = document.querySelector(
  "#form-reservation-minibus"
);

const selectionMinibus = document.querySelector(
  "#selection-minibus-reservation"
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

const destinationReservation =
  document.querySelector(
    "#destination-reservation"
  );

const nombrePassagersReservation =
  document.querySelector(
    "#nombre-passagers-reservation"
  );


initialiserPageReservation();


async function initialiserPageReservation() {
  const dateHeureActuelle = obtenirDateHeureActuelle();

    dateDebutReservation.min = dateHeureActuelle;

    dateFinReservation.min = dateHeureActuelle;

  dateDebutReservation.addEventListener(
    "change",
    actualiserDateFinMinimum
  );

  formulaireReservation.addEventListener(
    "submit",
    enregistrerReservation
  );

  await remplirSelectionMinibus();
}


function obtenirDateHeureActuelle() {
  return formaterDateHeureLocale(new Date());
}

function formaterDateHeureLocale(date) {
  const decalage =
    date.getTimezoneOffset() * 60000;

  return new Date(
    date.getTime() - decalage
  )
    .toISOString()
    .slice(0, 16);
}


function actualiserDateFinMinimum() {
  const valeurDebut =
    dateDebutReservation.value;

  dateFinReservation.min = valeurDebut;

  if (!valeurDebut) {
    return;
  }

  const dateDebut = new Date(valeurDebut);
  const dateFin = new Date(
    dateFinReservation.value
  );

  if (
    !dateFinReservation.value ||
    dateFin.getTime() <= dateDebut.getTime()
  ) {
    const nouvelleDateFin =
      new Date(dateDebut);

    nouvelleDateFin.setHours(
      nouvelleDateFin.getHours() + 1
    );

    dateFinReservation.value =
      formaterDateHeureLocale(
        nouvelleDateFin
      );
  }
}

async function recupererMinibus() {
  const { data, error } = await supabase
    .from("minibus")
    .select(`
      id,
      immatriculation,
      nom,
      capacite
    `)
    .eq("etat", "disponible")
    .order("immatriculation", {
      ascending: true
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function remplirSelectionMinibus() {
  try {
    const listeMinibus = await recupererMinibus();

    listeMinibus.forEach((vehicule) => {
      const option = document.createElement("option");

      option.value = vehicule.id;

      option.textContent =
        vehicule.immatriculation +
        (
          vehicule.nom
            ? ` — ${vehicule.nom}`
            : ""
        );

      selectionMinibus.appendChild(option);
    });
  } catch (error) {
    afficherMessageReservation(
      `Impossible de charger les minibus : ${error.message}`,
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
      "Les dates et heures sont obligatoires"
    );
  }

  const dateDebut = new Date(
    dateDebutReservation.value
  );

  const dateFin = new Date(
    dateFinReservation.value
  );

  if (
    Number.isNaN(dateDebut.getTime()) ||
    Number.isNaN(dateFin.getTime())
  ) {
    throw new Error(
      "Les dates renseignées sont invalides"
    );
  }

  if (
    dateFin.getTime() <= dateDebut.getTime()
  ) {
    throw new Error(
      "La date de retour doit être postérieure à la date de départ"
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
    minibus_id: selectionMinibus.value,
    nom_reservation: nomReservation.value.trim(),
    responsable: responsableReservation.value.trim(),
    telephone:
        telephoneReservation.value.trim() || null,
    destination:
        destinationReservation.value.trim() || null,
    date_debut: new Date(dateDebutReservation.value).toISOString(),

    date_fin: new Date(dateFinReservation.value).toISOString(),

    nombre_passagers: Number(
        nombrePassagersReservation.value
    ),
    statut: "confirmee",
    notes: notesReservation.value.trim() || null
    };

    const { error } = await supabase
      .from("reservations_minibus")
      .insert(nouvelleReservation);

    

  return;


    if (error.code === "23P01") {
        afficherMessageReservation(
            "Ce minibus est déjà réservé pendant cette période.",
            true
        );

  return;
}

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
        "Ce minibus est déjà réservée pendant cette période.",
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