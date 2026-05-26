import { initializeApp }

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

  getDatabase,
  ref,
  push,
  set,
  onChildAdded,
  onValue,
  remove,
  onDisconnect

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {

  apiKey: "AIzaSyDU86YIxOEF4PniyquLKQJoNckxhkKIXFI",

  authDomain: "chaton-3ee70.firebaseapp.com",

  databaseURL: "https://chaton-3ee70-default-rtdb.firebaseio.com/",

  projectId: "chaton-3ee70",

  storageBucket: "chaton-3ee70.firebasestorage.app",

  messagingSenderId: "725824098805",

  appId: "1:725824098805:web:636f25ab9360de14d050bc"

};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const mensagensRef = ref(db, "mensagens");

const onlineRef = ref(db, "online");

const chat = document.getElementById("chat");

const form = document.getElementById("form");

const input = document.getElementById("input");

const online = document.getElementById("online");

const nickInput = document.getElementById("nickInput");

const entrar = document.getElementById("entrar");

const nomes = [

  "Ghost",
  "Void",
  "Luna",
  "Echo",
  "Neko",
  "Shade",
  "Zero"

];

let nome = "";

entrar.onclick = () => {

  nome = nickInput.value.trim();

  if(!nome){

    nome =
      nomes[Math.floor(Math.random() * nomes.length)] +
      Math.floor(Math.random() * 999);

  }

  document.getElementById("nickBox")
  .style.display = "none";

};

const userId =
  Math.random().toString(36).substring(2);

const userStatusRef =
  ref(db, "online/" + userId);

set(userStatusRef, true);

onDisconnect(userStatusRef).remove();

onValue(onlineRef, (snapshot) => {

  const total = snapshot.size || 0;

  online.innerText = total + " online";

});

function criarMensagem(id, dados){

  if(document.getElementById(id)) return;

  const div = document.createElement("div");

  div.classList.add("msg");

  div.id = id;

  div.innerHTML = `
    <span class="nome">${dados.nome}:</span>
    ${dados.texto}
  `;

  chat.appendChild(div);

  chat.scrollTop = chat.scrollHeight;

  const tempoRestante =
    900000 - (Date.now() - dados.tempo);

  if(tempoRestante <= 0){

    remove(ref(db, "mensagens/" + id));

    return;

  }

  setTimeout(() => {

    div.classList.add("sumindo");

  }, tempoRestante - 2000);

  setTimeout(() => {

    remove(ref(db, "mensagens/" + id));

  }, tempoRestante);

}

onChildAdded(mensagensRef, (snapshot) => {

  const dados = snapshot.val();

  criarMensagem(snapshot.key, dados);

});

onValue(mensagensRef, (snapshot) => {

  snapshot.forEach((msg) => {

    const dados = msg.val();

    if(Date.now() - dados.tempo > 900000){

      remove(ref(db, "mensagens/" + msg.key));

    }

  });

});

form.addEventListener("submit", (e) => {

  e.preventDefault();

  if(!nome){

    alert("Escolha um nick primeiro");

    return;

  }

  const texto = input.value.trim();

  if(!texto) return;

  const novaMensagem = push(mensagensRef);

  set(novaMensagem, {

    nome,
    texto,
    tempo: Date.now()

  });

  input.value = "";

});