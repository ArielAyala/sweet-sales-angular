# Idea del Proyecto

Aplicación *mobile first* para registrar órdenes de dulces (tortas, cupcakes, galletas y otros productos de repostería). Permite seleccionar productos, especificar cantidades y agregar personalizaciones o comentarios adicionales.

## Requerimientos Funcionales

### Registro de Órdenes

- Registrar el nombre y apellido de la persona que realiza la orden.
- Registrar el número de celular (opcional, por si desea pasar a retirar el pedido).
- Registrar la fecha y hora de entrega o retiro.
- Generar un resumen de la orden para compartir con el usuario.

### Gestión de Productos

- Módulo para registrar tipos de productos (tortas, cupcakes, galletas, otros).
- Cada producto debe tener su respectivo precio y descripción.

### Gestión de Pedidos

- Seleccionar pedidos y marcarlos como **completados** o **pendientes**.
- Visualizar el historial de pedidos realizados por cada usuario.
- Editar el precio del pedido en el momento de la entrega para aplicar descuentos o cambios de costos.

### Reportes de Ventas

- Resumen de ventas en un período de tiempo determinado (ej.: "reporte de ventas de esta semana").

### Internacionalización (i18n)

- Soporte para dos idiomas: español e inglés.
- El usuario podrá cambiar de idioma en cualquier momento desde la sección **Configuración**.

### Configuración

- **Moneda:** soporte por defecto de Guaraníes (PYG), cambiables a otra moneda desde la sección **Configuración**.
- **Tema:** modo oscuro y modo claro, seleccionable en cualquier momento desde la sección **Configuración**.

## Consideraciones de Usuario y Plataforma

- La aplicación está pensada para **un solo usuario** que la usa desde su celular; no se requiere sistema de autenticación.
- *Mobile first*: el usuario final usará la app desde su celular.
  - Para mobile debe ser super intuitiva y fácil de usar, con botones grandes y un diseño limpio y atractivo.
- Debe ser **responsive** para su uso desde computadora de escritorio.
  - Para escritorio debe aprovechar el espacio disponible para mostrar más información y opciones de manera clara y organizada.

## Persistencia de Datos

- La aplicación solo persistirá los datos en el dispositivo del usuario (**local storage**).
- No tendrá backend ni base de datos remota.
- Información exportable en **CSV** (para compartir o respaldar) y en **JSON**.
- La arquitectura debe ser **escalable** para que en el futuro pueda conectarse a un backend y base de datos remota.

## Datos Técnicos

- Debe ser una **PWA** (*Progressive Web App*) para poder instalarse en el dispositivo y funcionar sin conexión a internet.
- Base de proyecto Angular ya configurado con Tailwind en este path.
- El código debe seguir las buenas prácticas actuales de desarrollo y de la versión actual de Angular.
