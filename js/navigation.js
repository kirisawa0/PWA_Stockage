const pagesNavigation = [
  {
    cle: "bodega",
    libelle: "Bodega",
    href: "./index.html",
    logo: "./icons/navigation/bodega.svg",
    pagesAssociees: ["", "index.html"]
  },
  {
    cle: "materiel",
    libelle: "Matériel",
    href: "./materiel.html",
    logo: "./icons/navigation/materiel.svg",
    pagesAssociees: ["materiel.html", "mouvements.html"]
  },
  {
    cle: "tonnelles",
    libelle: "Tonnelles",
    href: "./tonnelles.html",
    logo: "./icons/navigation/tonnelles.svg",
    pagesAssociees: [
      "tonnelles.html",
      "reservation-tonnelles.html",
      "agenda-tonnelles.html"
    ]
  },
  {
    cle: "minibus",
    libelle: "Minibus",
    href: "./minibus.html",
    logo: "./icons/navigation/minibus.svg",
    pagesAssociees: [
      "minibus.html",
      "reservationMinibus.html",
      "agendaminibus.html"
    ]
  }
];

function obtenirNomPageActuelle() {
  const chemin = window.location.pathname;
  return chemin.substring(chemin.lastIndexOf("/") + 1);
}

function obtenirClePageActive() {
  const nomPage = obtenirNomPageActuelle();

  const pageActive = pagesNavigation.find((page) => {
    return page.pagesAssociees.includes(nomPage);
  });

  return pageActive?.cle || null;
}

function creerLienNavigation(page, clePageActive) {
  const lien = document.createElement("a");
  lien.className = "lien-navigation";
  lien.href = page.href;
  lien.setAttribute("aria-label", page.libelle);

  if (page.cle === clePageActive) {
    lien.setAttribute("aria-current", "page");
  }

  const image = document.createElement("img");
  image.className = "icone-navigation";
  image.src = page.logo;
  image.alt = "";
  image.width = 25;
  image.height = 25;
  image.loading = "eager";

  const texte = document.createElement("span");
  texte.className = "texte-navigation";
  texte.textContent = page.libelle;

  lien.append(image, texte);
  return lien;
}

function ajouterNavigationBasse() {
  if (document.querySelector(".navigation-basse")) {
    return;
  }

  const navigation = document.createElement("nav");
  navigation.className = "navigation-basse";
  navigation.setAttribute("aria-label", "Navigation principale");

  const clePageActive = obtenirClePageActive();

  pagesNavigation.forEach((page) => {
    navigation.appendChild(
      creerLienNavigation(page, clePageActive)
    );
  });

  document.body.classList.add("avec-navigation-basse");
  document.body.appendChild(navigation);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ajouterNavigationBasse);
} else {
  ajouterNavigationBasse();
}
