export function ataqueInimigo(

  criatura,
  textoElemento,
  playerHPObj,
  playerHPFill

){

  if(
    !criatura.ataquesInimigo
  ) return;

  const atk =

    criatura.ataquesInimigo[

      Math.floor(

        Math.random() *

        criatura.ataquesInimigo.length

      )

    ];

  playerHPObj.valor -=
    atk.dano;

  if(
    playerHPObj.valor < 0
  ){

    playerHPObj.valor = 0;

  }

  playerHPFill.style.width =

    (
      playerHPObj.valor / 100
    ) * 100 + "%";

  textoElemento.innerText =

    atk.texto;

  /* GLITCH */

  if(
    atk.glitch
  ){

    document.body
      .classList.add(
        "battleGlitch"
      );

    setTimeout(() => {

      document.body
        .classList.remove(
          "battleGlitch"
        );

    }, 500);

  }

  /* MORTE */

  if(
    playerHPObj.valor <= 0
  ){

    textoElemento.innerText =

      "VOCÊ FOI CONSUMIDO.";

  }

}