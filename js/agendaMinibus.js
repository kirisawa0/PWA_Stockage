import { supabase } from "./supabase.js";

const selectionMinibusAgenda =
  document.querySelector(
    "#selection-minibus-agenda"
  );

const agendaMinibus = document.querySelector(
  "#agenda-minibus"
);

const titreMoisAgenda = document.querySelector(
  "#titre-mois-agenda"
);

const grilleAgenda = document.querySelector(
  "#grille-agenda"
);

const listeReservationsAgenda =
  document.querySelector(
    "#liste-reservations-agenda"
  );

const messageAgenda = document.querySelector(
  "#message-agenda"
);

const boutonMoisPrecedent =
  document.querySelector(
    "#bouton-mois-precedent"
  );

const boutonMoisSuivant =
  document.querySelector(
    "#bouton-mois-suivant"
  );

let dateMoisAffiche = new Date();
let identifiantMinibusSelectionnee = null;

initialiserAgenda();


async function initialiserAgenda() {
  selectionMinibusAgenda.addEventListener(
    "change",
    selectionnerMinibus
  );

  boutonMoisPrecedent.addEventListener(
    "click",
    afficherMoisPrecedent
  );

  boutonMoisSuivant.addEventListener(
    "click",
    afficherMoisSuivant
  );

  await remplirSelectionMinibusAgenda();
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


async function remplirSelectionMinibusAgenda() {
  try {
    const minibus = await recupererMinibus();

    selectionMinibusAgenda.innerHTML = `
      <option value="">
        Sélectionner un minibus
      </option>
    `;

    minibus.forEach((vehicule) => {
      const option = document.createElement("option");

      option.value = vehicule.id;

      option.textContent =
        vehicule.immatriculation +
        (vehicule.nom ? ` — ${vehicule.nom}` : "");

      selectionMinibusAgenda.appendChild(option);
    });
  } catch (error) {
    console.error(
      "Erreur lors du chargement des minibus :",
      error
    );

    afficherMessageAgenda(
      `Impossible de charger les minibus : ${error.message}`,
      true
    );
  }
}


async function selectionnerMinibus() {
  identifiantMinibusSelectionnee =
    selectionMinibusAgenda.value || null;

  if (!identifiantMinibusSelectionnee) {
    agendaMinibus.hidden = true;
    grilleAgenda.replaceChildren();
    listeReservationsAgenda.replaceChildren();
    afficherMessageAgenda("");

    return;
  }

  dateMoisAffiche = new Date();
  agendaMinibus.hidden = false;

  await afficherAgenda();
}


async function afficherMoisPrecedent() {
  dateMoisAffiche = new Date(
    dateMoisAffiche.getFullYear(),
    dateMoisAffiche.getMonth() - 1,
    1
  );

  await afficherAgenda();
}


async function afficherMoisSuivant() {
  dateMoisAffiche = new Date(
    dateMoisAffiche.getFullYear(),
    dateMoisAffiche.getMonth() + 1,
    1
  );

  await afficherAgenda();
}


async function recupererReservationsMois() {
  const premierJourMois = new Date(
    dateMoisAffiche.getFullYear(),
    dateMoisAffiche.getMonth(),
    1,
    0,
    0,
    0,
    0
  );

  const premierJourMoisSuivant = new Date(
    dateMoisAffiche.getFullYear(),
    dateMoisAffiche.getMonth() + 1,
    1,
    0,
    0,
    0,
    0
  );

  const { data, error } = await supabase
    .from("reservations_minibus")
    .select(`
      id,
      nom_reservation,
      responsable,
      telephone,
      destination,
      nombre_passagers,
      date_debut,
      date_fin,
      statut,
      notes
    `)
    .eq(
      "minibus_id",
      identifiantMinibusSelectionnee
    )
    .neq("statut", "annulee")
    .lt(
      "date_debut",
      premierJourMoisSuivant.toISOString()
    )
    .gt(
      "date_fin",
      premierJourMois.toISOString()
    )
    .order("date_debut", {
      ascending: true
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


async function afficherAgenda() {
  afficherMessageAgenda(
    "Chargement de l'agenda..."
  );

  try {
    const reservations =
      await recupererReservationsMois();

    afficherTitreMois();
    construireGrilleAgenda(reservations);
    afficherListeReservations(reservations);

    afficherMessageAgenda("");
  } catch (error) {
    console.error(
      "Erreur lors du chargement de l'agenda :",
      error
    );

    afficherMessageAgenda(
      `Impossible de charger l'agenda : ${error.message}`,
      true
    );
  }
}


function afficherTitreMois() {
  titreMoisAgenda.textContent =
    new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric"
    }).format(dateMoisAffiche);
}


function construireGrilleAgenda(reservations) {
  grilleAgenda.replaceChildren();

  const annee = dateMoisAffiche.getFullYear();
  const mois = dateMoisAffiche.getMonth();

  const premierJour = new Date(
    annee,
    mois,
    1
  );

  const nombreJours = new Date(
    annee,
    mois + 1,
    0
  ).getDate();

  const decalagePremierJour =
    (premierJour.getDay() + 6) % 7;

  for (
    let index = 0;
    index < decalagePremierJour;
    index += 1
  ) {
    const caseVide =
      document.createElement("div");

    caseVide.className =
      "jour-agenda jour-agenda-vide";

    grilleAgenda.appendChild(caseVide);
  }

  for (
    let numeroJour = 1;
    numeroJour <= nombreJours;
    numeroJour += 1
  ) {
    const dateJour = new Date(
      annee,
      mois,
      numeroJour
    );

    const reservation =
      obtenirReservationPourDate(
        dateJour,
        reservations
      );

    const caseJour =
      document.createElement("div");

    caseJour.className = "jour-agenda";

    const numeroJourElement =
      document.createElement("strong");

    numeroJourElement.textContent =
      String(numeroJour);

    caseJour.appendChild(numeroJourElement);

    if (estDateAujourdhui(dateJour)) {
      caseJour.classList.add(
        "jour-agenda-aujourdhui"
      );
    }

    if (reservation) {
      caseJour.classList.add(
        "jour-agenda-reserve"
      );

      const nomReservationElement =
        document.createElement("span");

      nomReservationElement.textContent =
        reservation.nom_reservation;

      caseJour.appendChild(
        nomReservationElement
      );

      caseJour.title =
        `${reservation.nom_reservation} — ` +
        `${reservation.responsable}`;
    }

    grilleAgenda.appendChild(caseJour);
  }
}


function obtenirReservationPourDate(
  date,
  reservations
) {
  const debutJour = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0
  );

  const finJour = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
    0,
    0,
    0,
    0
  );

  return reservations.find((reservation) => {
    const debutReservation =
      creerDateDepuisSql(
        reservation.date_debut
      );

    const finReservation =
      creerDateDepuisSql(
        reservation.date_fin
      );

    return (
      debutReservation < finJour &&
      finReservation > debutJour
    );
  });
}


function afficherListeReservations(reservations) {
  listeReservationsAgenda.replaceChildren();

  if (reservations.length === 0) {
    listeReservationsAgenda.textContent =
      "Aucune réservation pour ce mois.";

    return;
  }

  reservations.forEach((reservation) => {
    const carteReservation =
      document.createElement("article");

    carteReservation.className =
      "carte-reservation";

    const titre = document.createElement("h3");
    titre.textContent =
      reservation.nom_reservation;

    const responsable =
      document.createElement("p");

    responsable.textContent =
      `Responsable : ${reservation.responsable}`;

    const periode = document.createElement("p");

    periode.textContent =
      `Période : ${formaterPeriode(reservation)}`;

    const telephone =
      document.createElement("p");

    telephone.textContent =
      `Téléphone : ${reservation.telephone || "Non renseigné"}`;

    carteReservation.append(
      titre,
      responsable,
      periode,
      telephone
    );

    if (reservation.notes) {
      const notes = document.createElement("p");

      notes.textContent =
        `Notes : ${reservation.notes}`;

      carteReservation.appendChild(notes);
    }

    listeReservationsAgenda.appendChild(
      carteReservation
    );
  });
}


function formaterPeriode(reservation) {
  const dateDebut =
    creerDateDepuisSql(
      reservation.date_debut
    );

  const dateFin =
    creerDateDepuisSql(
      reservation.date_fin
    );

  const formateur =
    new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short"
    });

  return (
    `${formateur.format(dateDebut)} — ` +
    `${formateur.format(dateFin)}`
  );
}


function creerDateDepuisSql(dateSql) {
  if (!dateSql) {
    throw new Error(
      "La date de réservation est absente"
    );
  }

  // Compatibility with old date-only reservations.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateSql)) {
    const [annee, mois, jour] =
      dateSql.split("-").map(Number);

    return new Date(
      annee,
      mois - 1,
      jour
    );
  }

  const date = new Date(dateSql);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Date de réservation invalide : ${dateSql}`
    );
  }

  return date;
}





function estDateAujourdhui(date) {
  const aujourdHui = new Date();

  return (
    date.getFullYear() ===
      aujourdHui.getFullYear() &&
    date.getMonth() ===
      aujourdHui.getMonth() &&
    date.getDate() ===
      aujourdHui.getDate()
  );
}


function afficherMessageAgenda(
  message,
  estErreur = false
) {
  messageAgenda.textContent = message;

  messageAgenda.classList.toggle(
    "message-erreur",
    estErreur
  );
}