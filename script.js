// ===============================================
// FUNCIÓN CLAVE PARA LA MODULARIDAD (CON PROMESAS)
// ===============================================

/**
 * Carga un módulo HTML y lo inyecta en el contenedor por su ID, retornando una Promesa.
 * @param {string} url - La ruta del archivo HTML a cargar.
 * @param {string} elementId - El ID del elemento donde inyectar el contenido.
 */
function loadComponent(url, elementId) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    // Muestra el código de error HTTP, útil para depuración.
                    throw new Error(`HTTP error! status: ${response.status} al cargar ${url}`);
                }
                return response.text();
            })
            .then(data => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.innerHTML = data;
                    resolve(); // RESUELVE la promesa al cargar
                } else {
                    console.error(`Contenedor #${elementId} no encontrado.`);
                    reject(new Error(`Contenedor #${elementId} no encontrado`));
                }
            })
            .catch(error => {
                console.error(`Error al cargar el componente ${url}:`, error);
                reject(error); // RECHAZA la promesa en caso de error
            });
    });
}

// ===============================================
// LÓGICA DEL CARRUSEL (Autoplay y Pausa al Hover)
// ===============================================

let slidesContenedor;
let totalSlides;
let indiceActual = 0;
let autoplayInterval; // ID para controlar la reproducción automática

/** Mueve el carrusel en la dirección especificada (1 para adelante, -1 para atrás). */
function moverCarrusel(direccion) {
    if (!slidesContenedor || totalSlides === 0) return;
    
    indiceActual += direccion;
    
    // Lógica para loop (bucle) infinito
    if (indiceActual < 0) {
        indiceActual = totalSlides - 1; 
    } else if (indiceActual >= totalSlides) {
        indiceActual = 0; 
    }
    
    // Se asume que los slides están en línea y ocupan el 100% del ancho del contenedor
    const desplazamiento = -indiceActual * 100;
    slidesContenedor.style.transform = `translateX(${desplazamiento}%)`;
}

/** Inicia el movimiento automático del carrusel. */
function iniciarAutoplay() {
    detenerAutoplay(); // Asegura que no haya intervalos duplicados
    autoplayInterval = setInterval(() => {
        moverCarrusel(1); 
    }, 4000); // Avanza cada 4 segundos
}

/** Detiene el movimiento automático. */
function detenerAutoplay() {
    clearInterval(autoplayInterval);
}

/**
 * Inicializa la funcionalidad del carrusel (se llama después de inyectar el HTML).
 * ASUME que el HTML inyectado tiene: 
 * - un elemento con ID 'carrusel' (para el hover)
 * - un elemento con ID 'slides' (el contenedor del transform)
 * - elementos hijos con clase '.slide'
 */
function setupCarrusel() {
    const carruselContainer = document.getElementById('carrusel');
    slidesContenedor = document.getElementById('slides');
    const slides = document.querySelectorAll('#slides .slide');
    
    // Si los elementos no están, el componente no se cargó correctamente.
    if (!carruselContainer || !slidesContenedor || slides.length === 0) {
        console.warn("No se pudo inicializar el carrusel. Elementos no encontrados en el DOM.");
        return; 
    }
    
    totalSlides = slides.length;
    console.log(`Carrusel inicializado con ${totalSlides} slides.`);

    // 1. Iniciar el movimiento automático al cargar
    iniciarAutoplay();

    // 2. Lógica para DETENER/REANUDAR al pasar el cursor (HOVER)
    carruselContainer.addEventListener('mouseenter', detenerAutoplay);
    carruselContainer.addEventListener('mouseleave', iniciarAutoplay);

    // 3. Opcional: Agregar funcionalidad a botones de navegación (si existen en el HTML)
    // document.getElementById('prevBtn').addEventListener('click', () => moverCarrusel(-1));
    // document.getElementById('nextBtn').addEventListener('click', () => moverCarrusel(1));
}


// ===============================================
// LÓGICA DEL MENÚ DESPLEGABLE (Manejo de múltiples menús)
// ===============================================

/**
 * Muestra u oculta el menú desplegable especificado por su ID.
 * Cierra cualquier otro menú que esté abierto.
 * @param {string} dropdownId - El ID del div 'dropdown-content' a manipular.
 */
function toggleDropdown(dropdownId) {
    const targetDropdown = document.getElementById(dropdownId);
    
    // 1. Cerrar todos los demás menús para evitar solapamientos
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        // Si el menú actual no es el target y está abierto, ciérralo
        if (openDropdown.id !== dropdownId && openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
        }
    }
    
    // 2. Abrir o cerrar el menú objetivo
    if (targetDropdown) {
        targetDropdown.classList.toggle("show");
    }
}

// Lógica para cerrar el menú si se hace clic fuera del botón o del contenido.
window.onclick = function(event) {
    // Si el clic no fue en un botón de desplegable con clase '.dropbtn'
    if (!event.target.matches('.dropbtn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}


// ===============================================
// ARRANQUE DEL SITIO Y CARGA DE MÓDULOS (USANDO ASYNC/AWAIT)
// ===============================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Carga componentes ESENCIALES y ESTRUCTURALES (Header/Footer) en paralelo
        console.log("Iniciando carga de Header y Footer...");
        await Promise.all([
            loadComponent('header.html', 'header-placeholder'),
            loadComponent('footer.html', 'footer-placeholder'),
        ]);

        // 2. Carga el Carrusel. Esperamos a que el HTML esté inyectado.
        console.log("Cargando Carrusel...");
        await loadComponent('carrusel.html', 'carrusel-placeholder');
        setupCarrusel(); // Se ejecuta con la certeza de que el DOM del carrusel existe.
        
        // 3. Carga el resto de los componentes de contenido en paralelo.
        console.log("Cargando contenido principal (Productos, Marquee, Contacto)...");
        Promise.all([
            loadComponent('marquee.html', 'marquesina-placeholder'),
            loadComponent('product.html', 'productos-placeholder'),
            loadComponent('contact.html', 'contacto-placeholder'),
        ]).then(() => {
            console.log("Toda la carga de componentes ha finalizado.");
            // Aquí podrías llamar a funciones que dependan de todo el contenido cargado
            // ej: renderProductsFromJSON();
        });

    } catch (error) {
        // Muestra un mensaje amigable al usuario en caso de fallo crítico
        document.body.innerHTML = `
            <div style="text-align:center; padding: 50px; color: red;">
                <h1>⚠️ Error Crítico de Carga ⚠️</h1>
                <p>No se pudo inicializar el sitio. Verifique que todos los archivos (HTML, JS) existan.</p>
                <p>Consola de depuración: ${error.message}</p>
            </div>
        `;
        console.error("Fallo crítico en la carga inicial del sitio:", error);
    }
});
