# Changelog

Todas as mudanças relevantes do Vida de Boleiro ficam registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e as versões seguem o [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [0.2.0] - 2026-10-21

### Adicionado
- Estatísticas defensivas: goleiros contam defesas e jogos sem sofrer gol; zagueiros, laterais e volantes contam desarmes. Esses números entram na nota, no legado e na ficha final.
- Prêmios de Melhor zagueiro, Melhor lateral e Melhor volante.
- Lesões graves com textos diferentes (joelho, tornozelo, coxa, fratura, pubalgia e, só para goleiro, fratura na mão).
- Eventos novos por posição: pênalti decisivo para goleiro, gol de cabeça no último lance para zagueiro, marcação individual, apelido de "Muralha", saída de bola com os pés.
- Eventos novos de carreira: empresário, organizada na porta do CT, filho, mentor de um garoto da base, série documental, nota no videogame.
- Ação "Conversar com o técnico".
- README com prints, GIF e roadmap, e este CHANGELOG.
- Nove cenas novas no código (`tecnico`, `empresario`, `torcida`, `bebe`, `peneira`, `penalti`, `aposentadoria`, `academia`, `defesa`). Até a ilustração existir, cada uma mostra a cena mais parecida.

### Alterado
- O overall agora pesa os atributos de forma diferente em cada posição.
- O goleiro envelhece dois anos mais tarde e pode jogar até os 41.
- O local de nascimento passou a ser só o estado (UF); o campo de cidade saiu.
- A carta de aniversário só aparece aos 18, 21, 25, 30 e 35 anos (ou com 25% de chance nos outros).
- Momentos-chave aparecem no máximo 3 vezes por carreira e nunca dois iguais em seguida; eventos têm limite de repetições e intervalo de 2 anos.
- Lesões ficaram um pouco mais frequentes e mais pesadas para o físico; a carta de lesão aparece a partir de 3 meses fora.
- Luva de Ouro ficou mais difícil (15 jogos sem sofrer gol e top 2 da liga).
- "Flopado" só vale quando o jogador termina abaixo do próprio potencial.

## [0.1.0] - 2026-10-20

### Adicionado
- Primeira versão publicada no GitHub Pages.
- Código separado em módulos ES (`js/`) sem bundler, CSS em `css/app.css`.
- Pacote de 19 ilustrações geradas no Higgsfield em `assets/cenas/`.
- Botão "Continuar" só aparece quando existe jogo salvo.
