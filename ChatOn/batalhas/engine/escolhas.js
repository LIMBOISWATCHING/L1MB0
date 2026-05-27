export function criarEscolhas(

  escolhas,
  container,
  textoElemento

){

  container.innerHTML = "";

  escolhas.forEach((e) => {

    const btn =
      document.createElement(
        "button"
      );

    btn.className =
      "choiceBtn";

    btn.innerText =
      e.texto;

    btn.onclick = () => {

      textoElemento.innerText =
        e.resultado;

    };

    container.appendChild(
      btn
    );

  });

}