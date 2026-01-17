(() => {
  let dados = JSON.parse(localStorage.getItem('compras')) || {};
  let produtos = JSON.parse(localStorage.getItem('produtos')) || {
    alimentos: ['Arroz', 'Feijão', 'Macarrão', 'Café'],
    higiene: ['Sabonete', 'Shampoo', 'Pasta de dente'],
    limpeza: ['Detergente', 'Sabão em pó', 'Desinfetante']
  };

  let categoriaAtual = 'alimentos';
  const data = new Date();
  let ano = data.getFullYear();
  let mes = data.getMonth();
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  const chaveMes = () => `${ano}-${String(mes + 1).padStart(2, '0')}`;

  const el = {
    mesAtual: document.getElementById('mesAtual'),
    prevMes: document.getElementById('prevMes'),
    nextMes: document.getElementById('nextMes'),
    tabs: document.querySelectorAll('.tab'),
    produtoSelect: document.getElementById('produtoSelect'),
    novoProduto: document.getElementById('novoProduto'),
    categoriaNovo: document.getElementById('categoriaNovo'),
    btnSalvarProduto: document.getElementById('btnSalvarProduto'),
    btnExcluirProduto: document.getElementById('btnExcluirProduto'),
    quantidade: document.getElementById('quantidade'),
    valor: document.getElementById('valor'),
    lista: document.getElementById('lista'),
    total: document.getElementById('total'),
    btnLimparMes: document.getElementById('btnLimparMes')
  };

  function salvar() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
    localStorage.setItem('compras', JSON.stringify(dados));
  }

  // Aceitar vírgula e impedir scroll
  el.valor.addEventListener("input", e => {
    e.target.value = e.target.value.replace(/[^\d,]/g, '').replace(/,,+/g, ',');
  });

  el.valor.addEventListener("wheel", e => e.preventDefault(), { passive: false });

  function atualizarMes() {
    el.mesAtual.textContent = `${meses[mes]} / ${ano}`;
    carregarLista();
  }

  function mudarMes(delta) {
    mes += delta;
    if (mes < 0) { mes = 11; ano--; }
    if (mes > 11) { mes = 0; ano++; }
    atualizarMes();
  }

  function carregarProdutos() {
    el.produtoSelect.innerHTML = '<option value="">Escolher produto</option>';
    produtos[categoriaAtual].forEach(nome => {
      const opt = document.createElement('option');
      opt.value = nome;
      opt.textContent = nome;
      el.produtoSelect.appendChild(opt);
    });
    carregarProdutosRapidos();
  }

  function carregarProdutosRapidos() {
    const container = document.getElementById('produtosRapidos');
    container.innerHTML = '';
    produtos[categoriaAtual].forEach(nome => {
      const btn = document.createElement('button');
      btn.className = 'produto-rapido';
      btn.textContent = nome;
      btn.onclick = () => {
        if (!dados[chaveMes()]) dados[chaveMes()] = [];
        dados[chaveMes()].push({ nome, qtd: 1, valor: 0, total: 0 });
        salvar();
        carregarLista();
      };
      container.appendChild(btn);
    });
  }

  function atualizarTotalGeral() {
    let soma = 0;
    const itens = dados[chaveMes()] || [];
    itens.forEach(i => soma += i.qtd * i.valor);
    el.total.textContent = soma.toFixed(2).replace('.', ',');
  }

  function carregarLista() {
    el.lista.innerHTML = '';
    const itens = dados[chaveMes()] || [];

    itens.forEach((item, i) => {
      const li = document.createElement('li');

      const inputQtd = document.createElement('input');
      inputQtd.type = 'number';
      inputQtd.min = 1;
      inputQtd.value = item.qtd;
      inputQtd.oninput = () => {
        item.qtd = parseInt(inputQtd.value) || 1;
        item.total = item.qtd * item.valor;
        salvar();
        atualizarTotalGeral();
        span.textContent = `${item.nome} - Total: R$ ${item.total.toFixed(2).replace('.', ',')}`;
      };

      const inputValor = document.createElement('input');
      inputValor.type = 'text';
      inputValor.inputMode = 'decimal';
      inputValor.value = item.valor.toString().replace('.', ',');
      inputValor.oninput = () => {
        let v = inputValor.value.replace(',', '.');
        item.valor = parseFloat(v) || 0;
        item.total = item.qtd * item.valor;
        salvar();
        atualizarTotalGeral();
        span.textContent = `${item.nome} - Total: R$ ${item.total.toFixed(2).replace('.', ',')}`;
      };

      const span = document.createElement('span');
      span.textContent = `${item.nome} - Total: R$ ${item.total.toFixed(2).replace('.', ',')}`;

      const btnExcluir = document.createElement('button');
      btnExcluir.className = 'excluir';
      btnExcluir.textContent = '❌';
      btnExcluir.onclick = () => {
        itens.splice(i, 1);
        salvar();
        carregarLista();
      };

      li.append(inputQtd, inputValor, span, btnExcluir);
      el.lista.appendChild(li);
    });

    atualizarTotalGeral();
  }

  document.getElementById('formAdicionar').onsubmit = e => {
    e.preventDefault();
    const nome = el.produtoSelect.value || el.novoProduto.value.trim();
    const qtd = parseInt(el.quantidade.value) || 1;
    const valor = parseFloat(el.valor.value.replace(',', '.')) || 0;

    if (!nome) return alert('Informe o produto.');

    if (!dados[chaveMes()]) dados[chaveMes()] = [];
    dados[chaveMes()].push({ nome, qtd, valor, total: qtd * valor });

    salvar();
    carregarLista();
    el.valor.value = '';
    el.novoProduto.value = '';
    el.produtoSelect.value = '';
  };

  el.btnLimparMes.onclick = () => {
    if (confirm('Limpar todas as compras deste mês?')) {
      delete dados[chaveMes()];
      salvar();
      carregarLista();
    }
  };

  el.prevMes.onclick = () => mudarMes(-1);
  el.nextMes.onclick = () => mudarMes(1);

  el.tabs.forEach(tab => {
    tab.onclick = () => {
      el.tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      categoriaAtual = tab.dataset.cat;
      carregarProdutos();
    };
  });

  el.btnSalvarProduto.onclick = () => {
    const nome = el.novoProduto.value.trim();
    const cat = el.categoriaNovo.value;
    if (!nome) return alert('Digite o nome do produto.');
    if (!produtos[cat].includes(nome)) {
      produtos[cat].push(nome);
      salvar();
      el.novoProduto.value = '';
      carregarProdutos();
    }
  };

  el.btnExcluirProduto.onclick = () => {
    const nome = el.produtoSelect.value;
    if (!nome) return alert('Escolha um produto.');
    produtos[categoriaAtual] = produtos[categoriaAtual].filter(p => p !== nome);
    salvar();
    carregarProdutos();
  };

  atualizarMes();
  carregarProdutos();
})();
