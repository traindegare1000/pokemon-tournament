function afficherApercu() {
  let equipeJ1 = JSON.parse(localStorage.getItem("equipeJ1")) || [];
  let equipeJ2 = JSON.parse(localStorage.getItem("equipeJ2")) || [];

  let conteneurJ1 = document.getElementById("equipe-j1");
  let conteneurJ2 = document.getElementById("equipe-j2");

  conteneurJ1.innerHTML = "";
  conteneurJ2.innerHTML = "";

  equipeJ1.forEach(pokemon => {
    let img = document.createElement("img");
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.numero}.png`;
    conteneurJ1.appendChild(img);
  });

  equipeJ2.forEach(pokemon => {
    let img = document.createElement("img");
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.numero}.png`;
    conteneurJ2.appendChild(img);
  });
}

function choisirEquipe(joueur) {
  localStorage.setItem("joueurActuel", joueur);
  window.location.href = "index.html";
}

function lancerCombat() {
  let equipeJ1 = JSON.parse(localStorage.getItem("equipeJ1")) || [];
  let equipeJ2 = JSON.parse(localStorage.getItem("equipeJ2")) || [];

  if (equipeJ1.length === 0 || equipeJ2.length === 0) {
    alert("Les deux joueurs doivent choisir leur équipe avant de commencer !");
    return;
  }

  window.location.href = "combat.html";
}

afficherApercu();