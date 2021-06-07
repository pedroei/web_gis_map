const containerCategorias = document.querySelector('.container-categorias');
//modal categorias
const modal = document.getElementById('modal_categorias');
const btn = document.querySelector('.fa-plus-circle');
const span = document.querySelector('.close-modal-categorias');
//modal categorias form
const btnAdd = document.querySelector('.adicionar-categoria');
const formNome = document.querySelector('.nome');
const formTipo = document.querySelector('.tipo');
const formCor = document.querySelector('.cor');
const error = document.querySelector('.error');

//modal distancia 2 pontos
const btnDistanciaPontos = document.querySelector('#btnDistanciaPontos');
const modalDistancia = document.getElementById('modal_distancia_pontos');
const spanCloseModalDistancia = document.querySelector(
  '.close-modal-distancia-pontos'
);

const selectPonto1 = document.querySelector('#ponto_1_select');
const selectPonto2 = document.querySelector('#ponto_2_select');
const btnCalcular = document.querySelector('.calcular-distancia');

const calculoFinal = document.querySelector('.distancia-entre-pontos');

// When the user clicks on the button, open the modal
btn.onclick = function () {
  modal.style.display = 'block';
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = 'none';
};

btnAdd.onclick = async (e) => {
  e.preventDefault();
  if (formNome.value === '') {
    return (error.style.visibility = 'visible');
  }

  const color = hexToName(formCor.value);

  const raw = await fetch('http://localhost:5000/api/categoria', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      nome: formNome.value,
      tipo: formTipo.value,
      cor: color,
    }),
  });

  const data = await raw.json();

  if (data === 'success') {
    alert('Categoria adicionada');
    formNome.value = '';
    formTipo.value = 'Ponto';
    formCor.value = '#000000';
    error.style.visibility = 'hidden';
    modal.style.display = 'none';
    getCategoriasInLayers();
  } else {
    alert('Erro ao adicionar categoria');
  }
};

const getCategoriasInLayers = async () => {
  const raw = await fetch('http://localhost:5000/api/categorias');
  const data = await raw.json();

  containerCategorias.innerHTML = '';
  data.forEach((cat) => {
    containerCategorias.innerHTML += `
        <p style="display: flex; justify-content: space-between;">
        <label
          ><input type="checkbox" id="${cat.nome}${cat.id}" checked="checked" onclick="getData()" />
          <i class="fa fa-map-marker-alt" style="color: ${cat.cor}"></i>
          ${cat.nome}</label
        >      
        <i class="fas fa-trash" style="color: red; cursor: pointer" 
        onclick="deleteCategoria(${cat.id})"></i>
        </p>
        `;
  });
};

getCategoriasInLayers();

const hexToName = (hex) => {
  if (hex === '#ff0000') return 'red';
  if (hex === '#8b0000') return 'darkred';
  if (hex === '#ffa500') return 'orange';
  if (hex === '#008000') return 'green';
  if (hex === '#006400') return 'darkgreen';
  if (hex === '#0000ff') return 'blue';
  if (hex === '#800080') return 'purple';
  if (hex === '#660066') return 'darkpurple';
  if (hex === '#5f9ea0') return 'cadetblue';
};

const getCategoriaID = async (id) => {
  const raw = await fetch('http://localhost:5000/api/categorias/' + id);
  return await raw.json();
};

const deleteCategoria = async (id) => {
  try {
    const raw = await fetch('http://localhost:5000/api/areas/categoria/' + id);
    const data = await raw.json();

    if (data.length === 0) {
      await fetch('http://localhost:5000/api/categorias/' + id, {
        method: 'DELETE',
      });
      getCategoriasInLayers();
    } else {
      alert('Esta categoria está associada a alguma area');
    }
  } catch (e) {
    console.log(e);
  }
};

// modal distancia

btnDistanciaPontos.onclick = (e) => {
  e.preventDefault();
  modalDistancia.style.display = 'block';
  getInfoPontos();
};

spanCloseModalDistancia.onclick = function () {
  modalDistancia.style.display = 'none';
};

window.onclick = function (event) {
  // this event takes care of 2 modals
  if (event.target == modalDistancia) {
    modalDistancia.style.display = 'none';
  }
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

const getInfoPontos = async () => {
  try {
    const raw = await fetch('http://localhost:5000/api/areas/pontos');
    const data = await raw.json();

    selectPonto1.innerHTML = '';
    selectPonto2.innerHTML = '';
    calculoFinal.innerHTML = '';

    data.forEach((ponto) => {
      selectPonto1.innerHTML += `<option value="${ponto.id}">${ponto.titulo}</option>`;
      selectPonto2.innerHTML += `<option value="${ponto.id}">${ponto.titulo}</option>`;
    });
  } catch (error) {
    console.log(error);
  }
};

btnCalcular.onclick = async (e) => {
  e.preventDefault();
  const idPonto1 = selectPonto1.value;
  const idPonto2 = selectPonto2.value;

  try {
    const raw = await fetch(
      'http://localhost:5000/api/distancia/' + idPonto1 + '/' + idPonto2
    );
    const data = await raw.json();
    const distanciaFinalMetros = Math.floor(data[0].st_distance * 100) / 100;
    const distanciaFinalKm =
      Math.floor((data[0].st_distance / 1000) * 100) / 100;

    calculoFinal.innerHTML = `${distanciaFinalMetros} metros - ${distanciaFinalKm} km`;
  } catch (error) {
    console.log(error);
  }
};
