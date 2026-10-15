/* ==========================================================================
   TESTE DA PERSONAL ORGANIZER — conteúdo do quiz (Paty Domingos)
   Fonte dos textos: entregas/03-quiz-completo-copy.md (v1.0, 09/10/2026).
   Lógica e pontuação: entregas/03-quiz-completo.md.

   Convenções
   - {variavel}: preenchida pelo app (ver ctx() em app.js).
   - p: pontos da alternativa no pilar da pergunta (0 a 3).
   - Nenhum número, depoimento ou valor sem fonte. Falas da Paty marcadas [OK da Paty] no copy.
   ========================================================================== */

/* Os 3 pilares, na ordem do quiz e do resultado */
const ORDEM_PILARES = ['tecnica', 'mentalidade', 'execucao'];
/* Desempates: o pilar de atenção segue a ordem do produto; o forte prefere Mentalidade */
const DESEMPATE_ATENCAO = ['tecnica', 'mentalidade', 'execucao'];
const DESEMPATE_FORTE = ['mentalidade', 'execucao', 'tecnica'];

const PILARES = {
  tecnica: {
    nome: 'TÉCNICA', aula: 2,
    frase: 'Técnica é o método. E método se aprende.',
    atencao: 'Hoje você organiza do seu jeito, e por isso a bagunça volta. Falta o processo: analisar, planejar, categorizar e setorizar.',
    depe: 'Você já tem base: separa por tipo e dá um lugar para cada coisa.',
    cuidado: 'Faça o laboratório do Módulo 3 antes de qualquer cliente: é na prática que a técnica aparece.'
  },
  mentalidade: {
    nome: 'MENTALIDADE', aula: 4,
    frase: 'Mentalidade é o que te sustenta.',
    atencao: 'Você sabe fazer, mas ainda não se vê cobrando por isso. A tendência é trabalhar de graça ou aceitar “um agrado”.',
    depe: 'Você já entende que o seu trabalho tem valor.',
    cuidado: 'Faça a conta do valor do seu dia antes do primeiro “quanto você cobra?”.'
  },
  execucao: {
    nome: 'EXECUÇÃO', aula: 3,
    frase: 'Execução é quando você vai para a ação.',
    atencao: 'Você espera se sentir pronta, e o tempo vai passando. A cliente não aparece porque ninguém viu o seu trabalho ainda.',
    depe: 'Você começa e vai até o fim.',
    cuidado: 'No dia 7 do laboratório, mostre o antes e o depois para 3 pessoas.'
  }
};

/* Os 4 perfis (cada um espelha uma fase real da história da Paty) */
const PERFIS = {
  profissional: {
    nome: 'Profissional da Casa', ic: 'vassoura',
    frase: 'Você já tem o mais difícil: a confiança das famílias e a porta aberta.',
    leitura: 'Você já trabalha dentro das casas e sabe cuidar delas. O que falta é a técnica de organizar como profissional e cobrar por isso como um serviço à parte. A organização é o seu passo a mais.',
    fase: '“Eu comecei como doméstica aos 12 anos.”'
  },
  nata: {
    nome: 'Organizadora Nata', ic: 'casa',
    frase: 'Você já faz o trabalho. Só ainda não cobra por ele.',
    leitura: 'Organizar já faz parte do seu dia, e as pessoas percebem. O que falta é transformar isso em serviço: aprender o processo, fazer o seu laboratório e colocar preço no seu dia.',
    fase: '“Eu comecei a organizar a minha casa, e isso surtiu um grande efeito.”'
  },
  recomeco: {
    nome: 'Mulher do Recomeço', ic: 'escada',
    frase: 'Você traz a bagagem de outra vida, e ela vale muito aqui.',
    leitura: 'Atender bem, cumprir prazo e lidar com gente fazem diferença dentro da casa de uma cliente. O que falta é a técnica e um primeiro laboratório para mostrar.',
    fase: '“Eu passei pela gerência de um banco.”'
  },
  baguncada: {
    nome: 'Bagunçada com Vontade', ic: 'coracao',
    frase: 'Você acha que não serve para isso. A minha mãe também achava que eu não servia.',
    leitura: 'Gostar de ver tudo arrumado já é o começo. Organização não é dom: é processo. E você vai entender bem a cliente que também se sente perdida, porque já esteve no lugar dela.',
    fase: '“Você é uma desorganizada.” (o que a minha mãe dizia)'
  }
};

/* Conta do valor do dia */
const METAS = [2000, 3000, 5000, 8000, 10000];
const FAIXA_DIARIA = { min: 300, max: 600 }; /* [PENDENTE: a Paty valida] */

/* Hoje × como organizer (S36), na ordem dos pilares */
const ANTES_DEPOIS = [
  { cod: 'tecnica', quando: 'você arruma um armário', a: 'Guarda o que está na frente, e a bagunça volta', d: 'Tira tudo, separa por categoria e dá um lugar para cada coisa' },
  { cod: 'mentalidade', quando: 'alguém pede a sua ajuda', a: 'Faz de graça, ou aceita “um agrado”', d: 'Cobra o valor do seu dia, sem pedir desculpa' },
  { cod: 'execucao', quando: 'você pensa em começar', a: 'Espera se sentir pronta', d: 'Faz o laboratório, mostra o antes e o depois e oferece' }
];

/* Plano de 7 dias do laboratório (H1b). [PENDENTE: a Paty revisa] */
const PLANO_7_DIAS = [
  'Comece {ambiente_pelo}: escolha um espaço pequeno, como uma gaveta ou uma prateleira, e tire a foto do antes.',
  'Tire tudo para fora e separe por tipo: o que é igual fica junto.',
  'Separe o que você não usa mais, para doar ou descartar.',
  'Decida o lugar de cada grupo, perto de quem usa.',
  'Dobre e guarde, sempre no mesmo padrão.',
  'Finalize os detalhes e tire a foto do depois, do mesmo ângulo da primeira.',
  'Mostre o antes e o depois para 3 pessoas e anote quem pediu ajuda.'
];

/* Depoimentos em vídeo (cortes em assets/video/). Preenchido depois da decupagem.
   Formato: { id, video: 'dep-nome.mp4', poster: 'dep-nome.jpg', nome, antes, frase (literal), dur, ins: ['I2'], trava: 2 }
   Regra: frase literal; sem promessa de ganho; aviso "Resultados individuais". */
const DEPOIMENTOS = [
  /* gancho: a frase que aparece na inserção e no alto da tela do vídeo · tela: a tela de vídeo onde ele aparece
     [PENDENTE: autorização de uso de imagem de todas as alunas; confirmar a grafia de Alcilene e Elizete] */
  { id: 'silvia', forca: 3, tela: 'V1', video: 'dep-silvia-cristina.mp4', poster: 'dep-silvia-cristina.jpg', nome: 'Silvia Cristina', antes: 'queria empreender',
    gancho: 'Veja como o dom de organizar mudou a vida da Silvia Cristina',
    frase: 'Eu não sabia que a gente podia ganhar dinheiro fazendo isso.', dur: '0:27', grupo: 'recomeco' },
  { id: 'alcilene', forca: 2, tela: 'V2', video: 'dep-alcilene.mp4', poster: 'dep-alcilene.jpg', nome: 'Alcilene', antes: 'mora nos Estados Unidos',
    gancho: 'Veja como o dom de organizar mudou a vida da Alcilene',
    frase: 'Eu achava que a minha casa era toda organizada, mas na verdade era arrumada.', dur: '0:37', grupo: 'dona' },
  { id: 'lidia', forca: 1, tela: 'V3', video: 'dep-lidia.mp4', poster: 'dep-lidia.jpg', nome: 'Lídia', antes: 'turma presencial',
    gancho: 'Veja o que a Lídia descobriu: organizar é muito além de dobras',
    frase: 'É muito além de dobras e organização.', dur: '0:26', grupo: 'recomeco' },
  { id: 'andreia-rs', forca: 4, tela: 'V4', video: 'dep-andreia-rs.mp4', poster: 'dep-andreia-rs.jpg', nome: 'Andréia', antes: 'Nova Petrópolis (RS)',
    gancho: 'Veja como o dom de organizar virou trabalho pago para a Andréia',
    frase: 'Já trabalho sendo remunerada nessa profissão de personal organizer.', dur: '0:19', grupo: 'dona' },
  { id: 'elizete', forca: 4, tela: 'V5', video: 'dep-elizete.mp4', poster: 'dep-elizete.jpg', nome: 'Elizete', antes: 'trabalhava em casa de família (BA)',
    gancho: 'Veja como o dom de organizar mudou a vida da Elizete',
    frase: 'Eu entrei nesse curso pra tentar dar um rumo na minha vida. E agora sim, tá indo.', dur: '0:33', grupo: 'casa' },
  { id: 'andreia-maia', forca: 5, tela: 'V6', video: 'dep-andreia-maia.mp4', poster: 'dep-andreia-maia.jpg', nome: 'Andréia Maia', antes: '57 anos, Minas Gerais',
    gancho: 'Veja como o dom de organizar mudou a vida da Andréia, aos 57 anos',
    frase: 'No mês de abril eu faturei quase 4 mil reais.', dur: '0:18', grupo: 'recomeco' },
  { id: 'francini', forca: 3, tela: 'VO3', video: 'dep-francini.mp4', poster: 'dep-francini.jpg', nome: 'Francini', antes: 'cidade do interior',
    gancho: 'Veja como a Francini conquistou clientes numa cidade do interior',
    frase: 'Aqui na minha cidade é interior (…), não tem nenhuma personal organizer.', dur: '0:34', grupo: 'casa' },
  { id: 'edna', forca: 2, tela: 'VO5', video: 'dep-edna-portugal.mp4', poster: 'dep-edna-portugal.jpg', nome: 'Edna', antes: 'mora em Portugal',
    gancho: 'Veja como a Edna aceitou o desafio, morando em Portugal',
    frase: 'Surgiu para mim um desafio de organizar um jardim e eu aceitei.', dur: '0:40', grupo: 'dona' },
  { id: 'rosane', forca: 3, video: 'dep-rosane.mp4', poster: 'dep-rosane.jpg', nome: 'Rosane', antes: 'Santos (SP)',
    frase: 'Agradeço imensamente essa possibilidade que está surgindo na minha vida.', dur: '0:23', grupo: 'dona' },
  { id: 'geisilane', forca: 0, video: 'dep-geisilane.mp4', poster: 'dep-geisilane.jpg', nome: 'Geisilane', antes: 'turma presencial em São Paulo',
    frase: 'Tenho somente gratidão no meu coração por esse ensinamento.', dur: '0:29', grupo: 'presencial' }
];

/* Depoimentos em texto (prints enviados à Paty), para a página do laboratório.
   Texto literal: só os espaços depois das vírgulas foram acertados. (…) = trecho cortado.
   [PENDENTE: autorização de cada aluna; "Luciana" é o nome provável da aluna da Click & Organiza] */
const DEPO_TEXTO = [
  { id: 'elizete', nome: 'Elizete', info: 'trabalhava em casa de família · Bahia', canal: 'WhatsApp', grupo: 'casa',
    txt: 'Ha três anos atrás eu trabalhava em casa de família, chegava em casa cansada, desmotivada (…) comecei fazer laboratórios, o primeiro foi na casa da minha mãe depois na casa da minha patroa, em seguida uma pessoa que é amiga da minha patroa me chamou pra fazer no closet dela aí já foi remunerado, eu já fiquei toda feliz porque foi meu primeiro dinheiro com a organização né.' },
  { id: 'lygia', nome: 'Lygia', info: 'laboratório em casa', canal: 'Instagram', grupo: 'dona',
    txt: 'Sou doida por organização 🤗 estou aprendendo mto com seu treinamento e o mais importante... Estou motivada. (…) Meu laboratório está sendo em mina casa.' },
  { id: 'jane', nome: 'Jane', info: '58 anos', canal: 'Instagram', grupo: 'recomeco',
    txt: 'comprei depois de 15 dias fiz uma pós mudança remunerada, foi desafiador mais maravilhoso. Fature 2.600 em 7 dias' },
  { id: 'claudia', nome: 'Claudia', info: 'fez o presencial em Barretos', canal: 'Instagram', grupo: 'recomeco',
    txt: 'De lá pra cá pensei várias vezes em desistir da profissão, mas te ouvindo e aprendendo segui adiante. (…) Conseguir fechar um projeto de dez mil reais e montei uma equipe para uma pós mudança.' },
  { id: 'luciana', nome: 'Luciana', info: 'mora em Portugal', canal: 'Instagram', grupo: 'fora',
    txt: 'Consegui depois de 1 mês de formada meu primeiro projecto !!! Não foi em Madrid mas em Portugal!!' }
];

/* Frases de incentivo: aparecem acima da 4ª, 8ª, 12ª… pergunta (contando só as perguntas que a pessoa vê) */
const MOTIVACAO = [
  { e: '🌟', cor: 'ouro',    txt: 'Ótimo começo! Cada resposta deixa o seu resultado mais certeiro.' },
  { e: '🚀', cor: 'verde',   txt: 'Continue assim. Daqui a pouco eu te mostro uma coisa.' },
  { e: '🧭', cor: 'azul',    txt: 'Você já passou de um terço do teste. O seu perfil está tomando forma.' },
  { e: '🔥', cor: 'laranja', txt: 'Você já passou da metade. Falta só um pilar.' },
  { e: '💪', cor: 'roxo',    txt: 'Você está indo muito bem. Já passou de dois terços do teste.' },
  { e: '🏁', cor: 'preto',   txt: 'Reta final: o seu resultado está quase pronto.' },
  { e: '🏆', cor: 'petroleo', txt: 'Última pergunta antes do seu plano!' }
];

/* Helpers de condição (A = respostas) */
const sel = (A, id) => (A[id] ? A[id].idx : []);
const is = (A, id, i) => sel(A, id).includes(i);
/* Ponto de partida (P1): 0 dona de casa · 1 diarista · 2 casa de família · 3 outra área · 4 sem trabalho */
const ehCasa = A => is(A, 'P1', 1) || is(A, 'P1', 2);
const ehDona = A => is(A, 'P1', 0);
const ehRecomeco = A => is(A, 'P1', 3) || is(A, 'P1', 4);
const foraBrasil = A => is(A, 'P2', 2);
const casada = A => is(A, 'P0', 0);

/* --------------------------------------------------------------------------
   TELAS (ordem exata do fluxo)
   t: capa | q (única) | m (múltipla) | e (escala) | ins | antesdepois | prova | diag | captura | resultado
   -------------------------------------------------------------------------- */
const TELAS = [

  /* ---------- B. Abertura e genéricas ---------- */
  { id: 'G1', t: 'capa',
    selo: 'Personal organizer há 12 anos',
    tit: 'Você já organiza sua casa de graça, e tem mulher cobrando de R$&nbsp;300 a R$&nbsp;600 por dia para fazer isso.',
    sub: 'Faça o teste e descubra se essa pode ser a sua nova profissão, e quanto o seu dia de trabalho pode valer.',
    tempo: 'Leva uns 3 minutos.',
    q: 'Para começar, qual é a sua idade?',
    o: [ { txt: '18 a 29 anos', e: '🌱', img: 'idade-1.jpg' },
         { txt: '30 a 39 anos', e: '🌷', img: 'idade-2.jpg' },
         { txt: '40 a 49 anos', e: '🌻', img: 'idade-3.jpg' },
         { txt: '50 anos ou mais', e: '👑', img: 'idade-4.jpg' } ] },

  /* Duas genéricas depois da idade (v1.3): estado civil e filhos. Só personalizam o texto; não vão para o CRM nem para o lead score. */
  { id: 'P0', t: 'q', q: 'Você é casada?',
    o: [ { txt: 'Sim, sou casada (ou moro junto)', e: '💍' }, { txt: 'Não, sou solteira', e: '🌸' }, { txt: 'Sou divorciada ou viúva', e: '🕊️' } ] },

  { id: 'P4', t: 'q', q: 'Você tem filhos?',
    o: [ { txt: 'Não', e: '🙋‍♀️' }, { txt: 'Sim, pequenos (até 10 anos)', e: '🧒' }, { txt: 'Sim, maiores de 10 anos', e: '👧' } ] },

  { id: 'P1', t: 'q', rotulo: 'Hoje', q: 'Hoje, qual frase mais parece com a sua vida?',
    o: [ { txt: 'Cuido da minha casa e da minha família', e: '🏠' },
         { txt: 'Trabalho como diarista, fazendo faxina', e: '🧽' },
         { txt: 'Trabalho em casa de família (doméstica, babá ou cuidadora)', e: '🧺' },
         { txt: 'Trabalho em outra área', e: '💼' },
         { txt: 'Estou sem trabalho, buscando uma renda', e: '🔎' } ] },

  { id: 'P2', t: 'q', q: 'Onde você mora?',
    o: [ { txt: 'Numa capital ou região metropolitana', e: '🏙️' },
         { txt: 'Numa cidade do interior', e: '🏡' },
         { txt: 'Fora do Brasil', e: '✈️' } ] },

  /* P3: uma pergunta diferente para cada ponto de partida (a pessoa vê só a dela) */
  { id: 'P3D', t: 'q', show: A => ehCasa(A) && !foraBrasil(A),
    q: 'Hoje, quanto você recebe por um dia de trabalho?',
    o: [ { txt: 'Até R$ 150', e: '💵' }, { txt: 'De R$ 150 a R$ 200', e: '💵' },
         { txt: 'De R$ 200 a R$ 250', e: '💵' }, { txt: 'Mais de R$ 250', e: '💰' },
         { txt: 'Sou mensalista, recebo por mês', e: '🗓️' } ] },
  { id: 'P3X', t: 'q', show: A => ehCasa(A) && foraBrasil(A),
    q: 'Você sente que o seu dia de trabalho vale mais do que te pagam?',
    o: [ { txt: 'Sim, muito mais', e: '💯' }, { txt: 'Um pouco mais', e: '🤏' }, { txt: 'Acho que me pagam o justo', e: '⚖️' } ] },
  { id: 'P3C', t: 'q', show: A => ehDona(A),
    q: 'Hoje você tem um dinheiro que é só seu?',
    o: [ { txt: A => casada(A) ? 'Não, dependo do meu marido' : 'Não, dependo da minha família', e: '🙁' }, { txt: 'Faço uns bicos de vez em quando', e: '🧶' },
         { txt: 'Tenho, mas é pouco', e: '🪙' }, { txt: 'Tenho, e quero ganhar mais', e: '📈' } ] },
  { id: 'P3O', t: 'q', show: A => is(A, 'P1', 3),
    q: 'O que mais te cansa no seu trabalho hoje?',
    o: [ { txt: 'O salário não acompanha as contas', e: '🧾' }, { txt: 'Patrão e horário apertado', e: '⏰' },
         { txt: 'Não me sinto valorizada', e: '😔' }, { txt: 'Quase não vejo a minha família', e: '👨‍👩‍👧' } ] },
  { id: 'P3S', t: 'q', show: A => is(A, 'P1', 4),
    q: 'Há quanto tempo você está buscando uma renda?',
    o: [ { txt: 'Menos de 3 meses', e: '🌱' }, { txt: 'De 3 meses a 1 ano', e: '⏳' }, { txt: 'Mais de 1 ano', e: '🏔️' } ] },

  { id: 'P5', t: 'q', rotulo: 'Numa casa bagunçada', q: 'Quando você entra numa casa bagunçada, o que dá vontade de fazer?',
    o: [ { txt: 'Arregaçar as mangas e arrumar tudo', e: '💪' }, { txt: 'Arrumo, mas só a minha casa', e: '🏡' },
         { txt: 'Dá preguiça, mas eu amo ver tudo arrumado', e: '😌' }, { txt: 'Sair correndo', e: '🏃‍♀️' } ] },

  { id: 'P6', t: 'q', rotulo: 'Se pedem a sua ajuda', q: 'Alguém já pediu a sua ajuda para organizar alguma coisa?',
    sub: 'Um armário, uma mudança, a casa de uma parente…',
    o: [ { txt: 'Sim, vivem me pedindo', e: '🙌' }, { txt: 'Já ajudei alguém próximo, de favor', e: '🤝' },
         { txt: 'Nunca pediram, mas eu adoraria', e: '✨' }, { txt: 'Nunca, e eu mal dou conta da minha casa', e: '😅' } ] },

  { id: 'P7', t: 'q', q: 'Você sabia que existe uma profissão que ganha por dia para organizar casas?',
    o: [ { txt: 'Sim, e já pensei em seguir', e: '💡' }, { txt: 'Já ouvi falar, mas não sei como funciona', e: '🤔' },
         { txt: 'Não fazia ideia', e: '😮' }, { txt: 'Achei que era só para casa de famoso', e: '⭐' } ] },

  { id: 'I1', t: 'ins', icone: 'casa', fundo: 'paty-retrato.jpg', foco: '50% 22%', retrato: true,
    tit: A => is(A, 'P7', 0) ? 'Então você já sentiu: isso pode ser mais do que cuidar da casa.'
            : is(A, 'P7', 1) ? 'Deixa eu te mostrar como funciona.'
            : is(A, 'P7', 3) ? 'Casa de famoso também. Mas não só.'
            : 'Pois existe. E ela se chama Personal Organizer.',
    legendaFoto: 'Paty Domingos · personal organizer há 12 anos',
    pontos: [
      { i: 'casa', t: 'Ela organiza casas: guarda-roupa, cozinha, quartinho de bebê, mudança.' },
      { i: 'calendario', t: 'Não é faxina: é técnica e método. E ela cobra <b>por dia</b>.' },
      { i: 'coracao', t: 'Você já organiza de graça. E essa profissão <b>não exige que você tenha nascido organizada.</b>' }
    ],
    extras: [ { when: A => is(A, 'P6', 0), html: 'Você disse que vivem te pedindo ajuda. Quem pede ajuda já está te dizendo: você faz bem algo que ela não consegue fazer.' },
              { when: A => is(A, 'P6', 1), html: 'Você já ajudou alguém de favor. Esse foi o seu primeiro trabalho de organizer, só que sem cobrar.' },
              { when: A => is(A, 'P6', 2), html: 'Você adoraria ajudar alguém a organizar. Essa vontade já é um começo.' },
              { when: A => is(A, 'P6', 3), html: 'Você disse que mal dá conta da sua casa. Calma: eu também era assim.' } ],
    depo: 'silvia',
    btn: 'Assistir ao depoimento' },

  { id: 'V1', t: 'video', depo: 'silvia', btn: 'Quero descobrir o meu perfil' },

  /* ---------- C. Os 3 pilares ---------- */
  /* TÉCNICA */
  { id: 'P8', t: 'q', q: 'Que parte da casa você mais gosta de deixar em ordem?',
    o: [ { txt: 'Guarda-roupa e closet', e: '👗' }, { txt: 'Cozinha e despensa', e: '🍽️' },
         { txt: 'Gavetas e roupas dobradas', e: '🧦' }, { txt: 'Quarto das crianças', e: '🧸' },
         { txt: 'Papéis e documentos', e: '📁' } ] },

  { id: 'P9', t: 'q', cod: 'tecnica', rotulo: 'Ao arrumar um armário',
    q: 'Quando você vai arrumar um armário, como você faz?',
    o: [ { txt: 'Vou guardando o que está na frente', e: '🙈', p: 0 },
         { txt: 'Dobro tudo e encaixo onde couber', e: '👕', p: 1 },
         { txt: 'Tiro tudo, separo por tipo e só depois guardo', e: '🗂️', p: 3 },
         { txt: 'Fico perdida, sem saber por onde começar', e: '🌀', p: 0 } ] },

  { id: 'P10', t: 'q', cod: 'tecnica', rotulo: 'Uns dias depois de arrumar',
    q: 'E, uns dias depois, como fica o que você arrumou?',
    o: [ { txt: 'Bagunçado de novo', e: '😩', p: 0 }, { txt: 'Dura umas semanas', e: '🙂', p: 1 },
         { txt: 'Só eu sei onde está cada coisa', e: '🤫', p: 1 },
         { txt: 'Continua arrumado: cada coisa tem o seu lugar', e: '✨', p: 3 } ] },

  { id: 'P11', t: 'q', cod: 'tecnica', rotulo: 'Sobre técnica de organização',
    q: 'Você já aprendeu alguma técnica de organização?',
    o: [ { txt: 'Nunca, faço do meu jeito', e: '🤷‍♀️', p: 0 }, { txt: 'Vejo vídeos de dobra na internet', e: '📱', p: 1 },
         { txt: 'Já fiz um curso', e: '🎓', p: 2 },
         { txt: 'Sei dobrar, separar por categoria e usar organizadores', e: '🧺', p: 3 } ] },

  { id: 'I2', t: 'ins', icone: 'caixa', fundo: 'paty-tecnica.jpg', foco: '42% 28%', selo: '1º PILAR · TÉCNICA',
    tit: 'Organizar a sua casa é uma habilidade. Organizar a casa de uma cliente é uma competência.',
    pontos: [
      { i: 'lista', t: 'A organizer segue um processo: <b>analisar, planejar, categorizar e setorizar</b>.' },
      { i: 'camisa', t: '“Saber dobrar é uma parte muito pequena do nosso trabalho.” <b>Aplicar a dobra dentro da gaveta, quase ninguém ensina.</b>' },
      { i: 'casa', t: 'Eu comecei na minha casa: organizei, errei, refiz. Eu chamo isso de <b>laboratório</b>.' }
    ],
    extras: [ { when: A => is(A, 'P9', 0), html: 'Você guarda o que está na frente. É por isso que a bagunça volta: falta separar por tipo antes de guardar.' },
              { when: A => is(A, 'P9', 3), html: 'Você fica perdida sem saber por onde começar. É para isso que existe um processo: ele te diz o primeiro passo.' },
              { when: A => is(A, 'P9', 1), html: 'Você dobra e encaixa onde couber. A dobra você já tem. Falta o lugar certo para cada coisa.' },
              { when: A => is(A, 'P9', 2), html: 'Você tira tudo e separa por tipo. Isso tem nome: categorizar. É o primeiro passo de uma profissional.' } ],
    depo: 'alcilene',
    pilar: 'Técnica é o método. E método se aprende.',
    btn: 'Assistir ao depoimento' },

  { id: 'V2', t: 'video', depo: 'alcilene', btn: 'Próximo pilar' },

  /* MENTALIDADE */
  { id: 'P12', t: 'q', cod: 'mentalidade', rotulo: 'Se uma vizinha pedisse ajuda',
    q: 'Se uma vizinha te pedisse para organizar o guarda-roupa dela, o que você faria?',
    o: [ { txt: 'Faria de graça. Imagina cobrar!', e: '🙅‍♀️', p: 0 },
         { txt: 'Aceitaria o que ela quisesse me dar', e: '🎁', p: 1 },
         { txt: 'Cobraria, mas morrendo de vergonha', e: '😳', p: 2 },
         { txt: 'Cobraria o meu dia de trabalho, tranquila', e: '😎', p: 3 } ] },

  { id: 'P13', t: 'e', cod: 'mentalidade',
    q: 'O quanto você concorda com esta frase?',
    frase: 'Organizar casa não é trabalho. Ninguém paga por isso.',
    o: [ { txt: 'Concordo totalmente', e: '✅', p: 0 }, { txt: 'Concordo em parte', e: '🤏', p: 1 },
         { txt: 'Não tenho certeza', e: '🤔', p: 2 }, { txt: 'Discordo', e: '❌', p: 3 } ] },

  { id: 'P14', t: 'm', cod: 'mentalidade', score: 'contagem', rotulo: 'Frases que você já ouviu',
    q: 'Quais dessas frases você já ouviu, ou já disse para si mesma?',
    o: [ { txt: '“Que bobeira é essa? Quem paga para fazer isso?”', e: '🙄' },
         { txt: '“Você? Mas você nem é organizada!”', e: '😏' },
         { txt: '“Isso é coisa de rico.”', e: '💎' },
         { txt: '“Diarista nunca vai ganhar mais do que isso.”', e: '🚫' },
         { txt: '“Você já passou da idade para começar algo novo.”', e: '⌛' },
         { txt: '“Primeiro dá conta da sua casa.”', e: '🏠' },
         { txt: 'Nenhuma dessas', e: '✨', excl: true } ] },

  { id: 'I3', t: 'ins', icone: 'coracao', fundo: 'paty-mentalidade.jpg', foco: '50% 30%', selo: '2º PILAR · MENTALIDADE',
    tit: 'Eu também já achei que não servia para isso.',
    pontos: [
      { i: 'vassoura', t: 'Eu comecei como <b>doméstica, aos 12 anos</b>. Depois fui diarista e passei pela gerência de um banco.' },
      { i: 'olho', t: 'Em casa, a minha mãe dizia: “<b>Você é uma desorganizada.</b> Olha o tanto que a sua irmã é mais organizada que você.”' },
      { i: 'dinheiro', t: 'Quando comecei, trabalhei de graça muitas vezes. Hoje eu digo para as minhas alunas: <b>trabalhar de graça não dá. A sua hora é importante.</b>' }
    ],
    extras: [ { when: A => is(A, 'P14', 1), html: 'Você já ouviu “você nem é organizada”. Eu ouvi isso da minha própria mãe.' },
              { when: A => is(A, 'P12', 0), html: 'Você faria de graça. Eu também fazia. Mas organizar a casa de alguém é trabalho, e trabalho se cobra.' },
              { when: A => is(A, 'P12', 1), html: 'Você aceitaria o que ela quisesse dar. Quem decide o valor do seu dia é você.' },
              { when: A => is(A, 'P12', 2), html: 'Você cobraria, mas com vergonha. A vergonha diminui quando você sabe a conta do seu dia. Eu te mostro no final.' },
              { when: A => is(A, 'P12', 3), html: 'Você cobraria o seu dia sem vergonha. Essa é a mentalidade de uma profissional.' } ],
    depo: 'lidia',
    pilar: 'Mentalidade é o que te sustenta.',
    btn: 'Assistir ao depoimento' },

  { id: 'V3', t: 'video', depo: 'lidia', btn: 'Próximo pilar' },

  /* EXECUÇÃO */
  { id: 'P15', t: 'q', cod: 'execucao', rotulo: 'Se já mostrou o seu trabalho',
    q: 'Você já mostrou para alguém algo que você organizou?',
    sub: 'Uma foto de antes e depois, por exemplo.',
    o: [ { txt: 'Nunca mostrei', e: '🙊', p: 0 }, { txt: 'Só para a minha família', e: '🏠', p: 1 },
         { txt: 'Já mandei fotos ou postei', e: '📸', p: 2 },
         { txt: 'Já me chamaram para organizar por causa disso', e: '📞', p: 3 } ] },

  { id: 'P16', t: 'q', cod: 'execucao', rotulo: 'Ao começar algo novo',
    q: 'Quando você decide começar algo novo, o que costuma acontecer?',
    o: [ { txt: 'Espero me sentir pronta, e o tempo vai passando', e: '⏳', p: 0 },
         { txt: 'Começo animada e paro no meio', e: '🎢', p: 1 },
         { txt: 'Começo devagar, mas vou até o fim', e: '🐢', p: 2 },
         { txt: 'Começo no mesmo dia e vou ajustando no caminho', e: '🚀', p: 3 } ] },

  { id: 'P17', t: 'q', cod: 'execucao', rotulo: 'A sua primeira cliente',
    q: 'Se você começasse hoje, quem poderia ser a sua primeira cliente?',
    o: [ { txt: 'Já tenho alguém em mente: uma patroa, uma vizinha, uma amiga', e: '🙋‍♀️', p: 3 },
         { txt: 'Conheço quem precise, mas teria vergonha de oferecer', e: '🫣', p: 1 },
         { txt: 'Não faço ideia de onde tirar cliente', e: '🤷‍♀️', p: 0 },
         { txt: 'Acho que na minha cidade ninguém pagaria', e: '📍', p: 0 } ] },

  { id: 'I4', t: 'ins', icone: 'porta', fundo: 'paty-execucao.jpg', foco: '50% 9%', selo: '3º PILAR · EXECUÇÃO',
    tit: 'Cliente não aparece porque você é boa. Aparece porque você se mostra.',
    pontos: [
      { i: 'mensagem', t: 'No começo, eu já fiquei <b>muda numa visita</b>. Tremia, gaguejei. Até hoje sinto frio na barriga.' },
      { i: 'maos', t: 'Até hoje, as minhas clientes vêm do Instagram e, <b>principalmente, de indicação</b>. Graças a Deus e ao meu método, tenho clientes que me acompanham há anos.' },
      { i: 'pin', t: 'Comece perto: o grupo do condomínio, a vizinhança, uma casa que você já conhece.' }
    ],
    extras: [ { when: A => is(A, 'P17', 3), html: 'Você acha que na sua cidade ninguém pagaria. Na minha, no interior de São Paulo, uma imobiliária me disse: “Não estamos tendo profissionais. Tá difícil a mão de obra.”' },
              { when: A => is(A, 'P17', 0), html: 'Você já tem alguém em mente para ser a sua primeira cliente. Guarde esse nome: ele vai aparecer no seu plano.' },
              { when: A => is(A, 'P17', 1), html: 'Você conhece quem precise, mas teria vergonha de oferecer. Eu te mostro o que falar.' },
              { when: A => is(A, 'P17', 2), html: 'Você não sabe de onde tirar cliente. Comece perto: até hoje, a maior parte das minhas clientes chega por indicação.' } ],
    depo: 'andreia-rs',
    pilar: 'Execução é quando você vai para a ação.',
    btn: 'Assistir ao depoimento' },

  { id: 'V4', t: 'video', depo: 'andreia-rs', btn: 'Continuar' },

  /* Dor: o que pesa hoje */
  { id: 'P18', t: 'q', q: 'Qual frase mais pesa no seu peito hoje?',
    o: [ { txt: 'Trabalho muito e ganho pouco', e: '😮‍💨' }, { txt: 'Queria ter o meu próprio dinheiro', e: '👛' },
         { txt: 'Quase não tenho tempo para a minha família', e: '⏰' }, { txt: 'Sinto que nasci para algo mais', e: '🌟' } ] },

  { id: 'P19', t: 'q', q: 'Se nada mudar, como você imagina a sua vida daqui a 1 ano?',
    o: [ { txt: 'Igual, e isso me preocupa', e: '😟' }, { txt: 'Mais apertada: as contas só aumentam', e: '📉' },
         { txt: 'Prefiro nem pensar', e: '🙈' }, { txt: 'Vou dar um jeito, só não sei qual', e: '🤞' } ] },

  { id: 'I5', t: 'ins', icone: 'escada', fundo: 'paty-passo.jpg', foco: '50% 25%',
    tit: A => ehCasa(A) ? 'Você não precisa largar o que faz. Precisa dar um passo a mais.'
            : ehRecomeco(A) ? 'Recomeçar não é voltar para trás.'
            : 'Tudo o que você faz em casa já é treino.',
    pontos: [
      A => ehCasa(A) ? { i: 'chave', t: 'Você já entra nas casas e já tem a confiança das famílias. <b>Isso é o mais difícil de conquistar.</b>' }
         : ehRecomeco(A) ? { i: 'banco', t: 'Antes de virar organizer, eu passei pela gerência de um banco.' }
         : { i: 'camisa', t: 'Guardar a roupa da família, arrumar a despensa quando chega a compra do mercado: “tudo são oportunidades de prática”.' },
      A => ehCasa(A) ? { i: 'caixa', t: 'Organizar é outro serviço: planejar, organizar e deixar a casa funcionando. <b>E ele é cobrado à parte.</b>' }
         : ehRecomeco(A) ? { i: 'maos', t: 'Atender bem, cumprir prazo e lidar com gente: tudo isso conta muito dentro da casa de uma cliente.' }
         : { i: 'camera', t: 'Tire foto do antes e do depois. <b>Isso vira o seu portfólio.</b>' },
      A => ehCasa(A) ? { i: 'coracao', t: 'Eu sei disso porque também comecei trabalhando dentro da casa dos outros.' }
         : { i: 'calendario', t: 'E, como organizer, <b>você escolhe os dias em que trabalha.</b>' }
    ],
    nota: { when: A => is(A, 'G1', 2) || is(A, 'G1', 3) || is(A, 'P14', 4),
            html: 'Idade não tira ninguém dessa profissão. Aqui, a cliente compra confiança, discrição e cuidado. A maturidade conta a seu favor.' },
    extras: [ { when: A => is(A, 'P19', 0), html: 'Você não quer estar igual daqui a 1 ano. Então o passo precisa ser dado agora.' },
              { when: A => is(A, 'P19', 1), html: 'Você sente que as contas só aumentam. Um dia de trabalho que vale mais muda essa conta.' },
              { when: A => is(A, 'P19', 2), html: 'Você prefere nem pensar no ano que vem. Então vamos pensar só no próximo passo, que é menor e mais fácil.' },
              { when: A => is(A, 'P19', 3), html: 'Você vai dar um jeito, só não sabe qual. Talvez ele já esteja nas suas mãos.' } ],
    depo: 'elizete',
    btn: 'Assistir ao depoimento' },

  { id: 'V5', t: 'video', depo: 'elizete', btn: 'Continuar' },

  /* ---------- D. Desejo ---------- */
  { id: 'P20', t: 'q', q: 'Se a organização virasse a sua profissão, o que você faria primeiro com esse dinheiro?',
    o: [ { txt: 'Pagaria as contas sem aperto', e: '🧾' }, { txt: 'Ajudaria os meus filhos e a minha família', e: '👨‍👩‍👧' },
         { txt: 'Guardaria uma reserva só minha', e: '🐷' }, { txt: 'Realizaria um sonho: uma viagem, um carro, a casa', e: '✈️' } ] },

  { id: 'P21', t: 'q', q: 'Quanto você gostaria de ganhar por mês com o seu trabalho?',
    sub: A => foraBrasil(A) ? 'Pense na moeda do país onde você mora.' : '',
    o: [ { txt: '{moeda}2.000', e: '💵' }, { txt: '{moeda}3.000', e: '💵' }, { txt: '{moeda}5.000', e: '💰' },
         { txt: '{moeda}8.000', e: '💰' }, { txt: '{moeda}10.000 ou mais', e: '🏆' } ] },

  { id: 'P22', t: 'q', q: 'Quantos dias por semana você conseguiria trabalhar organizando casas?',
    o: [ { txt: '1 dia', e: '1️⃣' }, { txt: '2 dias', e: '2️⃣' }, { txt: '3 dias', e: '3️⃣' }, { txt: '4 dias', e: '4️⃣' }, { txt: '5 dias', e: '5️⃣' } ] },

  { id: 'P23', t: 'q', q: 'Daqui a 1 ano, como você se imagina?',
    o: [ { txt: 'Com a agenda cheia na minha cidade', e: '📅' }, { txt: 'Trabalhando só alguns dias e com tempo para a família', e: '🏡' },
         { txt: 'Atendendo casas de alto padrão', e: '✨' }, { txt: 'Com a minha própria equipe', e: '👩‍👩‍👧' } ] },

  /* [OK da Paty: fala da filha]. Sem autorização, trocar o título por "Tem casas precisando de você." e tirar os 2 pontos. */
  { id: 'I6', t: 'ins', icone: 'coracao', fundo: 'paty-fatura.jpg', foco: '50% 16%',
    tit: '“Nossa, mãe, você fatura bem.”',
    pontos: [
      { i: 'pessoa', t: 'Foi o que a minha filha, formada em Odontologia, me disse um dia.' },
      { i: 'coracao', t: 'Eu, que comecei como doméstica aos 12 anos, ouvi isso da minha filha doutora.' }
    ],
    extras: [ { when: A => is(A, 'P20', 0), html: 'Você quer pagar as contas sem aperto. Isso começa de um jeito simples: uma diária de cada vez.' },
              { when: A => is(A, 'P20', 1), html: 'Você quer ajudar a sua família. E a sua família vai ver de perto você construindo uma profissão.' },
              { when: A => is(A, 'P20', 2), html: 'Você quer uma reserva só sua. Dinheiro seu, que vem do seu trabalho.' },
              { when: A => is(A, 'P20', 3), html: 'Você quer realizar um sonho. Eu acredito em plantar para colher.' } ],
    depo: 'andreia-maia',
    fecho: 'Agora eu vou cruzar as suas respostas com os 3 pilares e fazer a conta do seu dia.',
    btn: 'Assistir ao depoimento' },

  { id: 'V6', t: 'video', depo: 'andreia-maia', btn: 'Ver o meu resultado' },

  /* ---------- E. Diagnóstico, solução e captura ---------- */
  { id: 'DIAG', t: 'diag' },

  { id: 'P24', t: 'q', q: 'O que mais te trava para começar?',
    sub: 'Escolha a que mais pesa.',
    o: [ { txt: 'Não sei a técnica certa', e: '📐' },
         { txt: 'Não sei quanto cobrar, ou tenho vergonha', e: '💰' },
         { txt: 'Não sei onde achar a primeira cliente', e: '🏘️' },
         { txt: 'Medo de errar na casa de alguém', e: '😰' },
         { txt: 'Acreditar que é para mim', e: '💛' } ] },

  /* Resposta imediata à trava da P24: uma tela para cada resposta (a pessoa vê só a dela) */
  { id: 'O1', t: 'ins', show: A => is(A, 'P24', 0), icone: 'lista', fundo: 'paty-tecnica.jpg', foco: '42% 28%',
    selo: 'Você respondeu: a técnica certa',
    tit: 'Técnica é o método. E é exatamente isso que eu vou te entregar.',
    pontos: [
      { i: 'lista', t: 'O processo que eu uso na casa das minhas clientes: <b>analisar, planejar, categorizar e setorizar</b>.' },
      { i: 'casa', t: 'E o laboratório: você pratica na sua casa, com data para terminar, e fotografa o antes e o depois.' }
    ],
    btn: 'Continuar' },
  { id: 'O2', t: 'ins', show: A => is(A, 'P24', 1), icone: 'calculadora', fundo: 'paty-tablet.jpg', foco: '60% 30%',
    selo: 'Você respondeu: quanto cobrar',
    tit: 'Eu também trabalhei de graça. Por isso eu te ensino a conta.',
    pontos: [
      { i: 'dinheiro', t: '<b>Trabalhar de graça não dá.</b> A sua hora é importante.' },
      { i: 'calculadora', t: 'A conta do valor do seu dia: as despesas do mês divididas pelos dias de trabalho. “Por menos daquele valor, você está pagando para trabalhar.”' },
      { i: 'check', t: 'E a sua conta já está pronta: ela aparece no <b>seu resultado</b>, no fim deste teste.' }
    ],
    btn: 'Continuar' },
  { id: 'O3', t: 'ins', show: A => is(A, 'P24', 2), icone: 'porta', fundo: 'paty-execucao.jpg', foco: '50% 9%', depo: 'francini',
    selo: 'Você respondeu: a primeira cliente',
    tit: 'Cliente não é consequência automática de competência.',
    pontos: [
      { i: 'maos', t: 'As minhas clientes vêm do Instagram e, principalmente, de indicação. Algumas me acompanham há anos.' },
      { i: 'pin', t: 'Comece perto: o condomínio, a vizinhança, as lojas da sua cidade.' },
      { i: 'mensagem', t: 'No curso, eu te mostro como oferecer os seus serviços e conquistar as primeiras diárias.' }
    ],
    btn: 'Assistir ao depoimento' },
  { id: 'VO3', t: 'video', show: A => is(A, 'P24', 2), depo: 'francini', btn: 'Continuar' },
  { id: 'O4', t: 'ins', show: A => is(A, 'P24', 3), icone: 'mensagem', fundo: 'paty-mentalidade.jpg', foco: '50% 30%',
    selo: 'Você respondeu: medo de errar',
    tit: 'Ninguém começa pronta. Nem eu comecei.',
    pontos: [
      { i: 'mensagem', t: 'Já fiquei muda numa visita, tremendo. Até hoje sinto frio na barriga antes de um projeto.' },
      { i: 'lista', t: 'Por isso o curso tem o <b>laboratório</b>: você treina na sua casa antes de entrar na casa de uma cliente.' },
      { i: 'coracao', t: '“Você não precisa chegar pronta. Você só precisa chegar disposta.”' }
    ],
    btn: 'Continuar' },
  { id: 'O5', t: 'ins', show: A => is(A, 'P24', 4), icone: 'estrela', fundo: 'paty-retrato.jpg', foco: '50% 22%', retrato: true, depo: 'edna',
    selo: 'Você respondeu: acreditar que é para você',
    tit: 'Se eu consegui, você também consegue.',
    pontos: [
      { i: 'vassoura', t: 'Comecei como doméstica aos 12 anos e ouvia que eu era a desorganizada da família.' },
      { i: 'casa', t: 'Hoje são 12 anos de profissão, casas de alto padrão e um livro escrito com organizers de todo o Brasil.' },
      { i: 'bandeira', t: '<b>Tá com medo? Vai com medo mesmo.</b>' }
    ],
    btn: 'Assistir ao depoimento' },
  { id: 'VO5', t: 'video', show: A => is(A, 'P24', 4), depo: 'edna', btn: 'Continuar' },

  { id: 'P25', t: 'q', q: 'Quanto tempo por dia você consegue separar para aprender?',
    o: [ { txt: '15 minutos', e: '⏱️' }, { txt: '30 minutos', e: '🕐' }, { txt: '1 hora', e: '🕑' }, { txt: 'Mais de 1 hora', e: '🕓' } ] },

  { id: 'P26', t: 'q', q: 'Quanto você quer mudar isso agora?',
    o: [ { txt: 'Decidi: quero começar esta semana', e: '🔥' }, { txt: 'Quero muito', e: '💪' },
         { txt: 'Quero, mas tenho medo de não dar conta', e: '😟' }, { txt: 'Por enquanto, é só curiosidade', e: '👀' } ] },

  { id: 'I7', t: 'antesdepois',
    tit: 'O que muda quando você vira organizer',
    sub: 'Não é trabalhar mais. É saber o que fazer em 3 momentos.',
    caixa: 'Nenhum desses momentos depende de dom. Todos mudam quando você aprende o que fazer.',
    btn: 'Continuar' },

  { id: 'I8', t: 'prova',
    show: () => DEPOIMENTOS.length > 0 || (window.CONFIG && CONFIG.MOSTRAR_ESPACOS_RESERVADOS),
    tit: 'Não é teoria. É o que as minhas alunas vivem.',
    sub: 'Toque no vídeo para ouvir.',
    btn: 'Montar o meu plano' },

  { id: 'CAPTURA', t: 'captura',
    tit: 'Vamos montar o seu plano de laboratório',
    sub: 'Preencha os seus dados para ver o mapa dos seus 3 pilares, a conta completa do seu dia e o seu plano de 7 dias.',
    passos: [ [0, 'Organizando as suas respostas'],
              [14, 'Lendo TÉCNICA, MENTALIDADE e EXECUÇÃO'],
              [36, 'Fazendo a conta do seu dia'],
              [66, 'Montando o seu laboratório: {ambiente_curto}'],
              [100, '✓ Plano pronto'] ],
    btn: 'Ver o meu plano' },

  { id: 'RESULTADO', t: 'resultado' }
];

/* --------------------------------------------------------------------------
   PÁGINA DE VENDAS
   -------------------------------------------------------------------------- */
/* Produto principal: "Primeiros Passos da Personal Organizer", 14 aulas em 4 módulos recortadas do Método Organizadas
   (ficha do low ticket de 14/10/2026). Os títulos das aulas são os da ficha; os dois "Tira-dúvidas" ganharam nome legível
   e a aula 14 aparece sem os valores ("R$ 3 a 5 mil"), para não soar como promessa de renda.
   [PENDENTE: a Paty e o Hélio revisam as descrições curtas de cada módulo] */
const PRODUTO = {
  nome: 'Primeiros Passos da Personal Organizer',
  lead: '<b>14 aulas em 4 módulos</b>, escolhidas do Método Organizadas: o que faz uma personal organizer, os fundamentos da técnica, o laboratório e quanto cobrar pela sua primeira diária.'
};
const AULAS = [
  { n: 1, cor: '#a8842f', ic: 'estrela', tit: 'A profissão',
    txt: 'Se ser personal organizer faz sentido para você, o que essa profissão faz, onde ela atua e como ela é de verdade, sem romantizar.',
    aulas: ['Ser P.O. faz sentido para você?', 'O que faz uma Personal Organizer e suas áreas de atuação', 'Romantização da profissão', 'Personal Organizer limpa ou não limpa?'] },
  { n: 2, cor: '#1d2f55', ic: 'gaveta', tit: 'Os fundamentos da técnica', curto: 'Fundamentos',
    txt: 'A base do trabalho de uma organizer: conhecer o armário, categorizar, separar desapego de descarte e usar o gabarito.',
    aulas: ['Conhecendo o armário', 'O que é categorização', 'Diferença entre desapego e descarte', 'O que é gabarito'] },
  { n: 3, cor: '#b4532a', ic: 'lista', tit: 'O caminho',
    txt: 'O laboratório, onde você pratica antes da primeira cliente, e o que fazer primeiro para iniciar a sua carreira.',
    aulas: ['O que é laboratório?', 'Iniciando a sua carreira e o que fazer primeiro'] },
  { n: 4, cor: '#1f6f50', ic: 'dinheiro', tit: 'Suas primeiras diárias', curto: 'Primeiras diárias',
    txt: 'Quanto cobrar pela sua diária, as dúvidas mais comuns respondidas pela Paty e o passo a passo depois do primeiro serviço.',
    aulas: ['Quanto cobrar pela sua diária', 'Tira-dúvidas com a Paty (parte 1)', 'Tira-dúvidas com a Paty (parte 2)', 'Do primeiro serviço aos próximos passos'] }
];
/* "Comece por aqui" fica sempre no Módulo 1 (ver aulaInicio em app.js). */

const BONUS = [
  /* valor: preço de referência riscado. Bijuterias e Packs: valores da Mayara (09/10/2026).
     Gestão da Carreira e o curso (em OFERTA_ITENS): escolhidos pelo Claude a pedido da Mayara (15/10/2026). [CONFIRMAR com a Paty] */
  { id: 'B1', ic: 'calculadora', valor: 397, cor: '#1d2f55', tit: 'Bônus 1 — Gestão da Carreira da Personal Organizer',
    txt: 'Como gerenciar o seu negócio, captar mais clientes, precificar o seu serviço, o passo a passo para crescer depois das primeiras diárias e as despesas de viagem.' },
  { id: 'B2', ic: 'estrela', valor: 297, cor: '#a8842f', tit: 'Bônus 2 — Organização de Bijuterias',
    txt: 'Dicas para organizar brincos, colares, pulseiras e anéis, evitando peças emaranhadas e facilitando a visualização.' },
  { id: 'B3', ic: 'caixa', valor: 197, cor: '#1f6f50', tit: 'Bônus 3 — Packs de Organização para Otimizar Espaços',
    txt: 'Os organizadores que ajudam a aproveitar melhor cada espaço da casa.' }
];

const OFERTA_ITENS = [
  { t: 'Primeiros Passos da Personal Organizer: 14 aulas em 4 módulos', valor: 497 },
  { t: 'Gestão da Carreira da Personal Organizer', b: 'B1' },
  { t: 'Organização de Bijuterias', b: 'B2' },
  { t: 'Packs de Organização para Otimizar Espaços', b: 'B3' }
];

const AUTORIDADE = [
  { i: 'casa', cor: '#1f6f50', t: '12 anos de profissão como personal organizer' },
  { i: 'livro', cor: '#a8842f', t: 'Criadora do Método Organizadas' },
  { i: 'estrela', cor: '#b4532a', t: 'Organiza casas de alto padrão, inclusive de famosos' },
  { i: 'livro', cor: '#1d2f55', t: 'Coautora do livro <em>Elas Organizam Sem Frescuras</em>, ao lado de organizers de todo o Brasil' },
  { i: 'bandeira', cor: '#4b2a7b', t: 'Já deu treinamentos nos Estados Unidos e na Suíça' },
  { i: 'vassoura', cor: '#7a1f3a', t: 'Começou como doméstica, aos 12 anos' }
];

const PARA_QUEM_E = [
  'você é dona de casa, já organiza tudo e quer ganhar com isso',
  'você trabalha como diarista ou em casa de família e quer que o seu dia valha mais',
  'você quer trabalhar nos dias que escolher',
  'você está começando do zero, sem experiência'
];
const PARA_QUEM_NAO_E = [
  'você procura “uma promessa de dinheiro fácil”',
  'você quer só assistir e não praticar: “não é Netflix de curso”',
  'você já é organizer experiente. Para você, existe o Clube Organizadas'
];

/* Valores das variáveis (seção F do copy) */
const VALORES = {
  situacao_frase: ['cuida da sua casa e da sua família', 'trabalha como diarista', 'trabalha em casa de família',
                   'trabalha em outra área', 'está buscando uma renda'],
  ambiente: ['o seu guarda-roupa', 'a sua cozinha', 'as suas gavetas', 'o quarto das crianças', 'os seus papéis'],
  ambiente_curto: ['guarda-roupa', 'cozinha', 'gavetas', 'quarto das crianças', 'papéis'],
  ambiente_pelo: ['pelo seu guarda-roupa', 'pela sua cozinha', 'pelas suas gavetas', 'pelo quarto das crianças', 'pelos seus papéis'],
  ambiente_no: ['no seu guarda-roupa', 'na sua cozinha', 'nas suas gavetas', 'no quarto das crianças', 'nos seus papéis'],
  renda_hoje: ['até R$ 150', 'de R$ 150 a R$ 200', 'de R$ 200 a R$ 250', 'mais de R$ 250'],
  frase_peso: ['trabalho muito e ganho pouco', 'queria ter o meu próprio dinheiro', 'quase não tenho tempo para a minha família', 'sinto que nasci para algo mais'],
  trava: ['a técnica certa', 'quanto cobrar', 'a primeira cliente', 'o medo de errar', 'acreditar que é para você']
};
