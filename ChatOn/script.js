import {

  obterUsuarioEspecial,
  gerarNomeGlitch

}

from "./usuarios.js";

import {

  arquivoParaBase64,
  comprimirImagem,
  processarAudio,
  criarPreviewImagem,
  criarPreviewAudio

}

from "./media.js";

import { initializeApp }



from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

  getDatabase,
  ref,
  push,
  set,
  onChildAdded,
  onChildRemoved,
  onValue,
  remove,
  onDisconnect,
  off

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

const chat =
  document.getElementById("chat");

const form =
  document.getElementById("form");

const input =
  document.getElementById("input");

const imagem =
  document.getElementById("imagem");

const audio =
  document.getElementById("audio");

const previewBox =
  document.getElementById("previewBox");

const online =
  document.getElementById("online");

const nickInput =
  document.getElementById("nickInput");

const senhaInput =
  document.getElementById("senhaInput");

const salaInput =
  document.getElementById("salaInput");

const entrar =
  document.getElementById("entrar");

  const nickHistorico =
  document.getElementById(
    "nickHistorico"
  );

  const login =
  document.getElementById(
    "login"
  );

const saveBtn =
  document.getElementById("saveBtn");

const clearBtn =
  document.getElementById("clearBtn");

const imageModal =
  document.getElementById("imageModal");

const modalImg =
  document.getElementById("modalImg");

const nomes = [

  "Ghost",
  "Void",
  "Luna",
  "Echo",
  "Chaos",
  "Justice",
  "Death",
  "Shade",
  "Zero",
  "Signal",
  "Decay",
  "Static",
  "Null",
  "Error",
  "Forgotten",
  "Hollow",
  "Unknown",
  "N0ISE"

];

let nome = "";

let sala = "";

let senha = "";

let mensagensRef;

let modoLimbo =
  false;

let onlineRef;

let configRef;

let salaPersistente = false;

let userStatusRef = null;

carregarHistoricoNicks();

entrar.onclick = async () => {

  if(nome) return;

  nome =
    nickInput.value.trim();

  senha =
    senhaInput.value.trim();

  modoLimbo = false;

  if(
    nome ===
    "LimboIsHere"
  ){

    modoLimbo =
      senha ===
      "371982465";

  }

if(!nome){

  const aleatorio =

    nomes[
      Math.floor(
        Math.random() *
        nomes.length
      )
    ];

  nome =

    aleatorio +

    "_" +

    Math.floor(
      Math.random() * 999
    );

}

  login.style.display =
    "none";

entrar.disabled = true;

salvarNick(nome);

const batalhasSecretas = {

  "Null":
    "void",

  "000111":
    "watcher",

  "999999":
    "echo"

};

if(

  batalhasSecretas[senha]

){

  location.href =

    "batalhas/batalha.html?id=" +

    batalhasSecretas[senha];

  return;

}

  await atualizarSala();

};

async function atualizarSala(){

  senha =
    senhaInput.value.trim();

    if(
  nome ===
  "LimboIsHere"
){

  modoLimbo =
    senha ===
    "371982465";

}

  let novaSala =
    salaInput.value
      .trim()
      .replace("#", "");

  if(!novaSala){

    novaSala = "global";

  }

  if(userStatusRef){

    await remove(userStatusRef);

  }

  sala = novaSala;

  conectarSala();

}

async function conectarSala(){

  if(mensagensRef){

  off(mensagensRef);

}

if(onlineRef){

  off(onlineRef);

}

if(configRef){

  off(configRef);

}

  if(userStatusRef){

    await remove(userStatusRef);

  }

  chat.innerHTML = "";

  mensagensRef =
    ref(
      db,
      "salas/" +
      sala +
      "/mensagens"
    );

  onlineRef =
    ref(
      db,
      "salas/" +
      sala +
      "/online"
    );

  configRef =
    ref(
      db,
      "salas/" +
      sala +
      "/config"
    );

  iniciarChat();

}

function iniciarChat(){

  const userId =
    Math.random().toString(36).substring(2);

  userStatusRef =
    ref(
      db,
      "salas/" +
      sala +
      "/online/" +
      userId
    );

  set(userStatusRef, true);

  onDisconnect(userStatusRef).remove();

  onValue(configRef, (snapshot) => {

    const dados = snapshot.val();

    salaPersistente =
      dados?.persistente || false;

    saveBtn.innerText =
      salaPersistente
        ? "ON"
        : "SAVE";

  });

  onValue(onlineRef, (snapshot) => {

    const total = snapshot.size || 0;

    online.innerText =
      total + " online";

  });

  onChildAdded(
  mensagensRef,
  async (snapshot) => {

    const dados =
      snapshot.val();

try{

  dados.texto =
    await descriptografar(
      dados.texto,
      senha
    );

}catch{

  if(modoLimbo){

    dados.texto =
      "[CRIPT]"
      + dados.texto;

  }else{

    dados.texto =
      "[mensagem protegida]";

  }

}

    criarMensagem(
      snapshot.key,
      dados
    );

});

onChildRemoved(
  mensagensRef,
  (snapshot) => {

    const elemento =
      document.getElementById(
        snapshot.key
      );

    if(elemento){

      elemento.remove();

    }

  }

);

}

function criarMensagem(
  id,
  dados
){

  if(
    dados.glitchGlobal
  ){

const mensagens =
  document.querySelectorAll(
    ".textoMsg"
  );

const textosOriginais = [];

mensagens.forEach(
  (el, i) => {

    textosOriginais[i] =
      el.innerHTML;

  }
);

let flashes = 0;

const glitchLoop =
  setInterval(() => {

    document.body
      .classList.toggle(
        "globalGlitch"
      );

    mensagens.forEach((el) => {

      if(
        Math.random() < 0.5
      ){

        el.innerHTML =
          "< 0 >";

      }else{

        el.innerHTML =
          `
          <span
            style="
              opacity:0.5;
            "
          >
            #!%&
          </span>
          `;

      }

    });

    flashes++;

    if(flashes >= 8){

      clearInterval(
        glitchLoop
      );

      document.body
        .classList.add(
          "globalGlitch"
        );

      setTimeout(() => {

        document.body
          .classList.remove(
            "globalGlitch"
          );

      }, 1200);

    }

  }, 80);

    chat.innerHTML = "";

    if(
      dados.nome ===
      "LimboIsHere"
    ){

      remove(
        mensagensRef
      );

    }

    return;

  }

  const div =
    document.createElement(
      "div"
    );

  div.classList.add("msg");

  div.id = id;

  const especial =
    obterUsuarioEspecial(
      dados.nome
    );

  let nomeVisual =
    dados.nome || "";

  let classeEspecial =
    "";

  if(especial){

    classeEspecial =
      especial.classe || "";

    if(
      dados.nome ===
      "Limbo0911"
    ){

      nomeVisual =
        "Limbo0911";

    }

    if(
      dados.nome ===
      "LimboIsHere"
    ){

      nomeVisual = "";

    }

  }

  div.innerHTML = `

    <span class="nome ${classeEspecial}">

      ${nomeVisual}

    </span>

    ${
      dados.texto
      ? `

      <div class="textoMsg">

        ${
          dados.nome ===
          "LimboIsHere"

          ? `< ${dados.texto} >`

          : dados.texto
        }

      </div>

      `
      : ""
    }

    ${
      dados.imagem
      ? `

      <img
        src="${dados.imagem}"
        class="imgMsg"
      >

      `
      : ""
    }

    ${
      dados.audio
      ? `

      <div class="audioBox">

        <audio controls>

          <source
            src="${dados.audio}"
          >

        </audio>

      </div>

      `
      : ""
    }

  `;

  if(
    dados.nome ===
    ":3:"
  ){

    setInterval(() => {

      if(
        Math.random() < 0.08
      ){

        const nomeEl =
          div.querySelector(
            ".nome"
          );

        nomeEl.classList.add(
          "chaosAtivo"
        );

        setTimeout(() => {

          nomeEl.classList.remove(
            "chaosAtivo"
          );

        }, 400);

      }

    }, 3000);

  }

  if(
    dados.nome ===
    "Limbo0911"
  ){

    const nomeEl =
      div.querySelector(
        ".nome"
      );

    setInterval(() => {

      if(
        Math.random() < 0.18
      ){

        nomeEl.innerText =
          gerarNomeGlitch();

        setTimeout(() => {

          nomeEl.innerText =
            "Limbo0911";

        }, 1000);

      }

    }, 2500);

  }

  chat.appendChild(div);

  chat.scrollTop =
    chat.scrollHeight;

  const img =
    div.querySelector("img");

  if(img){

    img.onclick = () => {

      modalImg.src =
        img.src;

      imageModal.style.display =
        "flex";

    };

  }

  if(salaPersistente){

    return;

  }

  const tempo =
    dados.autodestruir || 900;

  const tempoRestante =
    (tempo * 1000) -
    (Date.now() - dados.tempo);

  if(tempoRestante <= 0){

    remove(
      ref(
        db,
        "salas/" +
        sala +
        "/mensagens/" +
        id
      )
    );

    return;

  }

  setTimeout(() => {

    div.classList.add(
      "sumindo"
    );

  }, tempoRestante - 2000);

  const salaAtual = sala;

  setTimeout(() => {

    remove(
      ref(
        db,
        "salas/" +
        salaAtual +
        "/mensagens/" +
        id
      )
    );

  }, tempoRestante);

}
form.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    let texto =
      input.value.trim();

    const arquivo =
      imagem.files[0];

    const audioArquivo =
      audio.files[0];

    let imagemBase64 = null;

    let audioBase64 = null;

    let tempoTemp = 900;

if(

  texto.startsWith("/") &&

  texto !== "/glitch"

){

  const partes =
    texto.split(" ");

  const numero =
    parseInt(

      partes[0]
        .replace("/", "")

    );

  if(!isNaN(numero)){

    tempoTemp = numero;

    texto =
      partes
        .slice(1)
        .join(" ");

  }

}

    if(arquivo){

      imagemBase64 =
        await comprimirImagem(
          arquivo
        );

    }

    if(audioArquivo){

      audioBase64 =
        await processarAudio(
          audioArquivo
        );

    }

let glitchGlobal =
  false;

/* GLITCH */

if(

  modoLimbo &&

  texto.trim().toLowerCase() ===
  "/glitch"

){

  glitchGlobal = true;

  texto = "";

}

/* IMPEDIR VAZIO */

if(
  !texto &&
  !imagemBase64 &&
  !audioBase64 &&
  !glitchGlobal
){

  return;

}

/* CRIPTOGRAFIA */

texto =
  await criptografar(
    texto,
    senha
  );

    const textoTemp =
      texto;

    const imagemTemp =
      imagemBase64;

    const audioTemp =
      audioBase64;

    input.value = "";

    imagem.value = "";

    audio.value = "";

    previewBox.innerHTML = "";

    const novaMensagem =
      push(mensagensRef);


await set(
  novaMensagem,
  {

    nome,

    texto: textoTemp,

    imagem: imagemTemp,

    audio: audioTemp,

    glitchGlobal,

    tempo: Date.now(),

    autodestruir:
      tempoTemp

  }
);

});

saveBtn.onclick = async () => {

  if(sala === "global"){

    alert("Não permitido");

    return;

  }

  salaPersistente =
    !salaPersistente;

  await set(configRef, {

    persistente:
      salaPersistente

  });

};

clearBtn.onclick = async () => {

  if(sala === "global"){

    alert("Não permitido");

    return;

  }

  if(confirm("Limpar sala?")){

    await remove(
      ref(
        db,
        "salas/" +
        sala +
        "/mensagens"
      )
    );

    chat.innerHTML = "";

  }

};

imagem.addEventListener(
  "change",
  () => {

    const arquivo =
      imagem.files[0];

    if(!arquivo) return;

    criarPreviewImagem(

      arquivo,

      previewBox,

      () => {

        imagem.value = "";

      }

    );

});

audio.addEventListener(
  "change",
  () => {

    const arquivo =
      audio.files[0];

    if(!arquivo) return;

    criarPreviewAudio(

      arquivo,

      previewBox,

      () => {

        audio.value = "";

      }

    );

});

chat.addEventListener(
  "dragover",
  (e) => {

    e.preventDefault();

    chat.classList.add(
      "dragging"
    );

});

chat.addEventListener(
  "dragleave",
  () => {

    chat.classList.remove(
      "dragging"
    );

});

chat.addEventListener(
  "drop",
  (e) => {

    e.preventDefault();

    chat.classList.remove(
      "dragging"
    );

    const arquivo =
      e.dataTransfer.files[0];

    if(
      arquivo &&
      arquivo.type.startsWith(
        "image/"
      )
    ){

      imagem.files =
        e.dataTransfer.files;

      criarPreviewImagem(

  arquivo,

  previewBox,

  () => {

    imagem.value = "";

  }

);

    }

});

imageModal.onclick = () => {

  imageModal.style.display =
    "none";

};

salaInput.addEventListener(
  "input",
  async () => {

    if(!nome) return;

    await atualizarSala();

});

senhaInput.addEventListener(
  "change",
  async () => {

    senha =
      senhaInput.value.trim();

    if(!nome) return;

    chat.innerHTML = "";

    await atualizarSala();

});

async function criptografar(texto){

  if(!senha) return texto;

  return btoa(

    texto
      .split("")
      .map((c, i) =>

        String.fromCharCode(

          c.charCodeAt(0) ^

          senha.charCodeAt(
            i % senha.length
          )

        )

      )
      .join("")

  );

}

async function descriptografar(texto){

  if(!senha) return texto;

  return atob(texto)
    .split("")
    .map((c, i) =>

      String.fromCharCode(

        c.charCodeAt(0) ^

        senha.charCodeAt(
          i % senha.length
        )

      )

    )
    .join("");

}

function salvarNick(nick){

  let lista =
    JSON.parse(

      localStorage.getItem(
        "nickHistorico"
      ) || "[]"

    );

  lista =
    lista.filter(
      n => n !== nick
    );

  lista.unshift(nick);

  lista =
    lista.slice(0, 8);

  localStorage.setItem(

    "nickHistorico",

    JSON.stringify(lista)

  );

}

function carregarHistoricoNicks(){

  const lista =
    JSON.parse(

      localStorage.getItem(
        "nickHistorico"
      ) || "[]"

    );

  nickHistorico.innerHTML =
    "";

  lista.forEach((nick) => {

    const box =
      document.createElement(
        "div"
      );

    box.className =
      "nickBox";

    const btn =
      document.createElement(
        "button"
      );

    btn.className =
      "nickSalvo";

    btn.innerText =
      nick;

    btn.onclick = () => {

      nickInput.value =
        nick;

    };

    const apagar =
      document.createElement(
        "span"
      );

    apagar.className =
      "apagarNick";

    apagar.innerText =
      "×";

    apagar.onclick = (e) => {

      e.stopPropagation();

      let listaAtual =
        JSON.parse(

          localStorage.getItem(
            "nickHistorico"
          ) || "[]"

        );

      listaAtual =
        listaAtual.filter(
          n => n !== nick
        );

      localStorage.setItem(

        "nickHistorico",

        JSON.stringify(
          listaAtual
        )

      );

      carregarHistoricoNicks();

    };

    box.appendChild(btn);

    box.appendChild(apagar);

    nickHistorico.appendChild(
      box
    );

  });

}