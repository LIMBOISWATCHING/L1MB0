import {

  ataquesPlayer

}

from "../player/ataquesPlayer.js";

export function criarAtaques(

  criatura,
  container,
  textoElemento,
  hpAtualObj,
  hpFill,
  callbackInimigo

){

  container.innerHTML = "";

  ataquesPlayer
    .slice(0, 4)
    .forEach((atk) => {

      const btn =
        document.createElement(
          "div"
        );

      btn.className =
        "attackBtn";

      btn.innerHTML = `

        <img
          src="${atk.icone}"
        >

        <div class="attackInfo">

          <div class="attackNome">

            ${atk.nome}

          </div>

          <div class="attackDesc">

            ${atk.descricao}

          </div>

        </div>

      `;

      btn.onclick = () => {

        hpAtualObj.valor -=
          atk.dano;

        if(
          hpAtualObj.valor < 0
        ){

          hpAtualObj.valor = 0;

        }

        hpFill.style.width =

          (
            hpAtualObj.valor /

            criatura.hp
          ) * 100 + "%";

        textoElemento.innerText =

          atk.texto;

        /* MORTE */

        if(
          hpAtualObj.valor <= 0
        ){

          textoElemento.innerText =

            criatura.nome +
            " FOI CONSUMIDO.";

          document.body
            .classList.add(
              "battleGlitch"
            );
            if(
  hpAtualObj.valor > 0
){

  callbackInimigo();

}

        }

      };

      container.appendChild(
        btn
      );

    });

}