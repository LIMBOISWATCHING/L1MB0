# Gaveta — v12

Atualização corretiva baseada na v11.

## Correções
- Bloqueia envios simultâneos do formulário para evitar gravar as mesmas fotos várias vezes.
- Impede processamentos simultâneos de seleções de fotos e ignora arquivos repetidos no mesmo formulário.
- Usa sempre a chave real do Realtime Database como ID da foto, corrigindo a remoção de fotos com IDs internos antigos.
- Reativa corretamente os botões individuais de remoção.
- Ao editar uma gaveta, identifica fotos com conteúdo Base64 idêntico e oferece a ação **Remover duplicatas**. A ação apenas marca as cópias para remoção; é necessário clicar em **Guardar** para confirmar no Firebase.
- Não apaga dados automaticamente e não altera as Security Rules nem a configuração de autenticação.

## Instalação
Substitua os arquivos do site pelos arquivos desta versão. Não é necessário refazer o Google Auth nem alterar as Security Rules.

## Limpeza das fotos duplicadas
Abra a gaveta afetada, clique em **Editar**. Se houver imagens com conteúdo idêntico, aparecerá o botão **Remover N duplicata(s)**. Confira a prévia, confirme a ação e clique em **Guardar**. A aplicação mantém a primeira ocorrência de cada imagem e marca as demais para remoção.
