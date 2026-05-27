export function arquivoParaBase64(
  arquivo
){

  return new Promise(
    (resolve) => {

      const reader =
        new FileReader();

      reader.readAsDataURL(
        arquivo
      );

      reader.onload = () => {

        resolve(reader.result);

      };

  });

}

export function comprimirImagem(
  arquivo
){

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

        const max = 700;

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

export async function processarAudio(
  arquivo
){

  return await arquivoParaBase64(
    arquivo
  );

}

export function criarPreviewImagem(
  arquivo,
  previewBox,
  callbackCancelar
){

  previewBox.innerHTML = "";

  const reader =
    new FileReader();

  reader.onload = (e) => {

    const container =
      document.createElement(
        "div"
      );

    container.className =
      "previewContainer";

    const img =
      document.createElement(
        "img"
      );

    img.src = e.target.result;

    const cancelar =
      document.createElement(
        "div"
      );

    cancelar.id = "cancelImg";

    cancelar.innerText = "×";

    cancelar.onclick = () => {

      previewBox.innerHTML = "";

      callbackCancelar();

    };

    container.appendChild(img);

    container.appendChild(cancelar);

    previewBox.appendChild(container);

  };

  reader.readAsDataURL(
    arquivo
  );

}

export function criarPreviewAudio(
  arquivo,
  previewBox,
  callbackCancelar
){

  previewBox.innerHTML = "";

  const container =
    document.createElement(
      "div"
    );

  container.className =
    "previewContainer";

  const audio =
    document.createElement(
      "audio"
    );

  audio.controls = true;

  audio.src =
    URL.createObjectURL(
      arquivo
    );

  const cancelar =
    document.createElement(
      "div"
    );

  cancelar.id = "cancelImg";

  cancelar.innerText = "×";

  cancelar.onclick = () => {

    previewBox.innerHTML = "";

    callbackCancelar();

  };

  container.appendChild(audio);

  container.appendChild(cancelar);

  previewBox.appendChild(container);

}