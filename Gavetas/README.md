# Gaveta — Realtime Database + Base64 + login

Esta versão não usa Firebase Storage. As fotos são redimensionadas e comprimidas no navegador e salvas como Base64 dentro do Firebase Realtime Database. Também existe botão para baixar a foto novamente.

## O que você precisa fazer no Firebase

### 1. Ativar Authentication
No Firebase Console:
1. Abra o projeto `banco-de-dados-geral-l1mb0`.
2. Vá em **Authentication → Sign-in method**.
3. Ative **Google**.
4. Em **Authentication → Settings → Authorized domains**, deixe o domínio onde o site será hospedado autorizado. Para testes locais, use um servidor local (por exemplo, a extensão Live Server do VS Code), em vez de abrir o HTML com `file://`.

### 2. Criar/usar as contas autorizadas
O site usa login Google. Você pode usar duas contas, uma para cada pessoa que terá acesso. O arquivo `database.rules.json` está preparado para isso.

Abra `database.rules.json` e troque:
- `SEU_EMAIL_1` pelo primeiro e-mail Google autorizado.
- `SEU_EMAIL_2` pelo segundo e-mail Google autorizado.

Se quiser somente uma conta, repita o mesmo e-mail nos dois lugares.

### 3. Colocar as Security Rules
No Firebase Console, abra **Realtime Database → Rules**, substitua as regras atuais pelas regras de `database.rules.json` (já com os e-mails trocados) e publique.

As regras começam negando tudo e só liberam `/gaveta/items` para os dois e-mails autenticados e verificados. Não use `auth != null` sozinho se o banco contém dados privados compartilhados por vocês.

### 4. Não precisa configurar Storage
Esta versão não importa nem chama Firebase Storage. O campo `storageBucket` continua no objeto de configuração porque faz parte da configuração gerada pelo Firebase, mas o site não usa Storage.

## Fotos

- A imagem original não é enviada para o Firebase.
- O navegador redimensiona a maior dimensão para no máximo 1400 px.
- A imagem é convertida para JPEG e comprimida.
- O alvo é aproximadamente até 1,6 MB por foto.
- O resultado é salvo no campo `photoData` como Data URL/Base64.
- O botão **Baixar foto** recria o arquivo a partir desse Data URL.

Isso economiza bastante espaço comparado a guardar fotos originais, mas Base64 ainda ocupa mais espaço que o arquivo binário. O Realtime Database no plano Spark possui 1 GB de armazenamento e 10 GB/mês de downloads; portanto, esta solução é indicada para um arquivo pessoal pequeno, não para uma galeria enorme.

## Estrutura

`gaveta/items/<id>`

Cada item possui título, tipo, texto, endereço, tags, favorito, datas, usuário que atualizou e, quando houver, `photoData`.

## Importante

A `apiKey` do Firebase Web não é uma senha. A proteção real deste projeto vem do Firebase Authentication + Security Rules. Não coloque senhas ou tokens secretos no JavaScript.
