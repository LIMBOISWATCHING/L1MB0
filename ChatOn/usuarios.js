export const usuariosEspeciais = {

  "Limbo0911": {

    classe: "limbo0911",

    glitch: true

  },

  "Limbo1271": {

    classe: "limbo1271"

  },

  "LimboIsHere": {

    classe: "limboVoid",

    admin: true,

    senha: "371982465",

    invisivel: true

  },

  ":]": {

    classe: "roxo"

  },

  ":3": {

    classe: "chaos"

  }

};

export function obterUsuarioEspecial(
  nome
){

  return usuariosEspeciais[
    nome
  ];

}

export function gerarNomeGlitch(){

  const nomes = [

    "L###",
    "##A#",
    "####",
    "< 0 >",
    "O###",
    "#ly#",
    "###k",
    "&#%$",
    "W##a#i",
    "#fn###"

  ];

  return nomes[
    Math.floor(
      Math.random() *
      nomes.length
    )
  ];

}

