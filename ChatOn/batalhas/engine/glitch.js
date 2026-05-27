export function iniciarGlitch(

  config

){

  if(
    !config
  ) return;

  let flashes = 0;

  const loop =
    setInterval(() => {

      document.body
        .classList.toggle(
          "battleGlitch"
        );

      if(
        config.distorcerTexto
      ){

        document.body
          .classList.toggle(
            "textoBugado"
          );

      }

      flashes++;

      if(
        flashes >=
        config.intensidade
      ){

        clearInterval(loop);

        document.body
          .classList.remove(
            "battleGlitch"
          );

      }

    }, 80);

}