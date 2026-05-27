import {

  criarAtaques

}

from "./engine/ataques.js";

import {

  criaturas

}

from "./criaturas/criaturas.js";

import {

  ataqueInimigo

}

from "./engine/inimigo.js";

import {

  atualizarHP

}

from "./engine/hp.js";

import {

  usarAtaque

}

from "./engine/ataques.js";

import {

  criarEscolhas

}

from "./engine/escolhas.js";

import {

  iniciarGlitch

}

from "./engine/glitch.js";

const params =
  new URLSearchParams(
    location.search
  );

const id =
  params.get("id");

const criatura =
  criaturas[id];

const enemyImage =
  document.getElementById(
    "enemyImage"
  );

const enemyName =
  document.getElementById(
    "enemyName"
  );

const battleMusic =
  document.getElementById(
    "battleMusic"
  );

  const hpFill =
  document.getElementById(
    "hpFill"
  );

const battleText =
  document.getElementById(
    "battleText"
  );

const attackArea =
  document.getElementById(
    "attackArea"
  );

if(criatura){

  enemyName.innerText =
    criatura.nome;

  enemyImage.src =
    criatura.imagem;

  battleMusic.src =
    criatura.musica;

  battleMusic.volume =
    0.6;

  battleMusic.play();

  const playerHPObj = {

  valor:100

};

  iniciarGlitch(
  criatura.glitch
);
}

const hpAtualObj = {

  valor:
    criatura.hp

};

criarEscolhas(

  criatura.escolhas,

  document.getElementById(
    "choices"
  ),

  document.getElementById(
    "battleText"
  )

);

criarAtaques(

  criatura,

  attackArea,

  battleText,

  hpAtualObj,

  hpFill,

  () => {

    setTimeout(() => {

      ataqueInimigo(

        criatura,

        battleText,

        playerHPObj,

        playerHPFill

      );

    }, 1200);

  }

);

const ataque =

  usarAtaque(
    criatura
  );

console.log(
  ataque.texto
);

const playerHPFill =
  document.getElementById(
    "playerHPFill"
  );