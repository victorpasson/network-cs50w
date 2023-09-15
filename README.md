# CS50W - Project 4 - Network

Repositório que contém o código para a solução do quinto projeto do curso CS50W. A aplicação consiste em desenvolver uma aplicação web inspirada em um gerenciador de e-mail. O objetivo principal do projeto  é permitir que os usuários se registrem, façam login, vejam sua caixa principal, enviem, arquivem e vejam os emails enviados. A aplicação foi construída com o Django framework, JavaScript, HTML e CSS.

[![Page Mail Project](https://i.postimg.cc/JhZR09r5/Dja.png)](https://jvvpasson.pythonanywhere.com/)

## Página do Projeto

O projeto foi disponibilizado para interação por meio do [Python Any Where](https://jvvpasson.pythonanywhere.com/).

## Youtube Vídeo

Um breve vídeo de demonstração do resultado do projeto foi feito e hospedado no [YouTube](https://youtu.be/_MLy1wDu4cY).

## Especificações do Projeto

Usando Python, JavaScript, HTML e CSS, complete a implementação de uma rede social que permita aos usuários fazer posts, seguir usuários e salvar um post. Você deve cumprir os seguintes requisitos:

1. **Novo Post**: usuários que estejam logados devem estar habilitados a digitar um novo post baseado em textos escritos em uma text-área e então clicar em um botão para submeter o post.

2. **Todos os Posts**: a página de todos os posts na barra de navegação deve levar o usuário para uma página onde ele possa ver todos os posts de todos os usuários, com os posts mais recentes primeiro.
	* Cada post deve incluir: username de quem fez, o conteúdo, data, hora e a quantidade de likes que aquele post possui.

3. **Página de Perfil**: clicando no nome de usuário deve carregar a página de perfil desse usuário. Essa página deve:
	* Mostrar o número de seguidores que o usuário possui, como também o número de pessoas que ela segue;
	* Mostrar todos os posts do usuário, em ordem cronológica reversa;
	* Para qualquer usuário que esteja logado, essa página deve exibir um botão de “Follow” ou “Unfollow” que permite ao usuário alternar entre seguir ou não seguir os posts desse usuário. Perceba que isso só se aplica para qualquer outro usuário: um usuário não pode seguir ele mesmo.

4. **Follow**: O link de “following” na barra de navegação deve exibir todos os posts feitos por usuários que ele atualmente está seguindo.
	* Essa página deve se comportar como a página “All Posts”, mas com uma quantidade mais limitada de posts;
	* Essa página só deve estar disponível para usuários que estão logados.

5. **Paginação**: Qualquer página que exibe posts, só deve exibir 10 por paginação. Se existem mais do que 10, um botão de “Next” deve aparecer para que o usuário possa ir para a próxima página de posts (que deve ser mais antigos do que os posts da página corrente). Se não está na primeira página, um botão de “Previous” deve ser exibido pata levar o usuário para a página de posts anteriores.

6. **Edição de Post**: Usuários devem estar habilitados a clicar em um botão de “Edit” posts, ou link, em quaisquer posts que eles escreveram, para editá-los.
	* Quando o usuário clicar em “Edit”, o post deve ser trocado por uma text-área onde o usuário pode editar o conteúdo de seus posts;
	* O usuário deve ser habilitado a salvar a edição. Usando JavaScript, você está habilitado a atingir esse propósito sem requerer que toda a página seja carregada;
	* Por segurança, se certifique que a aplicação é desenhada de uma forma que não é possível para nenhum usuário, via qualquer rota, editar o post de outro usuário.

7. **“Like” e “Dislike”**: aos usuários deve ser possível clicar em um botão, ou link, em qualquer post, para alternar se gostou ou não de uma publicação.
	* Usando JavaScript, você deve assincronamente dizer ao servidor para atualizar a contagem de likes (via chamada para fetch) e então atualizar a contagem de likes do post exibida na página, sem requerer que toda a página seja carregada.
