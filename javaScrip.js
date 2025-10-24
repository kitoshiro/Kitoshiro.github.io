// ===============================================
// FUNCIÓN CLAVE PARA LA MODULARIDAD (CON PROMESAS)
// ===============================================

/**
 * Carga un módulo HTML y lo inyecta en el contenedor por su ID, retornando una Promesa.
 */
function loadComponent(url, elementId) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
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

// Función que inicializa el Carrusel (debe existir la lógica dentro de este archivo)
function setupCarrusel() {
    // Aquí debe ir la lógica para iniciar el carrusel (definir slideIndex, auto-avance, etc.)
    console.log("Carrusel inicializado DESPUÉS de la carga de su HTML.");
}

// ===============================================
// ARRANQUE DEL SITIO Y CARGA DE MÓDULOS (USANDO ASYNC/AWAIT)
// ===============================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Carga componentes ESENCIALES y ESTRUCTURALES (Header/Footer)
        await Promise.all([
            loadComponent('components/header.html', 'header-placeholder'),
            loadComponent('components/footer.html', 'footer-placeholder'),
        ]);

        // 2. Carga el Carrusel y su lógica. Esperamos a que el HTML esté inyectado.
        await loadComponent('components/carrusel.html', 'carrusel-placeholder');
        setupCarrusel(); // Se ejecuta con la certeza de que el DOM del carrusel existe.
        
        // 3. Carga el resto de los componentes de contenido.
        Promise.all([
            loadComponent('components/marquesina.html', 'marquesina-placeholder'),
            loadComponent('components/productos.html', 'productos-placeholder'),
            loadComponent('components/contacto.html', 'contacto-placeholder'),
        ]).then(() => {
            // Aquí se llamaría a la función para cargar el JSON y renderizar los productos
            // ej: renderProductsFromJSON();
        });

    } catch (error) {
        console.error("Fallo crítico en la carga inicial del sitio:", error);
    }
});

// ... Mantener el resto de la lógica (toggleDropdown, window.onclick, etc.)

// ... (rest of your existing JavaScript code) ...

// ===============================================
// LÓGICA DEL MENÚ DESPLEGABLE (Manejo de múltiples menús, incluido el Mega Menú)
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
    // Si el clic no fue en un botón de desplegable
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
// LÓGICA DEL CARRUSEL (Autoplay y Pausa al Hover)
// ===============================================

let slidesContenedor;
let slides;
let totalSlides;
let indiceActual = 0;
let autoplayInterval; // ID para controlar la reproducción automática

function moverCarrusel(direccion) {
    if (!slidesContenedor || totalSlides === 0) return;
    
    indiceActual += direccion;
    
    // Lógica para loop (bucle) infinito
    if (indiceActual < 0) {
        indiceActual = totalSlides - 1; 
    } else if (indiceActual >= totalSlides) {
        indiceActual = 0; 
    }
    
    const desplazamiento = -indiceActual * 100;
    slidesContenedor.style.transform = `translateX(${desplazamiento}%)`;
}

function iniciarAutoplay() {
    detenerAutoplay(); 
    autoplayInterval = setInterval(() => {
        moverCarrusel(1); 
    }, 4000);
}

function detenerAutoplay() {
    clearInterval(autoplayInterval);
}

function setupCarrusel() {
    const carruselContainer = document.getElementById('carrusel');
    slidesContenedor = document.getElementById('slides');
    slides = document.querySelectorAll('.slide');
    
    // Si los elementos aún no se han inyectado, reintentamos
    if (!carruselContainer || !slidesContenedor) {
        setTimeout(setupCarrusel, 500); 
        return; 
    }
    
    totalSlides = slides.length;
    
    // 1. Iniciar el movimiento automático al cargar
    iniciarAutoplay();

    // 2. Lógica para DETENER/REANUDAR al pasar el cursor (HOVER)
    carruselContainer.addEventListener('mouseenter', detenerAutoplay);
    carruselContainer.addEventListener('mouseleave', iniciarAutoplay);
}
// Función para cargar dinámicamente módulos HTML
function loadHTML(url, elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar ${url}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                element.innerHTML = data;
                // Puedes agregar lógica específica post-carga aquí
            })
            .catch(error => {
                console.error("Fallo la carga del componente:", error);
            });
    }
}

// 1. Cargar el Header (si aún no lo haces)
// loadHTML('components/header.html', 'header-placeholder'); 
// Asume que esta línea ya existe para tu menú fijo.

// 2. Cargar la sección de Contacto
// Asegúrate de que la ruta a tu archivo sea correcta
document.addEventListener('DOMContentLoaded', () => {
    // Carga el Header (Ejemplo, si lo tienes en components)
    // loadHTML('components/header.html', 'header-placeholder');
    
    // Carga el Carrusel y Marquesina (Ejemplo)
    // loadHTML('components/carrusel.html', 'carrusel-placeholder');
    // loadHTML('components/marquesina.html', 'marquesina-placeholder');
    
    // *** CLAVE: Carga la nueva sección de Contacto ***
    loadHTML('components/contacto.html', 'contacto-placeholder');
});


// Mantenemos la lógica para los dropdowns y mega-menús
function toggleDropdown(id) {
    var dropdownContent = document.getElementById(id);
    // Cierra todos los menús abiertos, excepto el actual
    document.querySelectorAll('.dropdown-content.show').forEach(openDropdown => {
        if (openDropdown.id !== id) {
            openDropdown.classList.remove('show');
        }
    });
    
    // Muestra u oculta el menú actual
    dropdownContent.classList.toggle("show");
}

// Cierra el menú si el usuario hace clic fuera de él
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}