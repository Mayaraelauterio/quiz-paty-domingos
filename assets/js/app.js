/* ==========================================================================
   TESTE DA PERSONAL ORGANIZER (Paty Domingos) — motor do quiz
   Base: motor do quiz "Os 7 Códigos da Aprovação" (Dayana Martins), adaptado.
   Conteúdo em data.js · Configuração em config.js · Validação em validacao.js
   QA: ?qa=1 mostra painel com pontuação · ?reset=1 limpa a sessão · ?tela=P20 pula para uma tela
   ========================================================================== */
(function () {
  'use strict';

  var C = window.CONFIG || {};
  var KEY = 'pd_organizer_v1';
  var REGRA_VERSAO = 'v1-hipotese';
  var params = new URLSearchParams(location.search);
  var QA = params.get('qa') === '1';
  var PH = !!C.MOSTRAR_ESPACOS_RESERVADOS;

  if (params.get('reset') === '1') { try { sessionStorage.removeItem(KEY); } catch (e) {} }

  var $app = document.getElementById('app');
  var $bar = document.getElementById('progresso');
  var $voltar = document.getElementById('voltar');
  var $ctaFixo = document.getElementById('cta-fixo');

  /* ------------------------------ ESTADO ------------------------------ */
  function novaSessao() {
    var utms = {};
    params.forEach(function (v, k) {
      if (/^utm_/i.test(k) || ['fbclid', 'gclid', 'src', 'sck', 'xcod'].indexOf(k.toLowerCase()) >= 0) utms[k] = v;
    });
    return {
      sid: 'q_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
      inicio: new Date().toISOString(),
      url: location.href, ref: document.referrer || '',
      utms: utms, pos: 0, pilha: [], A: {}, lead: null,
      leadEnviado: false, leadPendente: false, vistas: {}, diagVisto: false, comecou: false
    };
  }
  function carregar() { try { var r = sessionStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function salvar() { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  var S = carregar() || novaSessao();
  var A = S.A;

  /* ------------------------------ UTIL ------------------------------ */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function idxDe(id) { for (var i = 0; i < TELAS.length; i++) if (TELAS[i].id === id) return i; return -1; }
  function visivel(t) { return !t.show || !!t.show(A); }
  function unir(lista) {
    if (lista.length <= 1) return lista.join('');
    return lista.slice(0, -1).join(', ') + ' e ' + lista[lista.length - 1];
  }
  function val(x) { return typeof x === 'function' ? x(A) : x; }
  function milhar(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function dinheiro(n) { return (foraBrasil(A) ? '' : 'R$ ') + milhar(n); }

  var R = null; /* resultado calculado (cache) */

  function ctx() {
    var v = VALORES, x = {}, i;
    x.moeda = foraBrasil(A) ? '' : 'R$ ';
    i = sel(A, 'P1')[0]; x.situacao_frase = i != null ? v.situacao_frase[i] : '';
    i = sel(A, 'P8')[0]; x.ambiente = i != null ? v.ambiente[i] : 'um canto da sua casa'; x.ambiente_curto = i != null ? v.ambiente_curto[i] : 'a sua casa';
    x.ambiente_pelo = i != null ? v.ambiente_pelo[i] : 'por um canto da sua casa'; x.ambiente_no = i != null ? v.ambiente_no[i] : 'num canto da sua casa';
    i = sel(A, 'P18')[0]; x.frase_peso = i != null ? v.frase_peso[i] : '';
    i = sel(A, 'P24')[0]; x.trava = i != null ? v.trava[i] : '';
    i = sel(A, 'P3D')[0]; x.renda_hoje = i != null && i < 4 ? v.renda_hoje[i] : '';
    x.nome = S.lead && S.lead.nome ? esc(S.lead.nome) : '';
    if (R) {
      x.PILAR = PILARES[R.atencao].nome;
      x.pilar_forte = PILARES[R.forte].nome;
      x.PERFIL = PERFIS[R.perfil].nome; x.PERFIL_titulo = 'A ' + PERFIS[R.perfil].nome;
      if (R.conta) {
        x.meta = dinheiro(R.conta.meta);
        x.dias = R.conta.dias + (R.conta.dias === 1 ? ' dia' : ' dias');
        x.valor_dia = dinheiro(R.conta.valor);
        x.valor_5_dias = dinheiro(R.conta.valor5);
        x.minimo_mes = dinheiro(R.conta.minMes);
        x.maximo_mes = dinheiro(R.conta.maxMes);
      }
    }
    return x;
  }
  function fill(str) {
    if (str == null) return '';
    var s = String(val(str)).replace(/\{([^{}|]*)\|([^{}|]*)\}/g, function (_, m, f) { return f; }); /* quiz sempre no feminino */
    var c = ctx();
    return s.replace(/\{([a-zA-Z_0-9]+)\}/g, function (m, k) { return c[k] != null ? c[k] : m; });
  }
  function textoOpcao(t, i) { return fill(t.o[i].txt); }

  /* ------------------------------ TRACKING ------------------------------ */
  window.dataLayer = window.dataLayer || [];
  function track(ev, dados) {
    var d = Object.assign({ event: ev, session_id: S.sid }, dados || {});
    window.dataLayer.push(d);
    if (QA) console.log('[track]', ev, dados || '');
  }
  function fbq() { if (typeof window.fbq === 'function') window.fbq.apply(null, arguments); }
  if (C.META_PIXEL_ID) {
    /* Meta Pixel */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', C.META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* ------------------------------ PONTUAÇÃO ------------------------------ */
  function pontos(t, a) {
    if (!a || !a.idx || !a.idx.length) return null;
    if (t.score === 'contagem') {
      var ex = -1;
      t.o.forEach(function (o, i) { if (o.excl) ex = i; });
      if (a.idx.indexOf(ex) >= 0) return 3;
      var n = a.idx.length;
      return n === 1 ? 2 : n === 2 ? 1 : 0;
    }
    var p = t.o[a.idx[0]].p;
    return (p === null || p === undefined) ? null : p;
  }

  /* Perfil: vale o primeiro que bater (seção 5 do 03-quiz-completo.md) */
  function perfilDe() {
    var bagunca = is(A, 'P5', 2) || is(A, 'P5', 3);
    var nunca = is(A, 'P6', 2) || is(A, 'P6', 3);
    if (bagunca && nunca) return 'baguncada';
    if (ehCasa(A)) return 'profissional';
    if (ehRecomeco(A)) return 'recomeco';
    return 'nata';
  }

  /* Conta do valor do dia: meta ÷ (dias × 4), arredondada para cima de 10 em 10 */
  function contaDe() {
    var im = sel(A, 'P21')[0], id = sel(A, 'P22')[0];
    if (im == null || id == null) return null;
    var meta = METAS[im], dias = id + 1;
    function arred(x) { return Math.ceil(x / 10) * 10; }
    var valor = arred(meta / (dias * 4));
    var faixa = valor <= FAIXA_DIARIA.min ? 'folga' : valor <= FAIXA_DIARIA.max ? 'dentro' : 'acima';
    return { meta: meta, dias: dias, valor: valor, valor5: arred(meta / 20), faixa: faixa,
             minMes: dias * 4 * FAIXA_DIARIA.min, maxMes: dias * 4 * FAIXA_DIARIA.max };
  }

  function calcular() {
    var tot = {}, max = {}, sc = {};
    ORDEM_PILARES.forEach(function (c) { tot[c] = 0; max[c] = 0; });
    TELAS.forEach(function (t) {
      if (!t.cod || !visivel(t)) return;
      var p = pontos(t, A[t.id]);
      if (p === null) return;
      tot[t.cod] += p; max[t.cod] += 3;
    });
    ORDEM_PILARES.forEach(function (c) { sc[c] = max[c] ? Math.round(tot[c] / max[c] * 100) : 50; });

    var todosDePe = ORDEM_PILARES.every(function (c) { return sc[c] >= 70; });
    var min = Math.min.apply(null, ORDEM_PILARES.map(function (c) { return sc[c]; }));
    var atencao = todosDePe ? 'execucao' : DESEMPATE_ATENCAO.filter(function (c) { return sc[c] === min; })[0];
    var restantes = DESEMPATE_FORTE.filter(function (c) { return c !== atencao; });
    var mx = Math.max.apply(null, restantes.map(function (c) { return sc[c]; }));
    var forte = restantes.filter(function (c) { return sc[c] === mx; })[0];

    R = { scores: sc, atencao: atencao, forte: forte, todosDePe: todosDePe, perfil: perfilDe(), conta: contaDe() };
    return R;
  }

  /* As respostas que mais tiraram pontos de um pilar, citadas literalmente */
  function evidencias(cod, limite) {
    var lista = [];
    TELAS.forEach(function (t, ordem) {
      if (t.cod !== cod || !visivel(t)) return;
      var a = A[t.id], p = pontos(t, a);
      if (p === null || p >= 3) return;
      lista.push({ t: t, a: a, p: p, ordem: ordem });
    });
    lista.sort(function (x, y) { return x.p - y.p || x.ordem - y.ordem; });
    return lista.slice(0, limite || 3).map(function (e) { return citar(e.t); });
  }
  function citar(t) {
    var a = A[t.id];
    if (!a) return '';
    if (t.t === 'e') return 'Você respondeu “' + textoOpcao(t, a.idx[0]) + '” para: “' + fill(t.frase) + '”';
    if (t.t === 'm') return fill(t.rotulo) + ': ' + unir(a.idx.map(function (i) { return textoOpcao(t, i); }));
    var rot = t.rotulo || t.q.replace(/\?$/, '');
    return fill(rot) + ': “' + textoOpcao(t, a.idx[0]) + '”';
  }

  function leadScore() {
    var s = 0, sinais = [];
    var tab = {
      P26: [25, 20, 10, 0],
      P22: [5, 10, 15, 20, 20],
      P25: [5, 10, 15, 15],
      P23: [10, 5, 15, 15],
      P15: [0, 5, 10, 15]
    };
    Object.keys(tab).forEach(function (id) {
      var i = sel(A, id)[0];
      if (i == null) return;
      var v = tab[id][i] || 0;
      s += v;
      sinais.push({ id: id, resposta: textoOpcao(TELAS[idxDe(id)], i), pontos: v });
    });
    var im = sel(A, 'P21')[0];
    if (im != null && METAS[im] >= 5000) { s += 10; sinais.push({ id: 'P21', resposta: textoOpcao(TELAS[idxDe('P21')], im), pontos: 10 }); }
    sinais.sort(function (a, b) { return b.pontos - a.pontos; });
    var grade = s >= 70 ? 'A' : s >= 40 ? 'B' : 'C';
    if (is(A, 'P26', 3)) grade = 'C'; /* "Por enquanto, é só curiosidade" */
    var acoes = { A: 'Contato humano no WhatsApp e convite para o Clube depois da compra', B: 'Automação de nutrição e remarketing', C: 'Só e-mail de nutrição, sem remarketing pago' };
    return { score: s, raw: s, max: 100, grade: grade,
             label: grade === 'A' ? 'Pronta para começar' : grade === 'B' ? 'Precisa de um empurrão' : 'Curiosa',
             acao: acoes[grade], signals: sinais.slice(0, 3), version: REGRA_VERSAO };
  }

  /* ------------------------------ ENVIO DO LEAD ------------------------------ */
  var FORA_DO_CRM = ['P0', 'P3D', 'P3X', 'P3C', 'P3O', 'P3S', 'P4']; /* estado civil, renda atual e filhos ficam só no navegador */
  function payload() {
    var r = R || calcular();
    var respostas = {};
    TELAS.forEach(function (t) {
      if (!A[t.id] || FORA_DO_CRM.indexOf(t.id) >= 0 || !visivel(t)) return;
      respostas[t.id] = A[t.id].idx.map(function (i) { return textoOpcao(t, i); }).join(' | ');
    });
    return {
      session_id: S.sid, quiz: 'teste-personal-organizer', regra: REGRA_VERSAO,
      inicio: S.inicio, enviado_em: new Date().toISOString(),
      url: S.url, referrer: S.ref, utms: S.utms,
      lead: S.lead, respostas: respostas,
      perfil: r.perfil, pilares: r.scores, pilar_atencao: r.atencao, pilar_forte: r.forte,
      conta_dia: r.conta ? { meta: r.conta.meta, dias: r.conta.dias, valor_dia: r.conta.valor, faixa: r.conta.faixa, fora_do_brasil: foraBrasil(A) } : null,
      lead_score: leadScore()
    };
  }
  function enviarLead() {
    if (!C.WEBHOOK_URL || S.leadEnviado) return;
    var corpo = JSON.stringify(payload());
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    fetch(C.WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: corpo, keepalive: true, signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error(r.status); S.leadEnviado = true; S.leadPendente = false; salvar(); })
      .catch(function () { clearTimeout(timer); S.leadPendente = true; salvar(); });
  }
  window.addEventListener('pagehide', function () {
    if (C.WEBHOOK_URL && S.lead && !S.leadEnviado && navigator.sendBeacon) {
      try { navigator.sendBeacon(C.WEBHOOK_URL, new Blob([JSON.stringify(payload())], { type: 'application/json' })); } catch (e) {}
    }
  });

  /* ------------------------------ IMAGENS ------------------------------ */
  function foto(img, cls) {
    if (!img) return '';
    return '<figure class="foto ' + (cls || '') + '"><img src="assets/img/' + esc(img.src) + '" alt="' + esc(img.alt) +
      '" data-ph="' + esc(img.ph) + '" data-arq="' + esc(img.src) + '" loading="lazy"></figure>';
  }
  /* Foto inteira da Paty, sem recorte, que se dissolve no branco embaixo (degradê) */
  function fotoDegrade(src, alt, cls) {
    return '<figure class="foto-degrade ' + (cls || '') + '"><img src="assets/img/' + esc(src) + '" alt="' + esc(alt || 'Paty Domingos') + '" loading="lazy" data-card="1"></figure>';
  }
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (!el || el.tagName !== 'IMG') return;
    if (el.dataset.card) { el.remove(); return; }
    var fig = el.closest('figure');
    if (!fig) return;
    if (PH && el.dataset.ph) {
      fig.classList.add('ph');
      fig.innerHTML = '<div class="ph-in"><span>FOTO</span><b>' + esc(el.dataset.ph) + '</b><small>assets/img/' + esc(el.dataset.arq) + '</small></div>';
    } else { fig.remove(); }
  }, true);

  /* ------------------------------ VÍDEOS DE DEPOIMENTO ------------------------------ */
  function depoPorId(id) { for (var i = 0; i < DEPOIMENTOS.length; i++) if (DEPOIMENTOS[i].id === id) return DEPOIMENTOS[i]; return null; }
  /* Legenda sincronizada (legendas.js) e barra de progresso de um vídeo de depoimento */
  function ligarLegendas(v, id, $leg, $prog) {
    var cues = (typeof LEGENDAS !== 'undefined' && LEGENDAS[id]) || [], atual = -1;
    v.addEventListener('timeupdate', function () {
      var ct = v.currentTime, k = -1;
      for (var i = 0; i < cues.length; i++) if (ct >= cues[i][0] && ct < cues[i][1] + .15) { k = i; break; }
      if (k !== atual) { atual = k; $leg.innerHTML = k >= 0 ? '<span>' + esc(cues[k][2]) + '</span>' : ''; }
      if (v.duration && $prog) $prog.style.width = (ct / v.duration * 100) + '%';
    });
  }
  /* Vídeo em tela cheia, aberto por um toque: já começa com som e legenda, sem botão de play.
     Tocar no vídeo pausa e continua. Se o celular não deixar tocar com som, começa sem som e mostra "Toque para ouvir". */
  function abrirVideo(id) {
    var d = depoPorId(id);
    if (!d) return;
    track('video_play', { video: id, tela: TELAS[S.pos].id });
    var m = document.createElement('div');
    m.className = 'vmodal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Depoimento de ' + d.nome);
    m.innerHTML = '<div class="vmodal-in"><button type="button" class="vfechar" aria-label="Fechar o vídeo">✕</button>' +
      '<div class="player player-modal"><video src="assets/video/' + esc(d.video) + '" poster="assets/video/' + esc(d.poster) + '" playsinline autoplay preload="auto"></video>' +
      '<i class="pl-barra"><b></b></i><button type="button" class="pl-som" hidden>🔊 Toque para ouvir</button><p class="pl-legenda" aria-live="off"></p></div>' +
      '<p class="vlegenda"><b>' + esc(d.nome) + '</b>' + (d.antes ? ' · ' + esc(d.antes) : '') + '</p></div>';
    document.body.appendChild(m);
    document.body.classList.add('com-modal');
    var v = m.querySelector('video'), $som = m.querySelector('.pl-som');
    /* pausa o carrossel enquanto o vídeo em tela cheia toca; ele volta sozinho quando a tela cheia fecha */
    document.querySelectorAll('video').forEach(function (x) { if (x !== v && !x.paused) x.pause(); });
    ligarLegendas(v, d.id, m.querySelector('.pl-legenda'), m.querySelector('.pl-barra b'));
    var p = v.play();
    if (p && p.catch) p.catch(function () { v.muted = true; $som.hidden = false; v.play().catch(function () {}); });
    $som.addEventListener('click', function (ev) { ev.stopPropagation(); v.muted = false; v.currentTime = 0; v.play().catch(function () {}); $som.hidden = true; });
    m.querySelector('.player').addEventListener('click', function () {
      if (!$som.hidden) { $som.click(); return; }
      if (v.paused) v.play().catch(function () {}); else v.pause();
    });
    function fechar() {
      try { v.pause(); } catch (e) {}
      m.remove(); document.body.classList.remove('com-modal'); document.removeEventListener('keydown', tecla);
      document.dispatchEvent(new Event('vmodal-fechou'));
    }
    function tecla(ev) { if (ev.key === 'Escape') fechar(); }
    m.addEventListener('click', function (ev) { if (ev.target === m) fechar(); });
    m.querySelector('.vfechar').addEventListener('click', fechar);
    document.addEventListener('keydown', tecla);
    m.querySelector('.vfechar').focus();
  }
  $app.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-video]');
    if (b) { ev.preventDefault(); abrirVideo(b.dataset.video); }
  });

  /* ------------------------------ NAVEGAÇÃO ------------------------------ */
  function proximaVisivel(de) {
    for (var i = de + 1; i < TELAS.length; i++) if (visivel(TELAS[i])) return i;
    return TELAS.length - 1;
  }
  function avancar() {
    if (!S.comecou) { S.comecou = true; track('iniciou_quiz'); }
    S.pilha.push(S.pos);
    S.pos = proximaVisivel(S.pos);
    salvar();
    desenhar();
  }
  function voltar() {
    if (S.pilha.length) S.pos = S.pilha.pop();
    else {
      var i = S.pos - 1;
      while (i > 0 && !visivel(TELAS[i])) i--;
      if (i < 0 || i === S.pos) return;
      S.pos = i;
    }
    salvar();
    desenhar();
  }
  $voltar.addEventListener('click', voltar);

  function progresso() {
    var vis = TELAS.filter(visivel);
    var t = TELAS[S.pos];
    var i = vis.indexOf(t);
    var pct = Math.max(2, Math.round((i + 1) / vis.length * 100));
    $bar.style.width = pct + '%';
    $bar.parentNode.setAttribute('aria-valuenow', pct);
  }

  var limpeza = null; /* função para cancelar timers da tela atual */

  /* Inserções fixas: o texto cabe inteiro na tela, sem rolar.
     A tela ocupa a altura visível; se não couber, a foto, a letra e os espaços diminuem em até 4 passos.
     Só em telas muito baixas ainda pode sobrar rolagem, para nada ficar cortado. */
  var PASSOS_INS = ['ins-c1', 'ins-c2', 'ins-c3', 'ins-c4'];
  function ajustarInsercao() {
    PASSOS_INS.concat('ins-rola').forEach(function (c) { document.body.classList.remove(c); });
    var tela = $app.querySelector('.tela');
    if (!tela || !document.body.classList.contains('modo-ins')) return;
    var topo = document.querySelector('.topo');
    var livre = window.innerHeight - (topo ? topo.offsetHeight : 0) - parseFloat(getComputedStyle($app).paddingTop || 0);
    document.documentElement.style.setProperty('--ins-h', Math.floor(livre) + 'px');
    for (var i = 0; i < PASSOS_INS.length && tela.scrollHeight > livre + 1; i++) document.body.classList.add(PASSOS_INS[i]);
    document.body.classList.toggle('ins-rola', tela.scrollHeight > livre + 1);
  }
  /* Tela de vídeo: o vídeo ocupa toda a altura que sobra, sem a tela rolar */
  function ajustarVideo() {
    var pl = document.getElementById('player'), tela = $app.querySelector('.tela');
    if (!pl || !tela) return;
    var topo = document.querySelector('.topo');
    var livre = window.innerHeight - (topo ? topo.offsetHeight : 0) - parseFloat(getComputedStyle($app).paddingTop || 0);
    pl.style.height = '';
    var resto = tela.scrollHeight - pl.offsetHeight;
    var alt = Math.max(240, Math.min(livre - resto - 4, window.innerHeight * .74, 720));
    pl.style.height = Math.floor(alt) + 'px';
  }
  var ajusteTimer = null;
  window.addEventListener('resize', function () { clearTimeout(ajusteTimer); ajusteTimer = setTimeout(function () { ajustarInsercao(); ajustarVideo(); }, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarInsercao);

  function desenhar() {
    if (limpeza) { limpeza(); limpeza = null; }
    var t = TELAS[S.pos];
    var h = '';
    switch (t.t) {
      case 'capa': h = telaCapa(t); break;
      case 'q': case 'e': h = telaPergunta(t, false); break;
      case 'm': h = telaPergunta(t, true); break;
      case 'ins': h = telaInsercao(t); break;
      case 'video': h = telaVideo(t); break;
      case 'antesdepois': h = telaAntesDepois(t); break;
      case 'prova': h = telaProva(t); break;
      case 'diag': h = telaDiag(t); break;
      case 'captura': h = telaCaptura(t); break;
      case 'resultado': h = telaResultado(); break;
    }
    $app.className = 'app tela-' + t.t;
    $app.innerHTML = '<div class="tela">' + h + '</div>';
    document.body.classList.toggle('modo-resultado', t.t === 'resultado');
    document.body.classList.toggle('modo-ins', t.t === 'ins');
    document.body.classList.toggle('modo-video', t.t === 'video');
    document.body.classList.toggle('modo-capa', t.t === 'capa'); /* na capa, sem a barra do topo */
    $voltar.hidden = S.pos === 0 || t.t === 'resultado';
    $ctaFixo.hidden = true;
    progresso();
    window.scrollTo(0, 0);
    ajustarInsercao();
    ajustarVideo();
    $app.querySelectorAll('.ins-hero img').forEach(function (img) { if (!img.complete) img.addEventListener('load', ajustarInsercao); });
    ligar(t);
    var foco = $app.querySelector('[data-foco]');
    if (foco) { try { foco.focus({ preventScroll: true }); } catch (e) { foco.focus(); } }
    var n = TELAS.filter(visivel).indexOf(t) + 1;
    if (!S.vistas[t.id]) {
      S.vistas[t.id] = 1; salvar();
      track('s' + (n < 10 ? '0' : '') + n + '_' + t.id.toLowerCase(), { tela: t.id, tipo: t.t });
    }
    if (QA) painelQA();
  }

  /* ------------------------------ TELAS ------------------------------ */
  function numeroPergunta(t) {
    var n = 0;
    for (var i = 0; i < TELAS.length; i++) {
      var x = TELAS[i];
      if (!visivel(x) || ['capa', 'q', 'm', 'e'].indexOf(x.t) < 0) continue;
      n++;
      if (x === t) return n;
    }
    return 0;
  }
  function incentivo(t) {
    var n = numeroPergunta(t);
    if (n < 4 || n % 4 !== 0 || n / 4 > MOTIVACAO.length) return '';
    var m = MOTIVACAO[n / 4 - 1];
    return '<p class="incentivo inc-' + m.cor + '"><span class="inc-e" aria-hidden="true">' + m.e + '</span><span>' + fill(m.txt) + '</span></p>';
  }
  function cabecalhoPergunta(t) {
    var h = incentivo(t);
    h += '<h1 class="pergunta" tabindex="-1" data-foco>' + fill(t.q) + '</h1>';
    if (t.frase) h += '<blockquote class="frase">“' + fill(t.frase) + '”</blockquote>';
    var sub = val(t.sub);
    if (sub) h += '<p class="sub">' + fill(sub) + '</p>';
    return h;
  }

  function telaCapa(t) {
    var h = '<section class="capa">';
    h += '<div class="autora"><img src="assets/img/paty-avatar.jpg" alt="Paty Domingos" class="avatar" data-card="1">' +
      '<div><b>Paty Domingos</b><span>' + fill(t.selo) + '</span></div></div>';
    h += '<h1 class="hero" tabindex="-1" data-foco>' + fill(t.tit) + '</h1>';
    h += '<p class="hero-sub">' + fill(t.sub) + '</p>';
    h += '<p class="tempo">' + icone('relogio') + fill(t.tempo) + '</p>';
    h += '<h2 class="pergunta pergunta-capa">' + fill(t.q) + '</h2>';
    h += '<div class="cards cards-2 cards-idade">';
    t.o.forEach(function (o, i) {
      var on = is(A, t.id, i) ? ' on' : '';
      h += '<button type="button" class="card card-sm' + on + '" data-i="' + i + '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
        '<span class="card-img"><span class="card-e" aria-hidden="true">' + o.e + '</span>' +
        '<img src="assets/img/' + o.img + '" alt="" data-card="1"></span>' +
        '<span class="card-t">' + o.txt + '</span></button>';
    });
    h += '</div></section>';
    return h;
  }

  function telaPergunta(t, multi) {
    var h = '<div class="corpo-pergunta">';
    h += cabecalhoPergunta(t);
    if (multi) h += '<p class="sub sub-multi">Pode marcar mais de uma.</p>';
    h += '<div class="opcoes' + (multi ? ' multi' : '') + '" role="' + (multi ? 'group' : 'radiogroup') + '">';
    t.o.forEach(function (o, i) {
      var on = is(A, t.id, i);
      h += '<button type="button" class="opt' + (on ? ' on' : '') + '" data-i="' + i + '" ' +
        (multi ? 'aria-pressed="' + on + '"' : 'role="radio" aria-checked="' + on + '"') + '>' +
        '<span class="e" aria-hidden="true">' + o.e + '</span><span class="t">' + fill(o.txt) + '</span>' +
        (multi ? '<span class="check" aria-hidden="true"></span>' : '') + '</button>';
    });
    h += '</div></div>';
    if (multi) h += botaoFixo('Continuar', !sel(A, t.id).length);
    return h;
  }

  function botaoFixo(txt, desab) {
    return '<div class="rodape-fixo"><button type="button" class="btn" id="segue"' + (desab ? ' disabled' : '') + '>' + fill(txt) + '</button></div>';
  }

  /* Inserção com fundo branco: a foto da Paty fica grande no alto, sem recorte, e se dissolve no branco (degradê).
     O texto começa abaixo do rosto. No fim, a frase que leva ao depoimento em vídeo da próxima tela. */
  function telaInsercao(t) {
    var h = '';
    if (t.fundo) {
      h += '<figure class="ins-hero' + (t.retrato ? ' ins-hero-ret' : '') + '" style="--foco:' + esc(t.foco || '50% 25%') + '">' +
        '<img src="assets/img/' + esc(t.fundo) + '" alt="" data-card="1">' + (t.legendaFoto ? '<figcaption class="hero-tag">' + t.legendaFoto + '</figcaption>' : '') + '</figure>';
    }
    h += '<div class="ins-corpo">';
    if (t.selo) h += '<p class="selo">' + t.selo + '</p>';
    h += '<h1 class="tit-ins" tabindex="-1" data-foco>' + fill(val(t.tit)) + '</h1>';
    h += '<ul class="pontos">';
    (t.pontos || []).forEach(function (p) {
      var v = val(p);
      if (!v) return;
      h += '<li class="ponto' + (v.destaque ? ' destaque' : '') + '"><span class="ponto-ic">' + icone(v.i) + '</span><p>' + fill(v.t) + '</p></li>';
    });
    h += '</ul>';
    if (t.nota && t.nota.when(A)) h += '<p class="nota-ins">' + icone('estrela') + '<span>' + fill(t.nota.html) + '</span></p>';
    /* Uma frase personalizada por inserção, no máximo: vale a primeira da lista que bater com as respostas */
    (t.extras || []).some(function (x) {
      if (!x.when(A)) return false;
      h += '<div class="pessoal"><span class="pessoal-tag">' + icone('pessoa') + 'Com base na sua resposta</span><p>' + fill(x.html) + '</p></div>';
      return true;
    });
    if (t.caixa) h += '<p class="assina">' + fill(t.caixa.t) + '</p>';
    if (t.pilar) h += '<p class="pilar-ins">' + icone(ICONE_PILAR[TELAS[S.pos - 1] && TELAS[S.pos - 1].cod] || 'chave') + '<span>' + t.pilar + '</span></p>';
    if (t.fecho) h += '<p class="fecho">' + fill(t.fecho) + '</p>';
    var d = t.depo ? depoPorId(t.depo) : null;
    if (d) {
      h += '<div class="teaser"><img src="assets/video/' + esc(d.poster) + '" alt="" data-card="1">' +
        '<p><small>Na próxima tela</small><b>' + esc(d.gancho) + '</b></p></div>';
    }
    h += '</div>';
    h += botaoFixo(t.btn || 'Continuar');
    return h;
  }

  /* Tela do depoimento em vídeo: começa sozinho assim que a tela abre, sem som, com legenda (como nos Reels).
     Não tem botão de play. "Toque para ouvir" liga o som e volta para o começo. */
  function telaVideo(t) {
    var d = depoPorId(t.depo);
    if (!d) return botaoFixo(t.btn || 'Continuar');
    var h = '<p class="selo selo-video">' + icone('video') + 'Depoimento real</p>';
    h += '<h1 class="tit-video" tabindex="-1" data-foco>' + esc(d.gancho || ('Depoimento da ' + d.nome)) + '</h1>';
    h += '<p class="video-quem"><b>' + esc(d.nome) + '</b>' + (d.antes ? ' · ' + esc(d.antes) : '') + '</p>';
    h += '<div class="player" id="player"><video id="vid" src="assets/video/' + esc(d.video) + '" poster="assets/video/' + esc(d.poster) + '" playsinline muted autoplay preload="auto"></video>' +
      '<i class="pl-barra"><b id="pl-prog"></b></i>' +
      '<button type="button" class="pl-som" id="pl-som">🔊 Toque para ouvir</button>' +
      '<p class="pl-legenda" id="pl-leg" aria-live="off"></p></div>';
    h += botaoFixo(t.btn || 'Continuar');
    return h;
  }

  function telaAntesDepois(t) {
    var r = R || calcular();
    var h = '<h1 class="tit-ins" tabindex="-1" data-foco>' + t.tit + '</h1><p class="sub">' + t.sub + '</p><div class="ad">';
    ANTES_DEPOIS.forEach(function (l) {
      var meu = l.cod === r.atencao;
      h += '<div class="ad-linha' + (meu ? ' meu' : '') + '">' +
        '<div class="ad-top"><b>' + icone(ICONE_PILAR[l.cod]) + PILARES[l.cod].nome + '</b>' + (meu ? '<span class="tag">O seu pilar</span>' : '') + '</div>' +
        '<p class="ad-quando">Quando ' + l.quando + '…</p>' +
        '<div class="ad-cols"><div class="ad-a"><small>Hoje</small>' + l.a + '</div><div class="ad-d"><small>Como organizer</small>' + l.d + '</div></div></div>';
    });
    h += '</div><div class="caixa">' + t.caixa + '</div>' + botaoFixo(t.btn);
    return h;
  }

  /* Depoimentos ordenados: primeiro os de quem tem o mesmo ponto de partida */
  function jaVisto(d) { return !!(d.tela && S.vistas[d.tela]); }
  function depoimentosOrdenados() {
    var grupo = ehCasa(A) ? 'casa' : ehDona(A) ? 'dona' : 'recomeco';
    /* Mais forte primeiro (resultado concreto), com bônus para o mesmo ponto de partida e para o que ela ainda não viu */
    function peso(d) { return (d.forca || 0) + (d.grupo === grupo ? 2 : 0) + (jaVisto(d) ? 0 : 1); }
    return DEPOIMENTOS.slice().sort(function (a, b) { return peso(b) - peso(a); });
  }
  function depoimentosVazios(n) {
    var h = '';
    if (PH) for (var i = 1; i <= n; i++) h += '<div class="depo depo-ph"><span>DEPOIMENTO ' + i + '</span><b>Aguardando vídeo autorizado</b><small>Adicionar em data.js → DEPOIMENTOS</small></div>';
    return h;
  }

  /* Prova: até 3 vídeos que ela ainda não viu (os mais fortes primeiro). Se faltar, entra um depoimento em texto. */
  function provaVideos() {
    return depoimentosOrdenados().filter(function (d) { return !jaVisto(d) && (d.forca || 0) >= 2; }).slice(0, 3);
  }
  function provaTextos() {
    var falta = 3 - provaVideos().length;
    return falta > 0 ? textosOrdenados().filter(function (x) { return x.id === 'claudia' || x.id === 'jane'; }).slice(0, falta) : [];
  }
  function telaProva(t) {
    var h = '<h1 class="tit-ins" tabindex="-1" data-foco>' + t.tit + '</h1><p class="sub">' + t.sub + '</p>';
    var vids = provaVideos();
    h += vids.length ? carrosselHTML(vids, 'car-prova') : '<div class="vlista">' + depoimentosVazios(3) + '</div>';
    var tx = provaTextos();
    if (tx.length) h += '<div class="chat">' + tx.map(bolha).join('') + '</div>';
    return h + botaoFixo(t.btn);
  }
  /* Depoimentos em texto (prints), como mensagens */
  function textosOrdenados() {
    var grupo = foraBrasil(A) ? 'fora' : ehCasa(A) ? 'casa' : ehDona(A) ? 'dona' : 'recomeco';
    return DEPO_TEXTO.slice().sort(function (a, b) { return (b.grupo === grupo) - (a.grupo === grupo); });
  }
  function bolha(x) {
    return '<figure class="bolha' + (x.canal === 'Instagram' ? ' insta' : '') + '"><figcaption><b>' + esc(x.nome) + '</b> · ' + esc(x.info) +
      '<small>' + esc(x.canal) + '</small></figcaption><blockquote>' + esc(x.txt) + '</blockquote></figure>';
  }

  /* Texto da faixa da conta do dia */
  function leituraFaixa(conta) {
    if (foraBrasil(A)) return 'Os valores mudam de país para país. No seu plano, eu te mostro como chegar ao preço certo onde você mora.';
    if (conta.faixa === 'folga') return 'A sua meta cabe com folga: fica abaixo até da diária mais simples de uma organizer iniciante.';
    if (conta.faixa === 'dentro') return 'A sua meta está dentro do que uma organizer iniciante costuma cobrar por dia.';
    return fill('Para essa meta, você precisaria de mais dias por semana ou de chegar ao alto padrão. Com 5 dias, cada diária precisaria valer {valor_5_dias}.');
  }
  function blocoConta(r, completo) {
    if (!r.conta) return '';
    var h = '<div class="conta"><p class="conta-tag">' + icone('calculadora') + 'A conta do seu dia</p>';
    h += '<p>' + fill('Para ganhar <b>{meta}</b> por mês trabalhando <b>{dias}</b> por semana, cada diária sua precisa valer:') + '</p>';
    h += '<p class="conta-valor">' + fill('{valor_dia}') + '<small> por diária</small></p>';
    h += '<p class="conta-leitura">' + leituraFaixa(r.conta) + '</p>';
    var i = sel(A, 'P3D')[0];
    if (ehCasa(A) && !foraBrasil(A) && i != null && i < 4) h += '<p class="conta-hoje">' + icone('vassoura') + fill('Hoje você recebe <b>{renda_hoje}</b> por dia de trabalho.') + '</p>';
    if (completo && !foraBrasil(A)) h += '<p class="conta-mes">' + fill('Com {dias} por semana e a agenda cheia, numa diária de R$ 300 a R$ 600, seriam de <b>{minimo_mes} a {maximo_mes}</b> por mês.') + '</p>';
    h += '<p class="conta-aviso">É uma conta, não uma promessa de ganho.' + (completo ? ' O resultado depende de técnica, dedicação, região e de conseguir clientes.' : '') + '</p></div>';
    return h;
  }

  function telaDiag() {
    /* Diagnóstico grátis antes da captura: perfil + respostas + conta do dia + pilar.
       Ficam para depois do formulário: o mapa dos 3 pilares e o plano de 7 dias. */
    var r = calcular(), pf = PERFIS[r.perfil];
    var h = '<div class="diag-load" id="diag-load"' + (S.diagVisto ? ' hidden' : '') + '><div class="anel"></div><p>Lendo <b id="diag-cod">TÉCNICA</b>…</p></div>';
    h += '<section class="diag" id="diag"' + (S.diagVisto ? '' : ' hidden') + '>';
    h += '<p class="selo">Seu diagnóstico</p>';
    h += '<span class="ins-ic ins-ic-lg">' + icone(pf.ic) + '</span>';
    h += '<h1 class="tit-ins" tabindex="-1" data-foco>Você é a <span class="ouro">' + pf.nome + '</span>.</h1>';
    h += '<p class="frase-cod">' + pf.frase + '</p>';
    var ev = [];
    if (A.P1) ev.push(citar(TELAS[idxDe('P1')]));
    if (r.perfil === 'baguncada' && A.P5) ev.push(citar(TELAS[idxDe('P5')]));
    else if (A.P6) ev.push(citar(TELAS[idxDe('P6')]));
    var e3 = evidencias(r.atencao, 1);
    if (e3.length) ev.push(e3[0]);
    if (ev.length) h += '<div class="recap"><p class="recap-tit">De acordo com o que você respondeu:</p><ul>' +
      ev.map(function (e) { return '<li>' + icone('check') + '<span>' + e + '</span></li>'; }).join('') + '</ul></div>';
    h += blocoConta(r, false);
    h += r.todosDePe
      ? '<p class="pilar-linha">Os seus 3 pilares estão de pé. O seu ponto de atenção é <b>EXECUÇÃO</b>: não deixar a primeira diária para depois.</p>'
      : '<p class="pilar-linha">' + icone(ICONE_PILAR[r.atencao]) + '<span>O pilar que pede mais atenção agora: <b>' + PILARES[r.atencao].nome + '</b>.</span></p>';
    h += '<p class="diag-sub">Ainda falta montar o seu plano:</p>';
    h += '<ul class="cadeados"><li>' + icone('lista') + '<span>O mapa dos seus 3 pilares</span><i class="cadeado" aria-label="bloqueado">🔒</i></li>' +
      '<li>' + icone('calendario') + '<span>O seu plano de 7 dias do laboratório</span><i class="cadeado" aria-label="bloqueado">🔒</i></li></ul>';
    h += '<div class="caixa">A boa notícia: organização não é dom. É técnica, e técnica se aprende.</div>';
    h += '<p class="fecho">Para montar o seu plano, só mais 3 perguntas.</p>';
    h += botaoFixo('Responder às últimas 3');
    h += '</section>';
    return h;
  }

  function telaCaptura(t) {
    var L = S.lead || {}, fora = foraBrasil(A);
    var h = '<h1 class="tit-ins" tabindex="-1" data-foco>' + t.tit + '</h1><p class="sub">' + t.sub + '</p>';
    h += '<div class="proc" role="status" aria-live="polite"><div class="proc-top"><span id="proc-txt">' + fill(t.passos[0][1]) + '</span><b id="proc-pct">0%</b></div>' +
      '<div class="proc-bar"><i id="proc-bar"></i></div></div>';
    h += '<form class="form" id="form" novalidate>' +
      campo('nome', 'Seu primeiro nome', 'text', 'given-name', L.nome) +
      campo('email', 'Seu melhor e-mail', 'email', 'email', L.email) +
      campoWhats(fora, L) +
      '<p class="consent">Ao continuar, você concorda em receber conteúdos e ofertas da Paty Domingos por e-mail e WhatsApp. Você pode sair quando quiser.' +
      (C.POLITICA_URL ? ' <a href="' + esc(C.POLITICA_URL) + '" target="_blank" rel="noopener">Política de privacidade</a>' : (PH ? ' <span class="falta">[Política de privacidade: configurar]</span>' : '')) + '</p>' +
      '<button type="submit" class="btn" id="enviar" disabled>' + t.btn + '</button></form>';
    return h;
  }
  function campo(nome, rotulo, tipo, auto, valor) {
    var extra = '';
    if (tipo === 'email') extra = ' inputmode="email" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="seunome@gmail.com"';
    if (tipo === 'text') extra = ' autocapitalize="words" placeholder="Ex.: Maria" maxlength="40"';
    return '<label class="campo"><span>' + rotulo + '</span><input name="' + nome + '" type="' + tipo + '" autocomplete="' + auto + '"' +
      extra + ' value="' + esc(valor || '') + '"><em class="erro" id="erro-' + nome + '"></em>' +
      (nome === 'email' ? '<span class="dominios" id="dominios" hidden></span><button type="button" class="sugestao" id="sugestao-email" hidden></button>' : '') + '</label>';
  }
  function campoWhats(fora, L) {
    var pais = (L.pais) || (fora ? 'US' : 'BR');
    var opts = VALIDA.PAISES.map(function (p) {
      return '<option value="' + p.id + '"' + (p.id === pais ? ' selected' : '') + '>' + p.bandeira + ' ' + p.nome + (p.ddi ? ' (+' + p.ddi + ')' : '') + '</option>';
    }).join('');
    return '<label class="campo campo-whats"><span>Seu WhatsApp (com DDD)</span>' +
      '<span class="whats-linha"><select name="pais" id="pais" aria-label="País do seu WhatsApp"' + (fora ? '' : ' hidden') + '>' + opts + '</select>' +
      '<input name="whatsapp" type="tel" autocomplete="tel-national" inputmode="tel" value="' + esc(VALIDA.mascaraPais(L.whatsappDigitado || '', pais)) + '" placeholder="' + esc(VALIDA.exemplo(pais)) + '"></span>' +
      '<em class="erro" id="erro-whatsapp"></em><small class="confirma" id="confirma-whats" hidden></small></label>';
  }

  /* ------------------------------ RESULTADO + PITCH ------------------------------ */
  function faixa(v) { return v < 40 ? ['Começando', 'f-trav'] : v < 70 ? ['Em construção', 'f-inst'] : ['De pé', 'f-pe']; }

  function telaResultado() {
    var r = calcular();
    var at = PILARES[r.atencao], fo = PILARES[r.forte], pf = PERFIS[r.perfil];
    var h = '';

    /* H1 — mapa */
    h += '<section class="res-mapa">';
    h += fotoDegrade('paty-fatura.jpg', 'Paty Domingos', 'res-hero');
    h += '<div class="sobre-foto"><p class="selo">Seu plano está pronto</p>';
    h += '<h1 class="tit-res" tabindex="-1" data-foco>' + fill('{nome}, este é o seu mapa de organizer') + '</h1></div>';
    h += '<div class="barras">';
    ORDEM_PILARES.forEach(function (c) {
      var v = r.scores[c], f = faixa(v), meu = c === r.atencao;
      h += '<div class="cb' + (meu ? ' meu' : '') + '"><div class="cb-top"><b>' + icone(ICONE_PILAR[c]) + PILARES[c].nome + '</b><span class="faixa ' + f[1] + '">' + f[0] + '</span><span class="num">' + v + '</span></div>' +
        '<div class="trilho"><i data-w="' + v + '"></i></div></div>';
    });
    h += '</div><p class="nota">Leitura do momento, feita a partir das suas respostas. Não é um rótulo: pilar se treina.</p>';

    h += '<article class="card-res card-perfil"><span class="tag tag-sutil">O seu perfil</span><span class="card-ic">' + icone(pf.ic) + '</span>' +
      '<h2>A ' + pf.nome + '</h2><p>' + pf.leitura + '</p><p class="fase">' + pf.fase + '</p></article>';

    h += blocoConta(r, true);

    h += '<article class="card-res card-trav"><span class="tag">Comece por aqui</span><span class="card-ic">' + icone(ICONE_PILAR[r.atencao]) + '</span>';
    h += '<h2>O pilar que pede atenção: <span class="ouro">' + at.nome + '</span></h2><p class="frase-cod">' + at.frase + '</p><p>' + at.atencao + '</p>';
    var ev = evidencias(r.atencao, 2);
    if (ev.length) h += '<p class="evid-linha"><b>Por que cheguei a esse resultado:</b> ' + ev.join(' · ') + '</p>';
    h += '<div class="acao"><b>Cuidado extra:</b><p>' + at.cuidado + '</p></div></article>';

    if (r.scores[r.forte] >= 40) {
      h += '<article class="card-res card-forte"><span class="tag tag-sutil">O que já te sustenta</span><h2>' + fo.nome + '</h2><p>' + fo.depe + '</p></article>';
    } else {
      h += '<article class="card-res card-forte"><span class="tag tag-sutil">Onde você está</span><p>Você está no começo dos 3 pilares. É por isso que o plano começa pelo laboratório.</p></article>';
    }
    h += '</section>';

    /* H1b — plano de 7 dias do laboratório (presente, mesmo para quem não compra) */
    h += '<section class="sec lab"><p class="selo">O seu laboratório</p><h2 class="tit-sec">' + fill('Os seus próximos 7 dias, começando {ambiente_pelo}') + '</h2><ol class="dias7">' +
      PLANO_7_DIAS.map(function (d, k) { return '<li><span class="d-n">Dia ' + (k + 1) + '</span><span>' + fill(d) + '</span></li>'; }).join('') + '</ol>' +
      secTextosLab() +
      '<p class="ponte">Você pode começar agora, só com este plano. Mas, se quiser que eu te mostre cada etapa e como cobrar a sua primeira diária, continue lendo.</p></section>';

    /* H1c — hoje × como organizer, do pilar da pessoa */
    var adl = null;
    ANTES_DEPOIS.forEach(function (l) { if (l.cod === r.atencao) adl = l; });
    if (adl) {
      h += '<section class="sec ad-pitch"><p class="selo">Hoje × como organizer</p><h2 class="tit-sec">Quando ' + adl.quando + '…</h2>' +
        '<div class="adp"><div class="adp-a"><small>Hoje</small><p>' + adl.a + '</p></div><span class="adp-seta" aria-hidden="true">→</span>' +
        '<div class="adp-d"><small>Como organizer</small><p>' + adl.d + '</p></div></div>';
      h += '<p class="rolar">↓ Role a tela e veja o seu plano completo ↓</p></section>';
    }

    /* H2 — carta */
    h += '<section class="sec carta">';
    h += fotoDegrade('paty-carta.jpg', 'Paty Domingos', 'carta-foto');
    h += '<h2 class="tit-sec sobre-foto">' + fill('{nome}, você já organiza. Agora é hora de ser paga por isso.') + '</h2>';
    var conf = [];
    if (sel(A, 'P1').length) conf.push('Você <b>{situacao_frase}</b>');
    if (sel(A, 'P18').length) conf.push('O que mais pesa hoje: <b>“{frase_peso}”</b>');
    if (r.conta) conf.push('A sua meta: <b>{meta} por mês</b>, trabalhando <b>{dias} por semana</b>');
    if (sel(A, 'P24').length) conf.push('O que mais te trava: <b>{trava}</b>');
    h += '<div class="conforme"><p class="conf-tit">Conforme você respondeu no quiz:</p><ul>' +
      conf.map(function (c) { return '<li>' + icone('check') + '<span>' + fill(c) + '</span></li>'; }).join('') + '</ul>' +
      '<p class="conf-verde">' + icone('check') + '<span>' + fill('Com base nessas respostas, o seu plano começa pelo laboratório <b>{ambiente_no}</b>, com atenção especial em <b>{PILAR}</b>.') + '</span></p></div>';
    if (is(A, 'P26', 2)) h += '<p>E você não precisa dar conta de tudo de uma vez. A gente começa por um armário.</p>';
    h += '</section>';

    /* Depoimentos em vídeo, em carrossel que passa sozinho */
    h += secCarrossel();

    /* H3 — mecanismo */
    h += '<section class="sec mecanismo"><p class="selo">O caminho até a primeira diária</p><ol class="mec-passos">' +
      '<li>' + icone('lista') + '<div><b>Técnica</b><p>Aprender o processo de uma organizer profissional.</p></div></li>' +
      '<li>' + icone('casa') + '<div><b>Laboratório</b><p>Praticar na sua casa e fotografar o antes e o depois.</p></div></li>' +
      '<li>' + icone('dinheiro') + '<div><b>Primeira diária</b><p>Saber o valor do seu dia e oferecer o seu serviço.</p></div></li></ol>' +
      '<p class="mec-frase">Foi assim que eu comecei: dentro da minha casa.</p></section>';

    h += '<section class="sec requisitos"><h2 class="tit-sec">O que você precisa para cobrar a sua primeira diária?</h2><ol class="req">' +
      (r.conta ? '<li><span class="req-n">1</span><span>' + fill('Os dias que você já tem: <b>{dias} por semana</b>.') + '</span></li>' : '') +
      '<li><span class="req-n">' + (r.conta ? 2 : 1) + '</span><span>' + fill('Um lugar para começar: <b>{ambiente}</b>.') + '</span></li>' +
      '<li><span class="req-n">' + (r.conta ? 3 : 2) + '</span><span>A técnica certa para cada ambiente da casa.</span></li></ol>' +
      '<p class="req-fim">Tudo isso está nas aulas abaixo.</p></section>';

    h += secProduto(r) + secBonus();

    /* H6 — autoridade */
    h += '<section class="sec autoridade">' + fotoDegrade('paty-autoridade.jpg', 'Paty Domingos', 'aut-foto');
    h += '<h2 class="tit-sec sobre-foto">Quem está falando com você</h2>';
    h += '<ul class="aut-lista">' + AUTORIDADE.map(function (a) {
      return '<li style="--cor:' + a.cor + '"><span class="aut-ic">' + icone(a.i) + '</span><span>' + a.t + '</span></li>';
    }).join('') + '</ul>';
    h += '</section>';

    /* H7 — para quem é */
    h += '<section class="sec quem"><h2 class="tit-sec">Para quem é</h2><div class="quem-cols">' +
      '<div class="quem-sim"><b>É para você se:</b><ul>' + PARA_QUEM_E.map(function (x) { return '<li>' + icone('check') + '<span>' + x + '</span></li>'; }).join('') + '</ul></div>' +
      '<div class="quem-nao"><b>Não é para você se:</b><ul>' + PARA_QUEM_NAO_E.map(function (x) { return '<li>' + icone('proibido') + '<span>' + x + '</span></li>'; }).join('') + '</ul></div></div></section>';

    /* H8 — oferta */
    var total = totalOferta();
    h += '<section class="sec oferta" id="oferta"><div class="oferta-box"><h2 class="tit-sec">Tudo o que você recebe hoje</h2><ul class="check">' +
      OFERTA_ITENS.map(function (x) {
        var b = x.b ? bonusPorId(x.b) : null, v = x.valor || (b && b.valor);
        return '<li><span>' + x.t + '</span>' + (v ? '<s>' + reais(v) + '</s>' : '') + '</li>';
      }).join('') + '</ul>' +
      (total ? '<p class="de">de <s>' + reais(total) + '</s></p>' : '') +
      '<p class="preco"><small>por</small> ' + esc(C.PRECO || '') + ' <small>à vista</small></p>' +
      (C.PARCELAS_TEXTO ? '<p class="parcelas">' + esc(C.PARCELAS_TEXTO) + '</p>' : '') +
      botaoCheckout('cta-oferta') +
      '<p class="seguro">Pagamento seguro · Garantia de 7 dias' + (C.ACESSO_TEXTO ? ' · ' + esc(C.ACESSO_TEXTO) : '') + '</p>' +
      (C.COMO_RECEBE ? '<p class="seguro">' + esc(C.COMO_RECEBE) + '</p>' : '') + '</div></section>';

    /* H9 — garantia */
    h += '<section class="sec garantia">' + brasaoSVG() + '<p class="gar-frase">Assista às aulas, faça o seu laboratório e decida. Se não for para você, peça o reembolso em até 7 dias e receba 100% do valor.</p></section>';

    /* H10 — fechamento */
    h += '<section class="sec fechamento"><div class="impacto impacto-paty">' +
      '<p class="imp-pergunta">Você já organiza de graça. Agora é hora de ser paga por isso.</p>' +
      '<p class="imp-frase">“Tem casas precisando de você.”</p>' +
      '<p class="imp-assina">Paty Domingos</p></div>' + botaoCheckout('cta-final') + '</section>';

    h += rodape();
    return h;
  }

  /* Depoimentos em texto no laboratório: os que não apareceram na tela de provas, primeiro os do mesmo perfil */
  function secTextosLab() {
    var usados = provaTextos().map(function (x) { return x.id; });
    var lista = textosOrdenados().filter(function (x) { return usados.indexOf(x.id) < 0 && (x.grupo !== 'fora' || foraBrasil(A)); }).slice(0, 4);
    if (!lista.length) return '';
    return '<div class="lab-depos"><h3 class="tit-mini">Quem começou pelo laboratório</h3>' +
      '<p class="nota">Mensagens reais enviadas à Paty, com o texto como foi escrito. Resultados individuais.</p>' +
      '<div class="chat">' + lista.map(bolha).join('') + '</div></div>';
  }

  function reais(v) { var p = v.toFixed(2).split('.'); return 'R$ ' + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + p[1]; }
  function totalOferta() { return OFERTA_ITENS.reduce(function (t, x) { var b = x.b ? bonusPorId(x.b) : null; return t + (x.valor || (b && b.valor) || 0); }, 0); }

  /* Carrossel de depoimentos em vídeo (tela de provas e página de vendas).
     O vídeo do meio começa sozinho, sem som e com legenda; quando acaba, passa para o próximo e volta ao começo.
     Não tem botão de play. Tocar no vídeo abre em tela cheia, com som. */
  function secCarrossel() {
    var lista = depoimentosOrdenados().filter(function (d) { return (d.forca || 0) >= 2; });
    if (!lista.length) return '';
    return '<section class="sec depos-sec"><p class="selo">O que as alunas dizem</p><h2 class="tit-sec">Veja quem já começou</h2>' +
      carrosselHTML(lista, 'car-vendas') + '</section>';
  }
  function carrosselHTML(lista, id) {
    var h = '<div class="carrossel' + (lista.length === 1 ? ' um' : '') + '" id="' + id + '" aria-label="Depoimentos em vídeo">' + lista.map(function (d) {
      return '<button type="button" class="slide" data-video="' + esc(d.id) + '" aria-label="Ouvir o depoimento de ' + esc(d.nome) + '">' +
        '<span class="slide-img"><video muted playsinline preload="none" poster="assets/video/' + esc(d.poster) + '" data-src="assets/video/' + esc(d.video) + '" data-depo="' + esc(d.id) + '"></video>' +
        '<i class="pl-barra"><b></b></i><span class="slide-som">🔊 Toque para ouvir</span><p class="pl-legenda" aria-live="off"></p>' +
        (d.dur ? '<span class="slide-dur">' + esc(d.dur) + '</span>' : '') + '</span>' +
        '<b>' + esc(d.nome) + '</b>' + (d.antes ? '<small>' + esc(d.antes) + '</small>' : '') + (d.frase ? '<q>' + esc(d.frase) + '</q>' : '') + '</button>';
    }).join('') + '</div>';
    if (lista.length > 1) h += '<div class="car-pontos" id="' + id + '-pontos">' + lista.map(function (d, i) { return '<button type="button" aria-label="Depoimento ' + (i + 1) + '" data-ir="' + i + '"' + (i ? '' : ' class="on"') + '></button>'; }).join('') + '</div>';
    return h;
  }
  function ligarCarrossel(car) {
    if (!car) return function () {};
    var pts = document.getElementById(car.id + '-pontos');
    var slides = car.querySelectorAll('.slide'), atual = 0, pausa = 0, naTela = false, semAutoplay = false;
    function video(i) { return slides[i].querySelector('video'); }
    slides.forEach(function (sl, i) {
      var v = video(i);
      ligarLegendas(v, v.dataset.depo, sl.querySelector('.pl-legenda'), sl.querySelector('.pl-barra b'));
      v.addEventListener('ended', function () { if (i === atual && slides.length > 1) irPara(atual + 1); else { v.currentTime = 0; tocar(); } });
      v.addEventListener('playing', function () { semAutoplay = false; });
    });
    /* toca só o vídeo do meio, e só quando o carrossel está na tela e não há vídeo aberto em tela cheia */
    function tocar() {
      var pode = naTela && !document.querySelector('.vmodal') && !document.hidden;
      slides.forEach(function (sl, i) { var v = video(i); if ((i !== atual || !pode) && !v.paused) v.pause(); });
      if (!pode) return;
      var v = video(atual);
      if (!v.getAttribute('src')) { v.preload = 'auto'; v.src = v.dataset.src; }
      v.muted = true;
      var p = v.play();
      /* só conta como bloqueio quando o navegador recusa tocar sozinho (não quando a pessoa troca de vídeo no meio) */
      if (p && p.catch) p.catch(function (e) { if (e && e.name === 'NotAllowedError') semAutoplay = true; });
    }
    function irPara(i, suave) {
      var novo = (i + slides.length) % slides.length;
      if (novo !== atual) { try { video(novo).currentTime = 0; } catch (e) {} }
      atual = novo;
      var sl = slides[atual];
      car.scrollTo({ left: sl.offsetLeft - (car.clientWidth - sl.offsetWidth) / 2, behavior: suave === false ? 'auto' : 'smooth' });
      marcarPontos();
      tocar();
    }
    function marcarPontos() { if (pts) pts.querySelectorAll('button').forEach(function (b, i) { b.classList.toggle('on', i === atual); }); }
    function marcar() {
      var meio = car.scrollLeft + car.clientWidth / 2, k = 0, menor = 1e9;
      slides.forEach(function (sl, i) { var d = Math.abs(sl.offsetLeft + sl.offsetWidth / 2 - meio); if (d < menor) { menor = d; k = i; } });
      if (k !== atual) { try { video(k).currentTime = 0; } catch (e) {} atual = k; }
      marcarPontos();
      tocar();
    }
    car.addEventListener('scroll', function () { clearTimeout(car._t); car._t = setTimeout(marcar, 80); }, { passive: true });
    ['pointerdown', 'touchstart', 'wheel'].forEach(function (ev) { car.addEventListener(ev, function () { pausa = Date.now() + 8000; }, { passive: true }); });
    if (pts) pts.addEventListener('click', function (ev) { var b = ev.target.closest('[data-ir]'); if (b) { pausa = Date.now() + 8000; irPara(+b.dataset.ir); } });
    /* se o celular bloquear o vídeo automático (ex.: modo de economia de bateria), o carrossel passa sozinho a cada 3,5 s */
    var iv = setInterval(function () { if (!semAutoplay || !naTela || Date.now() < pausa || document.querySelector('.vmodal') || slides.length < 2) return; irPara(atual + 1); }, 3500);
    var obs = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { naTela = es[0].isIntersecting; tocar(); }, { threshold: .5 }) : null;
    if (obs) obs.observe(car); else { naTela = true; tocar(); }
    document.addEventListener('vmodal-fechou', tocar);
    document.addEventListener('visibilitychange', tocar);
    return function () {
      clearInterval(iv); if (obs) obs.disconnect();
      document.removeEventListener('vmodal-fechou', tocar); document.removeEventListener('visibilitychange', tocar);
      slides.forEach(function (sl, i) { try { video(i).pause(); } catch (e) {} });
    };
  }
  function bonusPorId(id) { for (var i = 0; i < BONUS.length; i++) if (BONUS[i].id === id) return BONUS[i]; return null; }
  function totalBonus() { return BONUS.reduce(function (t, b) { return t + (b.valor || 0); }, 0); }

  /* Brasão da garantia: roseta dourada, louros, "7 DIAS" e faixa "GARANTIA" (SVG gerado aqui) */
  function brasaoSVG() {
    var cx = 100, cy = 98, i, a, pts = [], folhas = '';
    for (i = 0; i < 72; i++) { a = Math.PI * 2 * i / 72; var rr = i % 2 ? 88 : 95; pts.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1)); }
    [1, -1].forEach(function (lado) {
      for (i = 0; i < 9; i++) {
        var th = (122 + i * 13) * Math.PI / 180, deg = th * 180 / Math.PI + 90;
        [[64, -32], [56, 32]].forEach(function (f) {
          var x = cx + f[0] * Math.cos(th), y = cy + f[0] * Math.sin(th), rot = deg + f[1];
          if (lado < 0) { x = 2 * cx - x; rot = 180 - rot; }
          folhas += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="7" ry="2.8" transform="rotate(' + rot.toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
        });
      }
    });
    function estrela(x, y, r) {
      var p = [];
      for (var k = 0; k < 10; k++) { var an = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .45 : r; p.push((x + rr * Math.cos(an)).toFixed(1) + ',' + (y + rr * Math.sin(an)).toFixed(1)); }
      return '<polygon points="' + p.join(' ') + '"/>';
    }
    return '<svg class="brasao" viewBox="0 0 200 200" role="img" aria-label="Garantia de 7 dias">' +
      '<defs><linearGradient id="bOuro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1dca6"/><stop offset=".5" stop-color="#c5a059"/><stop offset="1" stop-color="#9c7a34"/></linearGradient>' +
      '<radialGradient id="bFundo" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#2c5446"/><stop offset="1" stop-color="#173027"/></radialGradient></defs>' +
      '<polygon points="' + pts.join(' ') + '" fill="url(#bOuro)"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="82" fill="url(#bFundo)" stroke="#f1dca6" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="75" fill="none" stroke="url(#bOuro)" stroke-width="1" stroke-dasharray="2 3"/>' +
      '<g fill="url(#bOuro)">' + folhas + estrela(84, 52, 5) + estrela(100, 47, 6.5) + estrela(116, 52, 5) + '</g>' +
      '<text x="100" y="122" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-weight="700" font-size="76" fill="url(#bOuro)">7</text>' +
      '<text x="100" y="140" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="700" font-size="12" letter-spacing="5" fill="#f1dca6">DIAS</text>' +
      '<path d="M8 150 L30 150 L30 182 L8 182 L18 166 Z M192 150 L170 150 L170 182 L192 182 L182 166 Z" fill="#9c7a34"/>' +
      '<path d="M24 146 H176 V176 H24 Z" fill="url(#bOuro)"/>' +
      '<text x="100" y="166" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="800" font-size="13" letter-spacing="4" fill="#173027">GARANTIA</text>' +
      '</svg>';
  }

  function aulaInicio() { return 1; } /* "Comece por aqui" sempre no Módulo 1 (pedido da Mayara, 09/10/2026) */
  function secProduto(r) {
    var comeco = aulaInicio(), paraVoce = PILARES[r.atencao].aula, ini = comeco - 1;
    var h = '<section class="sec produto"><p class="selo">As aulas</p><h2 class="tit-sec">' + PRODUTO.nome + '</h2>';
    h += '<p class="lead">' + PRODUTO.lead + '</p>';
    h += '<div class="aulas-circ">';
    AULAS.forEach(function (a, k) {
      var tag = a.n === comeco ? 'Comece aqui' : a.n === paraVoce ? 'Para você' : '';
      var curto = a.curto || a.tit;
      h += '<button type="button" class="aula-circ' + (a.n === comeco ? ' meu' : '') + '" data-aula="' + k + '" aria-pressed="' + (k === ini) + '" style="--cor:' + a.cor + '">' +
        '<span class="circ"><i class="circ-grande">' + icone(a.ic) + '</i></span>' +
        '<b>Módulo ' + a.n + '</b><small' + (curto.length > 14 ? ' class="longo"' : '') + '>' + curto + '</small>' +
        (tag ? '<em class="circ-tag">' + tag + '</em>' : '') + '</button>';
    });
    h += '</div><p class="aulas-dica">Toque em um módulo para ver o que ele ensina.</p>';
    h += '<div class="aula-desc" id="aula-desc" aria-live="polite">' + descAula(ini) + '</div>';
    h += '</section>';
    return h;
  }
  function descAula(k) {
    var a = AULAS[k], r = R || calcular(), comeco = aulaInicio(), paraVoce = PILARES[r.atencao].aula;
    var tag = a.n === comeco ? '<span class="tag">Comece por aqui</span>' : a.n === paraVoce ? '<span class="tag tag-sutil">Para você</span>' : '';
    return '<div class="aula-desc-in" style="--cor:' + a.cor + '"><div class="aula-desc-top"><b>' + icone(a.ic) + 'Módulo ' + a.n + ' · ' + a.tit + '</b>' + tag + '</div><p>' + a.txt + '</p>' +
      (a.aulas ? '<ol class="aula-lista" start="' + numAula(k) + '">' + a.aulas.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>' : '') + '</div>';
  }
  /* número da primeira aula do módulo k (as aulas são numeradas de 1 a 14 no curso todo) */
  function numAula(k) {
    var n = 1;
    for (var i = 0; i < k; i++) n += (AULAS[i].aulas || []).length;
    return n;
  }

  function secBonus() {
    var h = '<section class="sec bonus"><h2 class="tit-sec">E você ainda recebe ' + BONUS.length + ' bônus</h2><div class="bonus-lista">';
    BONUS.forEach(function (b) {
      h += '<article class="bonus-item" style="--cor:' + b.cor + '"><span class="bonus-e">' + icone(b.ic) + '</span><div><h3>' + b.tit + '</h3><p>' + fill(b.txt) + '</p>' +
        (b.valor ? '<p class="bonus-preco"><s>' + reais(b.valor) + '</s><b>incluso</b></p>' : '<p class="bonus-preco"><b>incluso</b></p>') + '</div></article>';
    });
    return h + '</div></section>';
  }

  function botaoCheckout(id, txt) {
    return '<button type="button" class="btn btn-cta" data-checkout="' + id + '">' + fill(txt || 'Quero ser uma “Organizada”') + '</button>';
  }

  function rodape() {
    var partes = [];
    if (C.EMPRESA_RAZAO) partes.push(esc(C.EMPRESA_RAZAO));
    if (C.EMPRESA_CNPJ) partes.push('CNPJ ' + esc(C.EMPRESA_CNPJ));
    if (C.POLITICA_URL) partes.push('<a href="' + esc(C.POLITICA_URL) + '" target="_blank" rel="noopener">Política de privacidade</a>');
    if (C.TERMOS_URL) partes.push('<a href="' + esc(C.TERMOS_URL) + '" target="_blank" rel="noopener">Termos de uso</a>');
    if (!partes.length && PH) partes.push('<span class="falta">[Rodapé: razão social, CNPJ, política e termos → config.js]</span>');
    return '<footer class="rodape"><p class="aviso-legal">Os resultados dependem da prática e da dedicação de cada pessoa, e da região onde ela trabalha. A conta do valor do dia é uma simulação, não uma garantia de ganho.</p>' +
      partes.join(' · ') + '<p>© ' + new Date().getFullYear() + ' Paty Domingos · Método Organizadas</p></footer>';
  }

  function urlCheckout(origem) {
    if (!C.CHECKOUT_URL) return '';
    try {
      var u = new URL(C.CHECKOUT_URL);
      Object.keys(S.utms || {}).forEach(function (k) { if (!u.searchParams.has(k)) u.searchParams.set(k, S.utms[k]); });
      u.searchParams.set('src', 'quiz-personal-organizer');
      if (R) u.searchParams.set('sck', R.perfil + '-' + R.atencao + '-' + origem);
      if (S.lead) {
        if (S.lead.nome && !u.searchParams.has('name')) u.searchParams.set('name', S.lead.nome);
        if (S.lead.email && !u.searchParams.has('email')) u.searchParams.set('email', S.lead.email);
      }
      return u.toString();
    } catch (e) { return C.CHECKOUT_URL; }
  }

  /* ------------------------------ EVENTOS DAS TELAS ------------------------------ */
  function ligar(t) {
    var seg = document.getElementById('segue');

    if (t.t === 'capa' || t.t === 'q' || t.t === 'e') {
      $app.querySelectorAll('[data-i]').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.dataset.i;
          A[t.id] = { idx: [i] };
          $app.querySelectorAll('[data-i]').forEach(function (x) {
            var on = x === b;
            x.classList.toggle('on', on);
            if (x.hasAttribute('aria-checked')) x.setAttribute('aria-checked', on);
            if (x.hasAttribute('aria-pressed')) x.setAttribute('aria-pressed', on);
          });
          salvar();
          track('resposta', { tela: t.id, opcao: i });
          setTimeout(avancar, 300);
        });
      });
    }

    if (t.t === 'm') {
      var ex = -1;
      t.o.forEach(function (o, i) { if (o.excl) ex = i; });
      $app.querySelectorAll('[data-i]').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.dataset.i, atual = sel(A, t.id).slice();
          if (i === ex) atual = atual.indexOf(i) >= 0 ? [] : [i];
          else {
            atual = atual.filter(function (k) { return k !== ex; });
            var p = atual.indexOf(i);
            if (p >= 0) atual.splice(p, 1); else atual.push(i);
          }
          atual.sort(function (a, b) { return a - b; });
          A[t.id] = { idx: atual };
          if (!atual.length) delete A[t.id];
          $app.querySelectorAll('[data-i]').forEach(function (x) {
            var on = atual.indexOf(+x.dataset.i) >= 0;
            x.classList.toggle('on', on); x.setAttribute('aria-pressed', on);
          });
          seg.disabled = !atual.length;
          salvar();
        });
      });
      seg.addEventListener('click', function () { if (sel(A, t.id).length) { track('resposta', { tela: t.id, opcao: sel(A, t.id).join(',') }); avancar(); } });
    }

    if (t.t === 'ins' || t.t === 'antesdepois' || t.t === 'prova') {
      if (seg) seg.addEventListener('click', avancar);
    }
    /* Inserção com depoimento: tocar no aviso "Na próxima tela" também avança, e o vídeo já começa a baixar
       para tocar sozinho assim que a próxima tela abrir */
    if (t.t === 'ins' && t.depo) {
      var tz = $app.querySelector('.teaser'), dp = depoPorId(t.depo);
      if (tz) tz.addEventListener('click', avancar);
      if (dp && !document.querySelector('link[data-pre="' + dp.id + '"]')) {
        var lk = document.createElement('link');
        lk.rel = 'prefetch'; lk.as = 'video'; lk.href = 'assets/video/' + dp.video; lk.setAttribute('data-pre', dp.id);
        document.head.appendChild(lk);
      }
    }
    if (t.t === 'prova') {
      var pararProva = ligarCarrossel(document.getElementById('car-prova'));
      limpeza = pararProva;
    }

    if (t.t === 'video') ligarVideo(t);

    if (t.t === 'diag') {
      var rr = calcular();
      track('diagnostico_visto', { perfil: rr.perfil, pilar: rr.atencao });
      document.getElementById('segue').addEventListener('click', avancar);
      if (!S.diagVisto) {
        var nomes = ['TÉCNICA', 'MENTALIDADE', 'EXECUÇÃO', 'a conta do seu dia'], k = 0;
        var $c = document.getElementById('diag-cod');
        var iv = setInterval(function () { k = Math.min(k + 1, nomes.length - 1); $c.textContent = nomes[k]; }, 700);
        var to = setTimeout(function () {
          clearInterval(iv);
          S.diagVisto = true; salvar();
          document.getElementById('diag-load').hidden = true;
          var d = document.getElementById('diag'); d.hidden = false;
          var f = d.querySelector('[data-foco]'); if (f) f.focus({ preventScroll: true });
        }, 3000);
        limpeza = function () { clearInterval(iv); clearTimeout(to); };
      }
    }

    if (t.t === 'captura') ligarCaptura(t);

    if (t.t === 'resultado') ligarResultado();
  }

  /* Vídeo do depoimento: começa sem som e com legenda; "Toque para ouvir" liga o som e recomeça */
  function ligarVideo(t) {
    var seg = document.getElementById('segue');
    if (seg) seg.addEventListener('click', avancar);
    var v = document.getElementById('vid');
    if (!v) return;
    var $som = document.getElementById('pl-som'), $pl = document.getElementById('player'), completo = false;
    ligarLegendas(v, t.depo, document.getElementById('pl-leg'), document.getElementById('pl-prog'));
    v.muted = true;
    /* Sem botão de play: se o celular bloquear o vídeo automático (ex.: economia de bateria),
       o "Toque para ouvir" continua na tela e começa o vídeo com som */
    function tocar() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    tocar();
    /* se a aba estava em segundo plano, tenta de novo quando ela voltar */
    function aoVoltar() { if (!document.hidden && v.paused && !v.ended && v.currentTime === 0) tocar(); }
    document.addEventListener('visibilitychange', aoVoltar);
    v.addEventListener('ended', function () {
      if (!completo) { completo = true; track('video_completo', { video: t.depo }); }
    });
    $som.addEventListener('click', function (ev) {
      ev.stopPropagation();
      v.muted = false; v.currentTime = 0; tocar();
      $som.hidden = true;
      track('video_som', { video: t.depo });
    });
    $pl.addEventListener('click', function () {
      if (!$som.hidden) { $som.click(); return; }
      if (v.paused) tocar(); else v.pause();
    });
    track('video_visto', { video: t.depo });
    limpeza = function () { try { v.pause(); } catch (e) {} document.removeEventListener('visibilitychange', aoVoltar); };
  }

  /* Captura: 13 s fixos, não lineares, com o formulário liberado o tempo todo */
  function ligarCaptura(t) {
    var KF = [[0, 0], [1200, 14], [2000, 14], [4400, 36], [5200, 36], [8400, 66], [9200, 66], [11600, 88], [12300, 88], [13000, 100]];
    var t0 = performance.now(), pronto = false, raf;
    var $txt = document.getElementById('proc-txt'), $pct = document.getElementById('proc-pct'), $b = document.getElementById('proc-bar');
    var $form = document.getElementById('form'), $env = document.getElementById('enviar');
    function ease(x) { return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
    function pct(ms) {
      for (var i = 0; i < KF.length - 1; i++) {
        if (ms <= KF[i + 1][0]) { var a = KF[i], b = KF[i + 1]; return a[1] + (b[1] - a[1]) * ease((ms - a[0]) / (b[0] - a[0])); }
      }
      return 100;
    }
    function passo(p) { var l = t.passos[0][1]; t.passos.forEach(function (s) { if (p >= s[0]) l = s[1]; }); return fill(l); }
    /* Relógio por setInterval (e não requestAnimationFrame): continua contando mesmo se a aba ficar em segundo plano */
    function quadro() {
      var p = Math.floor(pct(performance.now() - t0));
      $b.style.width = p + '%'; $pct.textContent = p + '%'; $txt.textContent = passo(p);
      if (p >= 100) { clearInterval(raf); pronto = true; document.querySelector('.proc').classList.add('ok'); atualizar(); }
    }
    raf = setInterval(quadro, 60);
    quadro();
    limpeza = function () { clearInterval(raf); };

    var $nome = $form.querySelector('[name=nome]'), $email = $form.querySelector('[name=email]'), $tel = $form.querySelector('[name=whatsapp]'),
      $pais = document.getElementById('pais'), $sug = document.getElementById('sugestao-email'), $dom = document.getElementById('dominios'),
      $conf = document.getElementById('confirma-whats');
    function pais() { return $pais.value; }
    function valores() {
      return { nome: ($nome.value || '').trim(), email: ($email.value || '').trim(), whatsapp: $tel.value || '', pais: pais() };
    }
    function erros(v) {
      var e = {};
      if (v.nome.replace(/[^A-Za-zÀ-ÿ]/g, '').length < 2) e.nome = 'Como posso chamar você?';
      var em = VALIDA.email(v.email);
      if (em.erro) e.email = em.erro;
      var wa = VALIDA.whatsappPais(v.whatsapp, v.pais);
      if (wa.erro) e.whatsapp = wa.erro;
      /* sugestão de correção do domínio (ex.: gmial.com → gmail.com) */
      if (em.sugestao) { $sug.hidden = false; $sug.textContent = 'Você quis dizer ' + em.sugestao + '? Toque para corrigir'; $sug.dataset.valor = em.sugestao; }
      else { $sug.hidden = true; }
      /* confirmação do número formatado, para a pessoa conferir */
      if (wa.ok) { $conf.hidden = false; $conf.innerHTML = icone('check') + 'Vamos falar com você em <b>' + esc(wa.exibir) + '</b>'; }
      else { $conf.hidden = true; }
      $tel.classList.toggle('ok', !!wa.ok); $email.classList.toggle('ok', !!em.ok); $nome.classList.toggle('ok', !e.nome);
      return e;
    }
    /* Máscaras: nome sem números; e-mail sem espaço, sem acento e em minúsculas; WhatsApp no formato do país */
    $nome.addEventListener('input', function () {
      var limpo = $nome.value.replace(/[^A-Za-zÀ-ÿ' -]/g, '').replace(/\s{2,}/g, ' ');
      if (limpo !== $nome.value) $nome.value = limpo;
    });
    $nome.addEventListener('blur', function () {
      var p = $nome.value.trim().split(/\s+/)[0] || '';
      $nome.value = p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : '';
    });
    $email.addEventListener('input', function () {
      var pos = $email.selectionStart, antes = $email.value;
      var limpo = VALIDA.limparEmail(antes);
      if (limpo !== antes) { $email.value = limpo; try { $email.setSelectionRange(pos - (antes.length - limpo.length), pos - (antes.length - limpo.length)); } catch (e) {} }
      mostrarDominios();
    });
    function mostrarDominios() {
      var lista = VALIDA.dominiosSugeridos($email.value, foraBrasil(A));
      if (!lista.length) { $dom.hidden = true; $dom.innerHTML = ''; return; }
      $dom.hidden = false;
      $dom.innerHTML = lista.map(function (d) { return '<button type="button" data-dom="' + esc(d) + '">@' + esc(d) + '</button>'; }).join('');
    }
    $dom.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-dom]');
      if (!b) return;
      $email.value = $email.value.split('@')[0] + '@' + b.dataset.dom;
      tocados.email = true; $dom.hidden = true;
      $email.dispatchEvent(new Event('input', { bubbles: true }));
      $email.focus();
    });
    $sug.addEventListener('click', function () {
      $email.value = $sug.dataset.valor; tocados.email = true;
      $email.dispatchEvent(new Event('input', { bubbles: true }));
    });
    $tel.addEventListener('input', function () { $tel.value = VALIDA.mascaraPais($tel.value, pais()); });
    $pais.addEventListener('change', function () {
      $tel.placeholder = VALIDA.exemplo(pais());
      $tel.value = VALIDA.mascaraPais($tel.value, pais());
      $tel.dispatchEvent(new Event('input', { bubbles: true }));
    });
    function atualizar() { $env.disabled = !(pronto && !Object.keys(erros(valores())).length); }
    var tocados = {};
    $form.addEventListener('input', function (ev) {
      if (ev.target.name) tocados[ev.target.name] = true;
      var e = erros(valores());
      ['nome', 'email', 'whatsapp'].forEach(function (k) { document.getElementById('erro-' + k).textContent = tocados[k] && e[k] ? e[k] : ''; });
      atualizar();
    });
    $form.addEventListener('focusout', function (ev) {
      if (!ev.target.name || ev.target.name === 'pais') return;
      tocados[ev.target.name] = true;
      var e = erros(valores());
      document.getElementById('erro-' + ev.target.name).textContent = e[ev.target.name] || '';
      if (ev.target === $email) setTimeout(function () { if (document.activeElement && !$dom.contains(document.activeElement)) $dom.hidden = true; }, 150);
    });
    var primeiro = true;
    $form.addEventListener('focusin', function () { if (primeiro) { primeiro = false; track('form_inicio'); } });
    $form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = valores(), e = erros(v);
      ['nome', 'email', 'whatsapp'].forEach(function (k) { document.getElementById('erro-' + k).textContent = e[k] || ''; });
      if (Object.keys(e).length || !pronto) return;
      var nome = v.nome.split(/\s+/)[0];
      var wa = VALIDA.whatsappPais(v.whatsapp, v.pais);
      S.lead = { nome: nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase(), email: VALIDA.email(v.email).ok,
                 whatsapp: wa.ok, whatsappDigitado: v.whatsapp, pais: v.pais, capturado_em: new Date().toISOString() };
      salvar();
      calcular();
      track('lead', { perfil: R.perfil, pilar: R.atencao });
      fbq('track', 'Lead', { content_name: 'Teste da Personal Organizer' });
      enviarLead();
      avancar();
    });
    erros(valores());
    atualizar();
  }

  function ligarResultado() {
    track('resultado_visto', { perfil: R.perfil, pilar: R.atencao });
    if (S.leadPendente) enviarLead();
    requestAnimationFrame(function () {
      $app.querySelectorAll('.trilho i').forEach(function (i) { i.style.width = i.dataset.w + '%'; });
    });
    $app.querySelectorAll('[data-checkout]').forEach(function (b) {
      b.addEventListener('click', function () { irCheckout(b.dataset.checkout); });
    });
    /* CTA fixo: sempre visível na página de vendas */
    $ctaFixo.innerHTML = '<div class="cta-in">' + botaoCheckout('cta-fixo') + '</div>';
    $ctaFixo.querySelector('[data-checkout]').addEventListener('click', function () { irCheckout('cta-fixo'); });
    $ctaFixo.hidden = false;
    $app.querySelectorAll('[data-aula]').forEach(function (b) {
      b.addEventListener('click', function () {
        $app.querySelectorAll('[data-aula]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        document.getElementById('aula-desc').innerHTML = descAula(+b.dataset.aula);
        track('aula_vista', { aula: +b.dataset.aula + 1 });
      });
    });
    var pararCarrossel = ligarCarrossel(document.getElementById('car-vendas'));
    limpeza = function () { $ctaFixo.hidden = true; pararCarrossel(); };
  }

  function irCheckout(origem) {
    track('checkout_click', { origem: origem, perfil: R && R.perfil });
    var preco = parseFloat(String(C.PRECO || '').replace(/[^\d,]/g, '').replace(',', '.')) || undefined;
    fbq('track', 'InitiateCheckout', { value: preco, currency: 'BRL', content_name: 'Primeiros Passos da Personal Organizer' });
    var u = urlCheckout(origem);
    if (u) { window.location.href = u; return; }
    aviso('Checkout ainda não configurado (config.js → CHECKOUT_URL).');
  }

  function aviso(msg) {
    var d = document.createElement('div');
    d.className = 'aviso'; d.setAttribute('role', 'alert'); d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 3500);
  }

  /* ------------------------------ QA ------------------------------ */
  function painelQA() {
    var r = calcular();
    var p = document.getElementById('qa') || document.body.appendChild(Object.assign(document.createElement('pre'), { id: 'qa' }));
    p.textContent = 'tela: ' + TELAS[S.pos].id + '\n' + ORDEM_PILARES.map(function (c) { return PILARES[c].nome + ': ' + r.scores[c]; }).join('\n') +
      '\natenção: ' + r.atencao + ' · forte: ' + r.forte + '\nperfil: ' + r.perfil +
      (r.conta ? '\nconta: ' + r.conta.meta + ' / ' + r.conta.dias + 'd = ' + r.conta.valor + ' (' + r.conta.faixa + ')' : '') +
      '\nlead: ' + leadScore().score + ' ' + leadScore().grade;
  }
  window.__quiz = { estado: function () { return S; }, calcular: calcular, payload: payload, ir: function (id) { var i = idxDe(id); if (i >= 0) { S.pos = i; desenhar(); } } };

  /* ------------------------------ INÍCIO ------------------------------ */
  var pular = params.get('tela');
  if (pular && idxDe(pular) >= 0) S.pos = idxDe(pular);
  if (TELAS[S.pos] && TELAS[S.pos].t === 'resultado' && !S.lead) S.pos = idxDe('CAPTURA');
  if (!TELAS[S.pos] || !visivel(TELAS[S.pos])) S.pos = 0;
  desenhar();
})();
