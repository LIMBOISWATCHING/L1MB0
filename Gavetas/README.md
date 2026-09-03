# Gaveta

Site pessoal, 100% navegador, usando Firebase Authentication (Google) + Realtime Database. Não usa Firebase Storage.

## O que há nesta versão
- Login Google.
- Realtime Database com Security Rules.
- Quantas fotos forem necessárias; não existe limite artificial de quantidade.
- Fotos comprimidas no navegador antes de serem salvas.
- Galeria, zoom em tela cheia, anterior/próxima e download individual.
- Arrastar fotos para reordenar antes de salvar.
- Área de arrastar e soltar para adicionar fotos.
- Pesquisa por título, filtro por tipo, favoritos e ordenação.
- Copiar endereço com um clique.
- Rascunho dos campos de texto salvo localmente no navegador.
- Aviso de alterações não salvas ao fechar a página.
- Exportar/importar backup JSON.
- Mensagens de erro mais claras, inclusive quando as Security Rules negam acesso.

## Configuração do Firebase
A configuração web já está em `app.js`. Ela pode ficar no navegador; a proteção real deve ser feita pelas Security Rules.

### Authentication
Firebase Console → Authentication → Sign-in method → Google: habilite o provedor.

Em Authentication → Settings → Authorized domains, autorize os hosts usados pelo site, por exemplo `localhost`, `127.0.0.1` e o domínio do GitHub Pages quando publicar.

### Realtime Database
Publique `database.rules.json` no Realtime Database e troque `SEU_EMAIL_1` e `SEU_EMAIL_2` pelos dois e-mails autorizados.

Se as regras continuarem com esses placeholders, login pode funcionar, mas leitura/escrita do banco será negada.

## Fotos
Cada foto é redimensionada para no máximo 1400 px no maior lado e comprimida para aproximadamente 1,6 MB ou menos. A regra do banco também possui um limite defensivo por foto. Não há limite artificial de quantidade de fotos no código.

O Realtime Database continua tendo limites e quotas. Em um arquivo pessoal pequeno isso costuma ser suficiente, mas uma quantidade muito grande de fotos pode aumentar o uso do banco e o tamanho dos backups.

## Atualizações do site
Alterar HTML/CSS/JS e publicar uma nova versão não exige refazer o Google Auth. O importante é continuar usando o mesmo projeto Firebase, a mesma configuração e manter os domínios autorizados.


## v8 — mobile
- Layout mobile edge-to-edge, sem moldura do gabinete.
- Texto com melhor quebra e botões maiores.
- Galeria mobile em coluna única para fotos realmente ocuparem a largura disponível.
- Miniaturas de 480px são salvas junto das fotos para reduzir o custo de decodificação no celular; o zoom continua usando a foto original.

## v9 — correção de fotos no mobile

- Edição agora usa `update()` com atualizações por caminho, em vez de substituir a gaveta inteira com `set()`.
- Fotos existentes são preservadas ao adicionar novas fotos.
- Fotos removidas são apagadas apenas quando explicitamente marcadas.
- Registros antigos com `photoData` são migrados sem perda da foto.
- Galeria usa carregamento eager e fallback da miniatura para a imagem completa, melhorando compatibilidade em celulares.
