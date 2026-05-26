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
  "Zero"
];

let nome = "";

let sala = "";

let senha = "";

let mensagensRef;

let onlineRef;

let configRef;

let salaPersistente = false;

let userStatusRef = null;

entrar.onclick = () => {

  nome = nickInput.value.trim();

  if(!nome){

    nome =
      nomes[
        Math.floor(
          Math.random() * nomes.length
        )
      ] +
      Math.floor(Math.random() * 999);

  }

  document.getElementById("configBox")
  .style.display = "none";

  atualizarSala();

};

async function atualizarSala(){

  senha =
    senhaInput.value.trim();

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
          dados.texto
        );

    }catch{

      dados.texto =
        "[criptografada]";

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

});

function criarMensagem(id, dados){

  if(document.getElementById(id))
    return;

  const div =
    document.createElement("div");

  div.classList.add("msg");

  div.id = id;

  if(dados.imagem){

    div.innerHTML = `

      <div class="nome">
        ${dados.nome}
      </div>

      ${
        dados.texto
          ? `<div>${dados.texto}</div>`
          : ""
      }

      <img src="${dados.imagem}">

    `;

  }else{

    div.innerHTML = `

      <span class="nome">
        ${dados.nome}:
      </span>

      ${dados.texto}

    `;

  }

  chat.appendChild(div);

  chat.scrollTop =
    chat.scrollHeight;

  const img =
    div.querySelector("img");

  if(img){

    img.onclick = () => {

      modalImg.src = img.src;

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

    div.classList.add("sumindo");

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

  chat.appendChild(div);

  chat.scrollTop =
    chat.scrollHeight;

  const img =
    div.querySelector("img");

  if(img){

    img.onclick = () => {

      modalImg.src = img.src;

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

    div.classList.add("sumindo");

  }, tempoRestante - 2000);

  setTimeout(() => {

    remove(
      ref(
        db,
        "salas/" +
        sala +
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

    let auto = 900;

    const comando =
      texto.match(/^\/(\d+)\s/);

    if(comando){

      auto =
        parseInt(comando[1]);

      texto =
        texto.replace(
          /^\/\d+\s/,
          ""
        );

    }

    const arquivo =
      imagem.files[0];

    let imagemBase64 = null;

    if(arquivo){

      imagemBase64 =
        await comprimirImagem(
          arquivo
        );

    }

    if(!texto && !imagemBase64)
      return;

    texto =
      await criptografar(texto);

    const novaMensagem =
      push(mensagensRef);

    set(novaMensagem, {

      nome,
      texto,
      imagem: imagemBase64,
      tempo: Date.now(),
      autodestruir: auto

    });

    input.value = "";

    imagem.value = "";

    previewBox.innerHTML = "";

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

    mostrarPreview(
      imagem.files[0]
    );

});

function mostrarPreview(arquivo){

  previewBox.innerHTML = "";

  if(!arquivo) return;

  const container =
    document.createElement("div");

  container.classList.add(
    "previewContainer"
  );

  const img =
    document.createElement("img");

  const cancel =
    document.createElement("div");

  cancel.id = "cancelImg";

  cancel.innerText = "X";

  cancel.onclick = () => {

    imagem.value = "";

    previewBox.innerHTML = "";

  };

  const reader =
    new FileReader();

  reader.onload = () => {

    img.src = reader.result;

  };

  reader.readAsDataURL(arquivo);

  container.appendChild(img);

  container.appendChild(cancel);

  previewBox.appendChild(container);

}

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

      mostrarPreview(arquivo);

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

    await conectarSala();

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

function comprimirImagem(arquivo){

  return new Promise((resolve) => {

    const reader =
      new FileReader();

    reader.readAsDataURL(arquivo);

    reader.onload = (event) => {

      const img = new Image();

      img.src =
        event.target.result;

      img.onload = () => {

        const canvas =
          document.createElement(
            "canvas"
          );

        const max = 600;

        let width =
          img.width;

        let height =
          img.height;

        if(width > height){

          if(width > max){

            height *=
              max / width;

            width = max;

          }

        }else{

          if(height > max){

            width *=
              max / height;

            height = max;

          }

        }

        canvas.width = width;

        canvas.height = height;

        const ctx =
          canvas.getContext("2d");

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        resolve(

          canvas.toDataURL(
            "image/jpeg",
            0.6
          )

        );

      };

    };

  });

}