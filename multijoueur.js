const socket = io();

function allerChoisirEquipe(action) {
  if (action === "rejoindre") {
    let code = document.getElementById("input-code").value.trim().toUpperCase();
    if (code.length !== 6) {
      alert("Entre un code valide de 6 caractères !");
      return;
    }
    localStorage.setItem("actionMultijoueur", "rejoindre");
    localStorage.setItem("codeMultijoueur", code);
    localStorage.setItem("joueurActuel", "2");
  } else {
    localStorage.setItem("actionMultijoueur", "creer");
    localStorage.setItem("joueurActuel", "1");
  }

  localStorage.setItem("modeEquipeMulti", "true");
  window.location.href = "index.html";
}

window.onload = () => {
  let action = localStorage.getItem("actionMultijoueur");

  let equipeJ1 = JSON.parse(localStorage.getItem("equipeJ1")) || [];
  let equipeJ2 = JSON.parse(localStorage.getItem("equipeJ2")) || [];

  let monEquipe = action === "creer" ? equipeJ1 : equipeJ2;

  if (!action || monEquipe.length === 0) return;

  if (action === "creer") {
    socket.emit("creer-salle", monEquipe);

    socket.on("salle-creee", (code) => {
      document.getElementById("zone-code").classList.remove("cache");
      document.getElementById("zone-code").classList.add("ouvert");
      document.getElementById("code-salle").textContent = code;
      localStorage.setItem("codeMultijoueur", code);
      localStorage.setItem("roleMultijoueur", "joueur1");
    });

  } else if (action === "rejoindre") {
    let code = localStorage.getItem("codeMultijoueur");
    socket.emit("rejoindre-salle", { code: code, equipe: monEquipe });
    localStorage.setItem("roleMultijoueur", "joueur2");
  }

  socket.on("combat-pret", ({ equipeJ1, equipeJ2 }) => {
    localStorage.setItem("equipeJ1", JSON.stringify(equipeJ1));
    localStorage.setItem("equipeJ2", JSON.stringify(equipeJ2));
    localStorage.setItem("modeMultijoueur", "true");
    window.location.href = "combat.html";
  });

  socket.on("erreur", (message) => {
    alert(message);
  });
};