export function atualizarHP(

  elemento,
  atual,
  maximo

){

  const porcentagem =

    (atual / maximo) * 100;

  elemento.style.width =

    porcentagem + "%";

}