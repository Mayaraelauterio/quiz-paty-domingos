/* ==========================================================================
   Validação de e-mail e WhatsApp da captura
   - Barra formatos inválidos, números e e-mails de teste e e-mails descartáveis.
   - Sugere correção para erros de digitação no domínio (ex.: gmial.com → gmail.com).
   Limite: no navegador não dá para confirmar que o e-mail ou o WhatsApp existem de fato.
   Para isso, ver "Verificação real" no LEIA-ME (código de confirmação ou serviço de verificação).
   ========================================================================== */
window.VALIDA = (function () {
  'use strict';

  /* DDDs válidos no Brasil (Anatel) */
  var DDDS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69,
    71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99];

  /* Provedores de e-mail temporário/descartável */
  var DESCARTAVEIS = ['mailinator.com', 'yopmail.com', '10minutemail.com', 'guerrillamail.com', 'guerrillamail.net',
    'sharklasers.com', 'tempmail.com', 'temp-mail.org', 'tempmail.net', 'tempail.com', 'tempmailo.com', 'mytemp.email',
    'trashmail.com', 'getnada.com', 'dispostable.com', 'maildrop.cc', 'mohmal.com', 'throwawaymail.com', 'fakeinbox.com',
    'emailondeck.com', 'mintemail.com', 'burnermail.io', 'moakt.com', 'inboxkitten.com', 'mailnesia.com',
    'spamgourmet.com', '1secmail.com', 'emailfake.com', 'fakemail.net', 'mailcatch.com', 'discard.email'];

  /* Domínios e nomes que indicam e-mail de teste */
  var DOMINIOS_TESTE = ['exemplo.com', 'exemplo.com.br', 'example.com', 'example.org', 'teste.com', 'teste.com.br',
    'test.com', 'testes.com', 'email.teste', 'fake.com', 'asdf.com', 'aaa.com', 'abc.com', 'xxx.com', 'qwerty.com'];
  var NOMES_TESTE = ['teste', 'testes', 'test', 'testando', 'asdf', 'qwerty', 'abc', 'abcd', 'aaa', 'aaaa', 'xxx',
    'xxxx', 'nada', 'nenhum', 'naotenho', 'sememail', 'fake', 'fulano', 'ciclano', 'beltrano', 'exemplo', 'seuemail',
    'meuemail', 'email', 'nome', 'usuario', 'user', 'a', 'x'];

  /* Domínios mais usados no Brasil, para sugerir correção de digitação */
  var COMUNS = ['gmail.com', 'hotmail.com', 'outlook.com', 'outlook.com.br', 'yahoo.com', 'yahoo.com.br', 'icloud.com',
    'live.com', 'msn.com', 'uol.com.br', 'bol.com.br', 'terra.com.br', 'hotmail.com.br', 'globo.com', 'ig.com.br'];
  var FIXOS = { 'gmail.com.br': 'gmail.com', 'gmail.co': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com',
    'hotmail.co': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'outlok.com': 'outlook.com' };

  function distancia(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 1; j <= n; j++) { d[0][j] = j; }
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    return d[m][n];
  }

  function sugerirDominio(dom) {
    if (COMUNS.indexOf(dom) >= 0) return null;
    if (FIXOS[dom]) return FIXOS[dom];
    var melhor = null, menor = 3;
    COMUNS.forEach(function (c) { var x = distancia(dom, c); if (x < menor) { menor = x; melhor = c; } });
    return menor <= 2 ? melhor : null;
  }

  function email(valor) {
    var v = String(valor || '').trim().toLowerCase();
    if (!v) return { erro: 'Digite o seu e-mail.' };
    var ok = /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(v);
    if (!ok || v.indexOf('..') >= 0) return { erro: 'Confira o e-mail. Parece que falta alguma coisa.' };
    var partes = v.split('@'), nome = partes[0], dom = partes[1];
    if (DESCARTAVEIS.indexOf(dom) >= 0) return { erro: 'Use um e-mail pessoal. E-mails temporários não recebem o seu plano.' };
    if (DOMINIOS_TESTE.indexOf(dom) >= 0 || NOMES_TESTE.indexOf(nome) >= 0 || /^(.)\1{3,}$/.test(nome) || /^\d{1,6}$/.test(nome)) {
      return { erro: 'Esse e-mail parece de teste. Use o seu e-mail de verdade: é por ele que você recebe o seu plano.' };
    }
    var sug = sugerirDominio(dom);
    if (sug) return { erro: 'Confira o final do e-mail.', sugestao: nome + '@' + sug };
    return { ok: v };
  }

  function soDigitos(valor) {
    var d = String(valor || '').replace(/\D/g, '');
    if (/^55\d{11}$/.test(d)) d = d.slice(2);
    if (/^0\d{11}$/.test(d)) d = d.slice(1);
    return d;
  }

  function sequencia(s, n) {
    var sobe = 1, desce = 1;
    for (var i = 1; i < s.length; i++) {
      var dif = s.charCodeAt(i) - s.charCodeAt(i - 1);
      sobe = dif === 1 ? sobe + 1 : 1;
      desce = dif === -1 ? desce + 1 : 1;
      if (sobe >= n || desce >= n) return true;
    }
    return false;
  }

  function whatsapp(valor) {
    var d = soDigitos(valor);
    if (!d) return { erro: 'Digite o seu WhatsApp com DDD.' };
    if (d.length < 11) {
      if (d.length === 10 && d[2] !== '9') return { erro: 'Esse parece um número fixo. Use o seu WhatsApp (celular com 9 dígitos).' };
      return { erro: 'Faltam números. O WhatsApp tem DDD + 9 dígitos.' };
    }
    if (d.length > 11) return { erro: 'Sobraram números. O WhatsApp tem DDD + 9 dígitos.' };
    if (DDDS.indexOf(+d.slice(0, 2)) < 0) return { erro: 'Esse DDD não existe. Confira os dois primeiros números.' };
    if (d[2] !== '9') return { erro: 'Celulares começam com 9 depois do DDD. Confira o número.' };
    var assinante = d.slice(3); /* 8 dígitos depois do 9 */
    var freq = {}, maior = 0;
    for (var i = 0; i < assinante.length; i++) { freq[assinante[i]] = (freq[assinante[i]] || 0) + 1; maior = Math.max(maior, freq[assinante[i]]); }
    if (maior >= 7 || sequencia(d.slice(2), 7)) {
      return { erro: 'Esse número parece de teste. Use o seu WhatsApp de verdade: é por ele que você recebe o seu plano.' };
    }
    return { ok: '55' + d };
  }

  /* Máscara (62) 99999-9999 enquanto a pessoa digita */
  function mascara(valor) {
    var d = String(valor || '').replace(/\D/g, '');
    if (/^55\d{11,}$/.test(d)) d = d.slice(2);
    d = d.slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 7) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  /* ---------- Máscara do e-mail: sem espaço, sem acento, em minúsculas ---------- */
  function limparEmail(valor) {
    var v = String(valor || '');
    if (v.normalize) v = v.normalize('NFD').replace(/[̀-ͯ]/g, '');
    v = v.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9@._%+-]/g, '');
    var i = v.indexOf('@');
    if (i >= 0) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/@/g, ''); /* só um @ */
    return v;
  }
  /* Botões de domínio que aparecem depois do @ (ex.: maria@ → @gmail.com, @hotmail.com…) */
  var DOM_BR = ['gmail.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'yahoo.com.br'];
  var DOM_FORA = ['gmail.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'yahoo.com'];
  function dominiosSugeridos(valor, fora) {
    var v = String(valor || ''), i = v.indexOf('@');
    if (i < 1) return [];
    var depois = v.slice(i + 1);
    if (depois.indexOf('.') >= 0 && (DOM_BR.concat(DOM_FORA).indexOf(depois) >= 0 || /\.[a-z]{2,}$/.test(depois))) return [];
    return (fora ? DOM_FORA : DOM_BR).filter(function (d) { return d.indexOf(depois) === 0; }).slice(0, 5);
  }

  /* ---------- WhatsApp com país ----------
     nac: dígitos do número nacional (sem o código do país e sem o 0 de tronco)
     ini: com o que o celular começa · fmt: máscara (# = dígito) · ex: exemplo para o campo */
  var PAISES = [
    { id: 'BR', nome: 'Brasil', bandeira: '🇧🇷', ddi: '55' },
    { id: 'US', nome: 'Estados Unidos', bandeira: '🇺🇸', ddi: '1', nac: [10], ini: /^[2-9]/, fmt: '(###) ###-####', ex: '(407) 555-0123' },
    { id: 'PT', nome: 'Portugal', bandeira: '🇵🇹', ddi: '351', nac: [9], ini: /^9/, fmt: '### ### ###', ex: '912 345 678' },
    { id: 'ES', nome: 'Espanha', bandeira: '🇪🇸', ddi: '34', nac: [9], ini: /^[67]/, fmt: '### ## ## ##', ex: '612 34 56 78' },
    { id: 'CH', nome: 'Suíça', bandeira: '🇨🇭', ddi: '41', nac: [9], ini: /^7/, tronco: true, fmt: '## ### ## ##', ex: '79 123 45 67' },
    { id: 'IT', nome: 'Itália', bandeira: '🇮🇹', ddi: '39', nac: [9, 10], ini: /^3/, fmt: '### ### ####', ex: '312 345 6789' },
    { id: 'GB', nome: 'Reino Unido', bandeira: '🇬🇧', ddi: '44', nac: [10], ini: /^7/, tronco: true, fmt: '#### ######', ex: '7400 123456' },
    { id: 'IE', nome: 'Irlanda', bandeira: '🇮🇪', ddi: '353', nac: [9], ini: /^8/, tronco: true, fmt: '## ### ####', ex: '85 123 4567' },
    { id: 'FR', nome: 'França', bandeira: '🇫🇷', ddi: '33', nac: [9], ini: /^[67]/, tronco: true, fmt: '# ## ## ## ##', ex: '6 12 34 56 78' },
    { id: 'DE', nome: 'Alemanha', bandeira: '🇩🇪', ddi: '49', nac: [10, 11], ini: /^1[5-7]/, tronco: true, fmt: '#### #######', ex: '1512 3456789' },
    { id: 'JP', nome: 'Japão', bandeira: '🇯🇵', ddi: '81', nac: [10], ini: /^[789]0/, tronco: true, fmt: '## #### ####', ex: '90 1234 5678' },
    { id: 'AU', nome: 'Austrália', bandeira: '🇦🇺', ddi: '61', nac: [9], ini: /^4/, tronco: true, fmt: '### ### ###', ex: '412 345 678' },
    { id: 'CA', nome: 'Canadá', bandeira: '🇨🇦', ddi: '1', nac: [10], ini: /^[2-9]/, fmt: '(###) ###-####', ex: '(416) 555-0123' },
    { id: 'XX', nome: 'Outro país', bandeira: '🌍', ddi: '', fmt: '', ex: '+00 000 000 000' }
  ];
  function paisPorId(id) { for (var i = 0; i < PAISES.length; i++) if (PAISES[i].id === id) return PAISES[i]; return PAISES[0]; }
  function exemplo(id) { return id === 'BR' ? '(17) 99999-9999' : paisPorId(id).ex; }
  function aplicarFmt(d, fmt) {
    var out = '', k = 0;
    for (var i = 0; i < fmt.length && k < d.length; i++) out += fmt[i] === '#' ? d[k++] : fmt[i];
    return out + d.slice(k);
  }
  function nacional(valor, p) {
    var d = String(valor || '').replace(/\D/g, '');
    if (p.ddi && d.indexOf(p.ddi) === 0 && d.length > Math.max.apply(null, p.nac)) d = d.slice(p.ddi.length);
    if (d.indexOf('00' + p.ddi) === 0) d = d.slice(2 + p.ddi.length);
    if (p.tronco && d[0] === '0') d = d.slice(1);
    return d.slice(0, Math.max.apply(null, p.nac));
  }
  function mascaraPais(valor, id) {
    if (!id || id === 'BR') return mascara(valor);
    var p = paisPorId(id);
    if (id === 'XX') {
      var t = String(valor || '').replace(/[^\d+ ]/g, '');
      return t ? (t[0] === '+' ? t : '+' + t).slice(0, 20) : '';
    }
    return aplicarFmt(nacional(valor, p), p.fmt);
  }
  function teste(d) {
    var freq = {}, maior = 0;
    for (var i = 0; i < d.length; i++) { freq[d[i]] = (freq[d[i]] || 0) + 1; maior = Math.max(maior, freq[d[i]]); }
    return maior >= d.length - 1 || sequencia(d, 7);
  }
  function whatsappPais(valor, id) {
    if (!id || id === 'BR') {
      var br = whatsapp(valor);
      if (br.ok) br.exibir = '+55 ' + mascara(br.ok.slice(2));
      return br;
    }
    var p = paisPorId(id);
    if (id === 'XX') {
      var d = String(valor || '').replace(/\D/g, '');
      if (!d) return { erro: 'Digite o seu WhatsApp com o código do país (ex.: +1, +351).' };
      if (d.length < 8 || d.length > 15) return { erro: 'Confira o número: com o código do país, ele tem de 8 a 15 dígitos.' };
      if (teste(d)) return { erro: 'Esse número parece de teste. Use o seu WhatsApp de verdade: é por ele que você recebe o seu plano.' };
      return { ok: d, exibir: '+' + d };
    }
    var n = nacional(valor, p);
    if (!n) return { erro: 'Digite o seu WhatsApp.' };
    var min = Math.min.apply(null, p.nac), max = Math.max.apply(null, p.nac);
    if (n.length < min) return { erro: 'Faltam números. O celular de ' + p.nome + ' tem ' + (min === max ? min : min + ' ou ' + max) + ' dígitos, sem o código do país.' };
    if (p.ini && !p.ini.test(n)) return { erro: 'Confira o número: esse não parece um celular de ' + p.nome + '.' };
    if (teste(n)) return { erro: 'Esse número parece de teste. Use o seu WhatsApp de verdade: é por ele que você recebe o seu plano.' };
    return { ok: p.ddi + n, exibir: '+' + p.ddi + ' ' + aplicarFmt(n, p.fmt) };
  }

  return { email: email, whatsapp: whatsapp, mascara: mascara, limparEmail: limparEmail, dominiosSugeridos: dominiosSugeridos,
           PAISES: PAISES, exemplo: exemplo, mascaraPais: mascaraPais, whatsappPais: whatsappPais };
})();
