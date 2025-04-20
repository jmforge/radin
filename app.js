const mapeoAlergenos = {
  "en:apricot":                       "🍑 Albaricoque",
  "en:almonds":                       "🌰 Almendras",
  "en:cashews":                       "🌰 Anacardos",
  "en:artichoke":                     "🌿 Alcachofa",
  "en:celery":                        "🥬 Apio",
  "en:hazelnuts":                     "🌰 Avellanas",
  "en:rice":                          "🍚 Arroz",
  "en:lupin":                         "🌸 Altramuz",
  "en:onion":                         "🧅 Cebolla",
  "en:peanuts":                       "🥜 Cacahuetes",
  "en:cherry":                        "🍒 Cereza",
  "en:rye":                           "🌾 Centeno",
  "en:plum":                          "🍑 Ciruela",
  "en:peach":                         "🍑 Durazno", 
  "en:strawberry":                    "🍓 Fresa",
  "en:soybeans":                      "🌱 Frijoles de soja",
  "en:nuts":                          "🌰 Frutos secos",
  "en:tree-nuts":                     "🌰 Frutos secos (genérico)",
  "en:chickpeas":                     "🌰 Garbanzos",
  "en:gluten":                        "🌾 Gluten",
  "en:peas":                          "🟢 Guisantes",
  "en:egg":                           "🥚 Huevo",
  "en:kiwi":                          "🥝 Kiwi",
  "en:milk":                          "🥛 Leche",
  "en:mustard":                       "🌿 Mostaza",
  "en:shellfish":                     "🦐 Mariscos",
  "en:millet":                        "🌿 Mijo",
  "en:molluscs":                      "🐚 Moluscos",
  "en:corn":                          "🌽 Maíz",
  "en:macadamia-nuts":                "🌰 Nuez de macadamia",
  "en:walnuts":                       "🌰 Nueces",
  "en:potato":                        "🥔 Papas",
  "en:pear":                          "🍐 Pera",
  "en:pecans":                        "🌰 Pecanas",
  "en:fish":                          "🐟 Pescado",
  "en:pine-nuts":                     "🌲 Piñones",
  "en:quinoa":                        "🌿 Quinoa",
  "en:sesame":                        "⚪ Sésamo",
  "en:sesame-seeds":                  "⚪ Semillas de sésamo",
  "en:sulphur-dioxide-and-sulphites": "🧪 Sulfitos",
  "en:soy":                           "🌱 Soja",
  "en:tomato":                        "🍅 Tomate",
  "en:wheat":                         "🌾 Trigo",
  "en:carrot":                        "🥕 Zanahoria"
};

window.onload = () => {
  const form = document.getElementById("alergenosForm");

  Object.entries(mapeoAlergenos).forEach(([clave, nombre]) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = clave;
    checkbox.name = "alergenos";
    checkbox.value = clave;
    checkbox.addEventListener("change", guardarPreferencias);

    const label = document.createElement("label");
    label.htmlFor = clave;
    label.textContent = nombre;

    form.appendChild(checkbox);
    form.appendChild(label);
  });

  cargarPreferencias();

  const toggleBtn = document.getElementById("toggleBtn");
  toggleBtn.addEventListener("click", togglePanelVisibility);
};

function togglePanelVisibility() {
  const panelContent = document.getElementById("alergenosForm");
  const toggleBtn = document.getElementById("toggleBtn");

  panelContent.classList.toggle("hidden");
  toggleBtn.textContent = panelContent.classList.contains("hidden")
    ? "Mis Alérgenos"
    : "Ocultar Alérgenos";
}

function guardarPreferencias() {
  const seleccionados = [];
  document.querySelectorAll("input[name='alergenos']:checked").forEach(cb =>
    seleccionados.push(cb.value)
  );
  localStorage.setItem("alergenosSeleccionados", JSON.stringify(seleccionados));
}

function cargarPreferencias() {
  const guardados = JSON.parse(localStorage.getItem("alergenosSeleccionados") || "[]");
  guardados.forEach(clave => {
    const checkbox = document.getElementById(clave);
    if (checkbox) checkbox.checked = true;
  });
}

async function buscarProducto() {
  const codigo = document.getElementById("codigoInput").value.trim();
  const resultado = document.getElementById("resultado");
  const titulo = document.getElementById("tituloResultado");

  if (!codigo) {
    titulo.classList.remove("hidden");
    resultado.classList.remove("hidden");
    resultado.innerText = "Por favor, introduce un código de barras.";
    return;
  }

  if (!/^\d{8,13}$/.test(codigo)) {
    titulo.classList.remove("hidden");
    resultado.classList.remove("hidden");
    resultado.innerText = "⚠️ Introduce un código de barras válido (8 a 13 dígitos numéricos).";
    return;
  }

  const alergiasUsuario = JSON.parse(localStorage.getItem("alergenosSeleccionados") || "[]");

  if (alergiasUsuario.length === 0) {
    titulo.classList.remove("hidden");
    resultado.classList.remove("hidden");
    resultado.innerText = "⚠️ No has seleccionado alérgenos. Por favor, marca tus preferencias.";
    return;
  }

  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${codigo}.json`);
    const data = await res.json();

    if (!data || !data.product) {
      titulo.classList.remove("hidden");
      resultado.classList.remove("hidden");
      resultado.innerText = "Producto no encontrado.";
      return;
    }

    const producto = data.product;
    const nombre = producto.product_name || "Nombre no disponible";
    const imagen = producto.image_front_small_url || null;
    const alergenos = producto.allergens_tags || [];

    const encontrados = alergiasUsuario.filter(a => alergenos.includes(a));
    const nombresEncontrados = encontrados.map(a => mapeoAlergenos[a] || a);

    resultado.innerHTML = "";
    titulo.classList.remove("hidden");
    resultado.classList.remove("hidden");

    const contenedor = document.createElement("div");
    contenedor.className = "resultado-contenido";

    if (imagen) {
      const img = document.createElement("img");
      img.id = "imagenProducto";
      img.src = imagen;
      img.alt = nombre;
      contenedor.appendChild(img);
    }

    const texto = document.createElement("div");
    texto.className = "resultado-detalle";

    const tituloProd = document.createElement("h3");
    tituloProd.textContent = `🛒 ${nombre}`;
    texto.appendChild(tituloProd);

    const parrafo = document.createElement("p");
    if (nombresEncontrados.length > 0) {
      parrafo.innerHTML = `⚠️ <strong>Este producto contiene:</strong> ${nombresEncontrados.join(", ")}`;
      resultado.style.color = "red";
    } else {
      parrafo.innerHTML = `✅ Este producto <strong>no contiene</strong> los alérgenos seleccionados.`;
      resultado.style.color = "green";
    }

    texto.appendChild(parrafo);
    contenedor.appendChild(texto);
    resultado.appendChild(contenedor);

  } catch (err) {
    titulo.classList.remove("hidden");
    resultado.classList.remove("hidden");
    resultado.style.color = "black";
    resultado.innerText = "❌ Error al buscar el producto: " + err.message;
  }
}

let escanerActivo = false;
let camaras = [];
let camaraActual = 0;
let html5QrCode;

function iniciarEscaneo() {
  if (escanerActivo) return;

  escanerActivo = true;
  document.getElementById("scanner").classList.remove("hidden");
  document.getElementById("cambiarCamaraBtn").classList.remove("hidden");

  html5QrCode = new Html5Qrcode("scanner");

  Html5Qrcode.getCameras().then(devices => {
    if (!devices || devices.length === 0) {
      alert("No se encontraron cámaras.");
      return;
    }

    camaras = devices;

    // Selecciona por defecto la trasera si está disponible
    const backCamIndex = camaras.findIndex(c => c.label.toLowerCase().includes("back"));
    camaraActual = backCamIndex !== -1 ? backCamIndex : 0;

    iniciarConCamara(camaras[camaraActual].id);
  }).catch(err => {
    console.error("Error al acceder a cámaras:", err);
  });
}

function iniciarConCamara(camaraId) {
  html5QrCode.start(
    camaraId,
    {
      fps: 10,
      qrbox: { width: 250, height: 150 }
    },
    (decodedText) => {
      document.getElementById("codigoInput").value = decodedText;
      detenerEscaneo();
      buscarProducto(); // Ejecutar búsqueda automáticamente
    },
    (errorMessage) => {
      // opcional: puedes mostrar errores
    }
  );
}

function cambiarCamara() {
  if (camaras.length <= 1) return;

  html5QrCode.stop().then(() => {
    camaraActual = (camaraActual + 1) % camaras.length;
    iniciarConCamara(camaras[camaraActual].id);
  });
}

function detenerEscaneo() {
  html5QrCode.stop().then(() => {
    escanerActivo = false;
    document.getElementById("scanner").innerHTML = "";
    document.getElementById("scanner").classList.add("hidden");
    document.getElementById("cambiarCamaraBtn").classList.add("hidden");
  });
}