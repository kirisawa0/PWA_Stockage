import { supabase } from "./supabase.js";

const selectionTonnelleAgenda =
  document.querySelector(
    "#selection-tonnelle-agenda"
  );

const agendaTonnelle = document.querySelector(
  "#agenda-tonnelle"
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
let identifiantTonnelleSelectionnee = null;

initialiserAgenda();


async function initialiserAgenda() {
  selectionTonnelleAgenda.addEventListener(
    "change",
    selectionnerTonnelle
  );

  boutonMoisPrecedent.addEventListener(
    "click",
    afficherMoisPrecedent
  );

  boutonMoisSuivant.addEventListener(
    "click",
    afficherMoisSuivant
  );

  await remplirSelectionTonnellesAgenda();
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


async function remplirSelectionTonnellesAgenda() {
  try {
    const tonnelles = await recupererTonnelles();

    tonnelles.forEach((tonnelle) => {
      const option = document.createElement("option");

      option.value = tonnelle.id;
      option.textContent = tonnelle.nombre;

      selectionTonnelleAgenda.appendChild(option);
    });
  } catch (error) {
    afficherMessageAgenda(
      `Impossible de charger les tonnelles : ${error.message}`,
      true
    );
  }
}


async function selectionnerTonnelle() {
  identifiantTonnelleSelectionnee =
    selectionTonnelleAgenda.value || null;

  if (!identifiantTonnelleSelectionnee) {
    agendaTonnelle.hidden = true;
    grilleAgenda.replaceChildren();
    listeReservationsAgenda.replaceChildren();
    afficherMessageAgenda("");

    return;
  }

  dateMoisAffiche = new Date();
  agendaTonnelle.hidden = false;

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
  const premierJour = new Date(
    dateMoisAffiche.getFullYear(),
    dateMoisAffiche.getMonth(),
    1
  );

  const dernierJour = new Date(
    dateMoisAffiche.getFullYear(),
    dateMoisAffiche.getMonth() + 1,
    0
  );

  const { data, error } = await supabase
    .from("reservations_tonnelles")
    .select(`
      id,
      nom_reservation,
      responsable,
      telephone,
      date_debut,
      date_fin,
      statut,
      notes
    `)
    .eq(
      "tonnelle_id",
      identifiantTonnelleSelectionnee
    )
    .neq("statut", "annulee")
    .lte(
      "date_debut",
      formaterDateSql(dernierJour)
    )
    .gte(
      "date_fin",
      formaterDateSql(premierJour)
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
  const dateFormatee = formaterDateSql(date);

  return reservations.find((reservation) => {
    return (
      dateFormatee >= reservation.date_debut &&
      dateFormatee <= reservation.date_fin
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
      dateStyle: "medium"
    });

  return (
    `${formateur.format(dateDebut)} — ` +
    `${formateur.format(dateFin)}`
  );
}


function creerDateDepuisSql(dateSql) {
  const [annee, mois, jour] =
    dateSql.split("-").map(Number);

  return new Date(
    annee,
    mois - 1,
    jour
  );
}


function formaterDateSql(date) {
  const annee = date.getFullYear();
  const mois = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const jour = String(
    date.getDate()
  ).padStart(2, "0");

  return `${annee}-${mois}-${jour}`;
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