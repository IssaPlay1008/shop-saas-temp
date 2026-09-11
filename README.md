# Bandittz-shop

1. Aplicación Pública (El Catálogo Ligero)

El objetivo aquí es la máxima velocidad de carga y cero fricción para el usuario.

A. Interfaz y Navegación (UI/UX)

Barra de navegación minimalista: Logo/nombre del emprendimiento, barra de búsqueda en tiempo real y el ícono flotante del carrito con contador de productos.

Buscador predictivo: Un input que filtre localmente por nombre o palabra clave (ej: escribes "limpieza" y filtra los inciensos con ese tag).

Filtros rápidos (Tabs): Botones superiores para filtrar al instante por tipo (Varillas, Conos, Resinas) o por intención (Relajación, Energía, Enfoque).

Cuadrícula de productos (Grid): Tarjetas compactas con:

Imagen del incienso.

Nombre y precio.

Etiqueta de stock (si quedan pocas unidades, mostrar "¡Últimos disponibles!"; si está en 0, deshabilitar botón y mostrar "Agotado").

Botón directo de [ + Añadir ].

Modal de detalle (Ventana emergente): Se activa al tocar la tarjeta del producto. Muestra:

Descripción del aroma y sus propiedades.

Recomendaciones de uso (cómo y cuándo encenderlo).

Sección de productos recomendados relacionados (Cross-selling).

B. Sistema del Carrito e Integración

Sidebar/Desplegable del Carrito: Muestra el desglose de lo seleccionado, permite sumar/restar unidades y calcula el total al instante.

Persistencia local (localStorage): Si el cliente cierra el navegador por error, su carrito sigue ahí al volver.

Formulario de Checkout simplificado: Un pequeño módulo al final del carrito que pida:

Nombre del cliente.

Botón de envío a WhatsApp: Un generador de URL dinámico que compile el texto formateado con el pedido completo y redirija al chat de la empresa

la app esta enfocada a moviles asi q ajusta el diseno a eso, tambien usaremos supabase para el backend igual puedes usar lovablestorage para las pruebas antes del release

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bandittzshop.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d4952c6d-a5d3-48bb-afcb-af17bb113ac7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
