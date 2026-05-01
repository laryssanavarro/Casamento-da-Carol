let usuarioAtivo = "";
let listaGlobal = [];
let categoriaAtiva = "Todos";
let itemSelecionado = null;

function entrar() {
  usuarioAtivo = document.getElementById('nomeUser').value;
  if(!usuarioAtivo) return alert("Por favor, digite seu nome.");
  document.getElementById('login').classList.add('hidden');
  document.getElementById('lista').classList.remove('hidden');
  document.getElementById('priceBar').classList.remove('hidden');
  document.getElementById('mainFooter').classList.remove('hidden');
  document.getElementById('btnRecadoHeader').classList.remove('hidden');
  carregar();
}

function carregar() {
  google.script.run.withSuccessHandler(function(itens) {
    listaGlobal = itens;
    aplicarFiltros();
  }).getPresentes();
}

function abrirModalRecado() { document.getElementById('modalRecado').classList.remove('hidden'); }
function fecharModalRecado() { document.getElementById('modalRecado').classList.add('hidden'); document.getElementById('txtRecado').value = ""; }

function enviarRecado() {
  const texto = document.getElementById('txtRecado').value;
  if(!texto) return;
  google.script.run.withSuccessHandler(() => {
    fecharModalRecado();
    document.getElementById('successMsg').innerText = "Seu recado foi enviado com sucesso!";
    document.getElementById('customSuccess').classList.remove('hidden');
  }).salvarRecado(texto, usuarioAtivo);
}

function filtrar(categoria, elemento) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  elemento.classList.add('active');
  categoriaAtiva = categoria;
  aplicarFiltros();
}

function aplicarFiltros() {
  let filtrados = [...listaGlobal];
  if(categoriaAtiva !== "Todos") filtrados = filtrados.filter(i => i.categoria === categoriaAtiva);
  const range = document.getElementById('rangePrice').value;
  if(range !== "all") {
    filtrados = filtrados.filter(i => {
      const v = parseFloat(i.vMin.replace(/[R$\s.]/g, '').replace(',', '.'));
      if(range === "10-20") return v >= 10 && v <= 20;
      if(range === "20-30") return v > 20 && v <= 30;
      if(range === "30-40") return v > 30 && v <= 40;
      if(range === "40-50") return v > 40 && v <= 50;
      if(range === "50-100") return v > 50 && v <= 100;
      return true;
    });
  }
  const order = document.getElementById('sortOrder').value;
  filtrados.sort((a, b) => {
    const sA = a.status === 'Escolhido' ? 1 : 0;
    const sB = b.status === 'Escolhido' ? 1 : 0;
    if (sA !== sB) return sA - sB;
    const pA = parseFloat(a.vMin.replace(/[R$\s.]/g, '').replace(',', '.'));
    const pB = parseFloat(b.vMin.replace(/[R$\s.]/g, '').replace(',', '.'));
    if(order === "asc") return pA - pB;
    if(order === "desc") return pB - pA;
    return 0;
  });
  renderizarCards(filtrados);
}

function renderizarCards(itens) {
  const grid = document.getElementById('grid');
  grid.innerHTML = itens.length ? "" : "<p style='grid-column:span 2; text-align:center; padding-top: 50px;'>Nenhum item encontrado.</p>";
  itens.forEach(item => {
    const isE = item.status === 'Escolhido';
    grid.innerHTML += `
      <div class="card ${isE ? 'esgotado' : ''}">
        ${isE ? '<div class="esgotado-badge">Escolhido</div>' : ''}
        <div class="card-img-wrapper">
          <img src="${item.imagem}" class="card-img" onerror="this.src='https://via.placeholder.com/300?text=Imagem'">
        </div>
        <div class="card-content">
          <div>
            <div class="card-title">${item.nome}</div>
            <div class="price-tag">${item.vMin}</div>
          </div>
          <div>
            <a href="${item.link}" target="_blank" class="btn-shopee" ${isE ? 'style="pointer-events: none; opacity: 0.5;"' : ''}>
              <i class="fas fa-shopping-bag"></i> Ver na Shopee
            </a>
            <button class="btn-presente" ${isE ? 'disabled' : ''} onclick="abrirConfirmacao(${item.index}, '${item.nome.replace(/'/g, "\\'")}')">
              ${isE ? 'Indisponível' : 'Escolher'}
            </button>
          </div>
        </div>
      </div>`;
  });
}

function abrirConfirmacao(idx, nome) {
  itemSelecionado = { idx, nome };
  document.getElementById('confirmText').innerHTML = `Você deseja confirmar que dará o presente:<br><b>${nome}</b>?`;
  document.getElementById('customConfirm').classList.remove('hidden');
}
function fecharModal() { document.getElementById('customConfirm').classList.add('hidden'); }
function confirmarAcao() {
  if(!itemSelecionado) return;
  google.script.run.withSuccessHandler(() => {
    fecharModal();
    document.getElementById('successMsg').innerText = "Sua escolha foi registrada com sucesso.";
    document.getElementById('customSuccess').classList.remove('hidden');
    carregar();
  }).escolherPresente(itemSelecionado.idx, usuarioAtivo);
}
function fecharSucesso() { document.getElementById('customSuccess').classList.add('hidden'); }
