# Changelog

Todas as mudanças relevantes do Vida de Boleiro ficam registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e as versões seguem o [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [0.2.1] - 2026-10-26

### Adicionado
- Ilustrações das 9 cenas novas: `tecnico`, `empresario`, `torcida`, `bebe`, `peneira`, `penalti`, `aposentadoria`, `academia` e `defesa`. Nenhuma cena usa mais a reserva.

### Corrigido
- O profissional começava em janeiro mesmo com o jogador ainda com 16 anos. Agora começa no primeiro janeiro em que ele já tem 17.
- A tela do mês mostrava "Fevereiro De 2025"; agora só o mês fica com inicial maiúscula.
- Um momento-chave podia ser montado depois do fim da competição e travar o jogo com erro.
- O ano de estreia na carta final usava sempre o ano dos 17; agora usa o ano em que o profissional começou de fato.
- A lesão de joelho podia aparecer mais vezes que o limite quando os outros tipos de lesão já tinham saído. Agora, sem lesão nova disponível, a carta não aparece (o tempo fora continua valendo).

### Alterado
- A final do sub-17 no prólogo mostra o estádio em vez da cena de pênalti, que tem um goleiro adulto.
- Banimento menos frequente: o convite para manipular apostas aparece menos e, se aceito, dá 25% de chance de banimento (antes 40%).
- Prints e GIF do README refeitos com a versão atual. O print da temporada ainda mostrava "Fevereiro De 2025" e um jogador de 16 anos no profissional; a ficha final agora é de uma carreira completa, até a aposentadoria.
- Roadmap do README corrigido: campinho, CT, avião, mansão e carro já tinham ilustração desde a 0.1.0; faltam só as 9 cenas novas.

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
