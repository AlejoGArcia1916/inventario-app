

const listaProductos = document.querySelector("#lista-productos");
const elementoTotalProductos = document.querySelector("#total-productos");
const elementoTotalUnidades = document.querySelector("#total-unidades");
const elementoProductosAgotados = document.querySelector("#productos-agotados");
const buscador = document.querySelector("#buscar-producto");
const botonesFiltro = document.querySelectorAll(".filtros button");
const formulario = document.querySelector("#formulario-producto");
const inputNombre = document.querySelector("#nombre-producto");
const inputPrecio = document.querySelector("#precio-producto");
const inputStock = document.querySelector("#stock-producto");
const selectorOrden = document.querySelector("#ordenar-productos");
const elementoValorInventario = document.querySelector("#valor-inventario");
const elementoStockBajo = document.querySelector("#total-stock-bajo");
const listaVentas = document.querySelector("#lista-ventas");
const elementoTotalVendido = document.querySelector("#total-vendido");
const elementoTotalOperaciones = document.querySelector("#total-operaciones");
const buscadorVentas = document.querySelector("#buscar-venta");
const filtroFecha = document.querySelector("#fecha-venta");
const elementoTotalDia = document.querySelector("#total-dia");
const botonesOrdenVentas = document.querySelectorAll(".ordenamiento-ventas button");
const listaRanking = document.querySelector("#lista-ranking");
const botonesRanking = document.querySelectorAll(".filtros-ranking button");
const nombreProductoLider = document.querySelector("#nombre-producto-lider");
const ingresosProductoLider = document.querySelector("#ingresos-producto-lider");

const botonRestablecer = document.querySelector("#restablecer-inventario");
const botonBorrarHistorial = document.querySelector("#borrar-historial");
const botonesNavegacion = document.querySelectorAll("[data-ir-vista]");
const vistasApp = document.querySelectorAll(".app-vista");
const botonesAtajo = document.querySelectorAll("[data-atajo-vista]");
const botonDescargarVentas = document.querySelector("#descargar-ventas");
const listaUltimasVentas = document.querySelector("#ultimas-ventas");
const botonDescargarFiltradas = document.querySelector("#descargar-ventas-filtradas");



const productosIniciales = [
    {
        nombre: "Monitor Samsung",
        precio: 250,
        stock: 12
    },
    {
        nombre: "Teclado Logitech",
        precio: 45,
        stock: 15
    },
    {
        nombre: "Mouse inalámbrico",
        precio: 30,
        stock: 0
    }
];

function cargarProductos() {
    try {
        const datosGuardados = localStorage.getItem("inventario");
        if (datosGuardados === null) {
            return productosIniciales;
        }
        const productosRecuperados = JSON.parse(datosGuardados);
        if (!Array.isArray(productosRecuperados)) {
            throw new Error("El inventario guardado no es un array.");
        }
        const productosValidos = productosRecuperados.every(function (producto) {
            if (
                typeof producto !== "object" ||
                producto === null ||
                Array.isArray(producto)
            ) {
                return false;
            }
            if (
                typeof producto.nombre !== "string" ||
                producto.nombre.trim() === ""
            ) {
                return false;
            }
            if (
                typeof producto.precio !== "number" ||
                producto.precio < 0 ||
                !Number.isFinite(producto.precio)
            ) {
                return false;
            }
            if (
                typeof producto.stock !== "number" ||
                producto.stock < 0 ||
                !Number.isInteger(producto.stock)
            ) {
                return false;
            }
            return true;
        });
        if (!productosValidos) {
            throw new Error("Hay productos con datos inválidos.");
        }
        return productosRecuperados;
    } catch (error) {
        console.error("Error al cargar el inventario:", error);
        return productosIniciales;
    }
}

const productos = cargarProductos();
const ventasGuardadas = localStorage.getItem("ventas");
const ventas = ventasGuardadas !== null
    ? JSON.parse(ventasGuardadas)
    : [];

function guardarProductos() {
    const productosJSON = JSON.stringify(productos);
    localStorage.setItem("inventario", productosJSON);
}

function guardarVentas() {
    const ventasJSON = JSON.stringify(ventas);
    localStorage.setItem("ventas", ventasJSON);
}



let filtroActual = "todos";
let ordenActual = "original";
let ordenVentasActual = "recientes";
let rankingActual = "unidades";
let ventasVisibles = [];



function crearTarjetaProducto(producto) {
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("producto");
    if (producto.stock > 0 && producto.stock <= 5) {
        tarjeta.classList.add("stock-bajo");
    }
    const h3 = document.createElement("h3");
    h3.textContent = producto.nombre;
    const pPrecio = document.createElement("p");
    pPrecio.textContent = `Precio: US$ ${producto.precio}`;
    const pStock = document.createElement("p");
    pStock.textContent = `Stock: ${producto.stock} unidades`;
    tarjeta.appendChild(h3);
    tarjeta.appendChild(pPrecio);
    tarjeta.appendChild(pStock);
    const contenedorBotones = document.createElement("div");
    contenedorBotones.classList.add("producto-acciones");

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.classList.add("boton-eliminar");
    contenedorBotones.appendChild(botonEliminar);
    botonEliminar.addEventListener("click", function () {
        const confirmacion = confirm(
            `¿Está seguro de eliminar el producto "${producto.nombre}"?`
        );
        if (!confirmacion) {
            return;
        }
        const posicion = productos.indexOf(producto);
        if (posicion !== -1) {
            productos.splice(posicion, 1);
            guardarProductos();
            actualizarResumen();
            mostrarProductos(buscador.value.trim());
        }
    });

    const botonEditar = document.createElement("button");
    botonEditar.textContent = "Editar stock";
    botonEditar.classList.add("boton-editar");
    contenedorBotones.appendChild(botonEditar);
    botonEditar.addEventListener("click", function () {
        const respuesta = prompt(
            `Ingresá el nuevo stock de ${producto.nombre}:`,
            producto.stock
        );
        if (respuesta === null) {
            return;
        }
        if (respuesta.trim() === "") {
            alert("El stock no puede estar vacío.");
            return;
        }
        const nuevoStock = Number(respuesta);
        if (!Number.isInteger(nuevoStock) || nuevoStock < 0) {
            alert("El stock debe ser un número entero no negativo.");
            return;
        }
        producto.stock = nuevoStock;
        guardarProductos();
        actualizarResumen();
        mostrarProductos(buscador.value.trim());
    });

    const botonEditarPrecio = document.createElement("button");
    botonEditarPrecio.textContent = "Editar precio";
    botonEditarPrecio.classList.add("boton-editar");
    contenedorBotones.appendChild(botonEditarPrecio);
    botonEditarPrecio.addEventListener("click", function () {
        const respuesta = prompt(
            `Ingresá el nuevo precio de ${producto.nombre}:`,
            producto.precio
        );
        if (respuesta === null) {
            return;
        }
        if (respuesta.trim() === "") {
            alert("El precio no puede estar vacío.");
            return;
        }
        const nuevoPrecio = Number(respuesta);
        if (!Number.isFinite(nuevoPrecio) || nuevoPrecio < 0) {
            alert("El precio debe ser un número válido y no negativo.");
            return;
        }
        producto.precio = nuevoPrecio;
        guardarProductos();
        actualizarResumen();
        mostrarProductos(buscador.value.trim());
    });

    const botonVender = document.createElement("button");
    botonVender.textContent = "Vender unidades";
    botonVender.classList.add("boton-vender");
    if (producto.stock === 0) {
        botonVender.disabled = true;
    }
    contenedorBotones.appendChild(botonVender);
    botonVender.addEventListener("click", function () {
        const respuesta = prompt(
            `¿Cuántas unidades de ${producto.nombre} querés vender?`,
            "1"
        );
        if (respuesta === null) {
            return;
        }
        if (respuesta.trim() === "") {
            alert("El campo no puede estar vacío.");
            return;
        }
        const cantidad = Number(respuesta);
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            alert("La cantidad debe ser un número entero y mayor que cero.");
            return;
        }
        if (cantidad > producto.stock) {
            alert("No hay suficiente stock para vender.");
            return;
        }
        const importe = producto.precio * cantidad;

        const nuevaVenta = {
            producto: producto.nombre,
            cantidad: cantidad,
            precioUnitario: producto.precio,
            importe: importe,
            fecha: new Date().toLocaleString("es-UY", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })
        };
        ventas.push(nuevaVenta);
        guardarVentas();
        producto.stock -= cantidad;
        guardarProductos();
        actualizarResumen();
        mostrarProductos(buscador.value.trim());
        actualizarVistasDeVentas();
        alert(`Se vendieron ${cantidad} unidades de ${producto.nombre} por un total de US$ ${importe.toFixed(2)}.`);
    });
    tarjeta.appendChild(contenedorBotones);
    return tarjeta;
}

function mostrarProductos(textoBuscado) {
    let productosEncontrados = 0;
    listaProductos.innerHTML = "";
    const productosOrdenados = [...productos];
    if (ordenActual === "menor") {
        productosOrdenados.sort(function (a, b) {
            return a.precio - b.precio;
        });
    }
    if (ordenActual === "mayor") {
        productosOrdenados.sort(function (a, b) {
            return b.precio - a.precio;
        });
    }
    if (ordenActual === "nombre") {
        productosOrdenados.sort(function (a, b) {
            return a.nombre.localeCompare(b.nombre);
        });
    }
    for (const producto of productosOrdenados) {
        const coincideNombre = producto.nombre
            .toLowerCase()
            .includes(textoBuscado.toLowerCase());
        const coincideStock =
            filtroActual === "todos" ||
            (filtroActual === "disponibles" && producto.stock > 0) ||
            (filtroActual === "agotados" && producto.stock === 0) ||
            (filtroActual === "bajo" && producto.stock > 0 && producto.stock <= 5);
        if (coincideNombre && coincideStock) {
            productosEncontrados++;
            const tarjeta = crearTarjetaProducto(producto);
            listaProductos.appendChild(tarjeta);
        }
    }
    if (productosEncontrados === 0) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "No se encontraron productos.";
        listaProductos.appendChild(mensaje);
    }
}

function actualizarResumen() {
    let totalUnidades = 0;
    let productosAgotados = 0;
    for (const producto of productos) {
        totalUnidades += producto.stock;
        if (producto.stock === 0) {
            productosAgotados++;
        }
    }
    const valorTotal = productos.reduce(function (acumulador, producto) {
        const valorProducto = producto.precio * producto.stock;
        return acumulador + valorProducto;
    }, 0);
    const productosStockBajo = productos.filter(function (producto) {
        return producto.stock > 0 && producto.stock <= 5;
    });
    elementoStockBajo.textContent = productosStockBajo.length;
    elementoValorInventario.textContent = `US$ ${valorTotal.toFixed(2)}`;
    elementoTotalProductos.textContent = productos.length;
    elementoTotalUnidades.textContent = totalUnidades;
    elementoProductosAgotados.textContent = productosAgotados;
}



function mostrarVentas() {
    listaVentas.innerHTML = "";
    ventasVisibles = [];

    const textoBuscado = buscadorVentas.value.trim().toLowerCase();
    const fechaSeleccionada = filtroFecha.value;

    const ventasOrdenadas = [...ventas];
    if (ordenVentasActual === "recientes") {
        ventasOrdenadas.reverse();
    }

    let ventasEncontradas = 0;
    let totalDia = 0;
    for (const venta of ventasOrdenadas) {
        const coincideNombre = venta.producto
            .toLowerCase()
            .includes(textoBuscado);
        const fechaTexto = venta.fecha.split(",")[0].trim();
        const [dia, mes, anio] = fechaTexto.split("/");
        const fechaVenta = `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
        const coincideFecha =
            fechaSeleccionada === "" ||
            fechaVenta === fechaSeleccionada;
        if (fechaSeleccionada !== "" && coincideFecha) {
            totalDia += venta.importe;
        }
        if (!coincideNombre || !coincideFecha) {
            continue;
        }
        ventasVisibles.push(venta);
        ventasEncontradas++;
        const tarjeta = document.createElement("article");
        tarjeta.classList.add("venta");
        const titulo = document.createElement("h3");
        titulo.textContent = venta.producto;
        const detalle = document.createElement("p");
        detalle.textContent = `${venta.cantidad} unidades vendidas`;
        const precioUnitario = document.createElement("p");
        precioUnitario.textContent =
            `Precio unitario: US$ ${venta.precioUnitario.toFixed(2)}`;
        const importe = document.createElement("p");
        importe.textContent = `Total: US$ ${venta.importe.toFixed(2)}`;
        const fecha = document.createElement("p");
        const fechaSinSegundos = venta.fecha.replace(
            /(\d{1,2}:\d{2}):\d{2}/,
            "$1"
        );
        fecha.textContent = `Fecha: ${fechaSinSegundos}`;
        tarjeta.appendChild(titulo);
        tarjeta.appendChild(detalle);
        tarjeta.appendChild(precioUnitario);
        tarjeta.appendChild(importe);
        tarjeta.appendChild(fecha);
        listaVentas.appendChild(tarjeta);
    }

    elementoTotalDia.textContent = fechaSeleccionada === ""
        ? "Seleccioná una fecha"
        : `US$ ${totalDia.toFixed(2)}`;
    if (ventasEncontradas === 0) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "No se encontraron ventas.";
        listaVentas.appendChild(mensaje);
    }

    const totalVendido = ventas.reduce(function (acumulador, venta) {
        return acumulador + venta.importe;
    }, 0);
    elementoTotalVendido.textContent = `US$ ${totalVendido.toFixed(2)}`;
    
    const totalOperaciones = ventas.length;
    elementoTotalOperaciones.textContent = totalOperaciones;
}

function mostrarUltimasVentas() {
    if (!listaUltimasVentas) {
        return;
    }

    listaUltimasVentas.replaceChildren();
    const recientes = ventas.slice(-3).reverse();
    if (recientes.length === 0) {
        const item = document.createElement("li");
        item.textContent = "Todavía no hay ventas registradas.";
        listaUltimasVentas.appendChild(item);
        return;
    }
    for (const venta of recientes) {
        const item = document.createElement("li");
        item.textContent =
            `${venta.producto} · ${venta.cantidad} u. · US$ ${venta.importe.toFixed(2)}`;
        listaUltimasVentas.appendChild(item);
    }
}

function calcularIngresosPorProducto() {
    const ingresos = ventas.reduce(function (acumulador, venta) {
        const nombre = venta.producto;
        if (acumulador[nombre] === undefined) {
            acumulador[nombre] = 0;
        }
        acumulador[nombre] += venta.importe;
        return acumulador;
    }, {});
    return ingresos;
}

function calcularProductosMasVendidos() {
    const resumen = ventas.reduce(function (acumulador, venta) {
        const nombre = venta.producto;
        if (!acumulador[nombre]) {
            acumulador[nombre] = 0;
        }
        acumulador[nombre] += venta.cantidad;
        return acumulador;
    }, {});

    const datosRanking = rankingActual === "unidades"
        ? resumen
        : calcularIngresosPorProducto();
    const ranking = Object.entries(datosRanking);
    ranking.sort((a, b) => b[1] - a[1]);
    listaRanking.innerHTML = "";
    const cantidadMaxima = ranking.length > 0 ? ranking[0][1] : 0;
    ranking.forEach(function ([nombre, cantidad], indice) {
        
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("ranking-item");
        
        const medalla = document.createElement("span");
        medalla.classList.add("ranking-medalla");
        if (indice === 0) {
            medalla.textContent = "🥇";
        } else if (indice === 1) {
            medalla.textContent = "🥈";
        } else if (indice === 2) {
            medalla.textContent = "🥉";
        } else {
            medalla.textContent = `${indice + 1}º`;
        }
        
        const info = document.createElement("div");
        info.classList.add("ranking-info");
        const detalles = document.createElement("div");
        detalles.classList.add("ranking-detalles");
        
        const nombreProducto = document.createElement("span");
        nombreProducto.classList.add("ranking-nombre");
        nombreProducto.textContent = nombre;
        
        const unidadesVendidas = document.createElement("span");
        unidadesVendidas.classList.add("ranking-cantidad");
        unidadesVendidas.textContent = rankingActual === "unidades"
            ? `${cantidad} unidades`
            : `US$ ${cantidad.toFixed(2)}`;
        
        const barra = document.createElement("div");
        barra.classList.add("ranking-barra");
        const progreso = document.createElement("div");
        progreso.classList.add("ranking-progreso");
        const porcentaje = cantidadMaxima > 0
            ? (cantidad / cantidadMaxima) * 100
            : 0;
        progreso.style.width = `${porcentaje}%`;
        
        detalles.appendChild(nombreProducto);
        detalles.appendChild(unidadesVendidas);
        barra.appendChild(progreso);
        info.appendChild(detalles);
        info.appendChild(barra);
        tarjeta.appendChild(medalla);
        tarjeta.appendChild(info);
        listaRanking.appendChild(tarjeta);
    });
}

function mostrarProductoLider() {
    const ingresos = calcularIngresosPorProducto();
    const ranking = Object.entries(ingresos);
    ranking.sort((a, b) => b[1] - a[1]);
    if (ranking.length === 0) {
        nombreProductoLider.textContent = "Sin ventas registradas";
        ingresosProductoLider.textContent = "US$ 0.00";
        return;
    }
    const [nombre, ingresosLider] = ranking[0];
    nombreProductoLider.textContent = nombre;
    ingresosProductoLider.textContent = `US$ ${ingresosLider.toFixed(2)}`;
}

function actualizarVistasDeVentas() {
    mostrarVentas();
    mostrarUltimasVentas();
    calcularProductosMasVendidos();
    mostrarProductoLider();
}



function campoCSV(valor) {
    let texto = String(valor ?? "");
    
    if (/^\s*[=+@-]/.test(texto)) {
        texto = "'" + texto;
    }
    return `"${texto.replaceAll('"', '""')}"`;
}

function generarCSVVentas(lista = ventas) {
    const encabezado =
        "Producto;Cantidad;Precio unitario (US$);Importe (US$);Fecha";
    const filas = lista.map(function (venta) {
        return [
            campoCSV(venta.producto),
            venta.cantidad,
            venta.precioUnitario.toFixed(2).replace(".", ","),
            venta.importe.toFixed(2).replace(".", ","),
            campoCSV(venta.fecha)
        ].join(";");
    });
    return [encabezado, ...filas].join("\n");
}

function descargarCSVVentas(lista, nombreArchivo) {
    const csv = generarCSVVentas(lista);

    const archivo = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8"
    });

    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(function () {
        URL.revokeObjectURL(url);
    }, 1000);
}



buscador.addEventListener("input", function () {
    mostrarProductos(buscador.value.trim());
});

for (const boton of botonesFiltro) {
    boton.addEventListener("click", function () {
        for (const b of botonesFiltro) {
            b.classList.remove("activo");
        }
        boton.classList.add("activo");
        filtroActual = boton.dataset.filtro;
        mostrarProductos(buscador.value.trim());
    });
}

selectorOrden.addEventListener("change", function () {
    ordenActual = selectorOrden.value;
    mostrarProductos(buscador.value.trim());
});

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const nombre = inputNombre.value.trim();
    const precio = Number(inputPrecio.value);
    const stock = Number(inputStock.value);
    if (!nombre) {
        alert("El nombre es obligatorio.");
        return;
    }
    if (
        inputPrecio.value.trim() === "" ||
        !Number.isFinite(precio) ||
        precio < 0
    ) {
        alert("El precio debe ser un número válido y no negativo.");
        return;
    }
    if (
        inputStock.value.trim() === "" ||
        !Number.isInteger(stock) ||
        stock < 0
    ) {
        alert("El stock debe ser un número entero no negativo.");
        return;
    }

    const nuevoProducto = {
        nombre: nombre,
        precio: precio,
        stock: stock
    };
    productos.push(nuevoProducto);
    guardarProductos();
    actualizarResumen();
    mostrarProductos(buscador.value.trim());
    formulario.reset();
});

botonRestablecer.addEventListener("click", function () {
    if (!confirm("¿Estás seguro de que quieres restablecer el inventario?")) {
        return;
    }
    localStorage.removeItem("inventario");
    window.location.reload();
});



buscadorVentas.addEventListener("input", function () {
    mostrarVentas();
});

filtroFecha.addEventListener("change", function () {
    mostrarVentas();
});

for (const boton of botonesOrdenVentas) {
    boton.addEventListener("click", function () {
        
        for (const b of botonesOrdenVentas) {
            b.classList.remove("activo");
        }
        
        boton.classList.add("activo");
        
        ordenVentasActual = boton.dataset.orden;
        
        mostrarVentas();
    });
}

botonBorrarHistorial.addEventListener("click", function () {
    const confirmacion = confirm(
        "¿Estás seguro de que querés borrar todo el historial de ventas? Esta acción no se puede deshacer."
    );
    if (!confirmacion) {
        return;
    }
    localStorage.removeItem("ventas");
    window.location.reload();
});

for (const boton of botonesRanking) {
    boton.addEventListener("click", function () {
        
        for (const b of botonesRanking) {
            b.classList.remove("activo");
        }
        
        boton.classList.add("activo");
        
        rankingActual = boton.dataset.ranking;
        
        calcularProductosMasVendidos();
    });
}

botonDescargarVentas?.addEventListener("click", function () {
    descargarCSVVentas(ventas, "ventas.csv");
});

botonDescargarFiltradas?.addEventListener("click", function () {
    if (ventasVisibles.length === 0) {
        alert("No hay resultados para descargar.");
        return;
    }

    descargarCSVVentas(ventasVisibles, "ventas-filtradas.csv");
});



for (const boton of botonesNavegacion) {
    boton.addEventListener("click", function () {
        const vistaElegida = boton.dataset.irVista;
        for (const vista of vistasApp) {
            vista.hidden = vista.dataset.vista !== vistaElegida;
        }
        for (const otroBoton of botonesNavegacion) {
            otroBoton.setAttribute("aria-pressed", String(otroBoton === boton));
        }
    });
}

for (const atajo of botonesAtajo) {
    atajo.addEventListener("click", function () {
        const destino = atajo.dataset.atajoVista;
        const botonMenu = document.querySelector(
            `.menu-lateral [data-ir-vista="${destino}"]`
        );
        botonMenu.click();
    });
}



mostrarProductos("");
actualizarResumen();
actualizarVistasDeVentas();
