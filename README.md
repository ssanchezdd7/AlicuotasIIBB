# 📊 Dashboard de Alícuotas de Ingresos Brutos para Fintechs en Argentina

Aplicación web interactiva desarrollada en **HTML, CSS y JavaScript**, orientada al análisis y comparación de alícuotas del Impuesto sobre los Ingresos Brutos aplicables a productos y servicios Fintech en las distintas jurisdicciones de Argentina.

La solución permite realizar comparaciones entre provincias, analizar diferencias tributarias y visualizar los resultados mediante gráficos interactivos y un mapa de calor dinámico.

---

## 🚀 Características Principales

### 📍 Mapa de Calor Interactivo de Argentina

- Visualización provincial de alícuotas.
- Actualización automática según filtros seleccionados.
- Escala de colores dinámica.
- Tooltip con detalle de:
  - Provincia
  - Producto
  - Alícuota vigente

### 🔎 Filtros Avanzados

#### Selección múltiple de jurisdicciones

Permite comparar simultáneamente varias provincias.

Ejemplos:

- San Juan
- Mendoza
- Córdoba
- Buenos Aires
- CABA

#### Selección múltiple de productos

Permite analizar distintos productos financieros:

- Créditos
- Préstamos personales
- Billeteras virtuales
- Tarjetas digitales
- Servicios financieros digitales
- Otros productos definidos en el dataset

---

## 📈 Visualizaciones Disponibles

### Ranking de Provincias

Gráfico de barras ordenado por:

- Mayor alícuota
- Menor alícuota

### Comparador de Jurisdicciones

Permite visualizar:

- Diferencias absolutas
- Diferencias porcentuales
- Ranking tributario

### Indicadores Ejecutivos (KPIs)

La aplicación calcula automáticamente:

| Indicador | Descripción |
|------------|-------------|
| Promedio Nacional | Promedio de alícuotas seleccionadas |
| Máxima Alícuota | Mayor valor registrado |
| Mínima Alícuota | Menor valor registrado |
| Brecha Tributaria | Diferencia entre máximo y mínimo |
| Jurisdicciones Seleccionadas | Cantidad de provincias filtradas |

---

## 🗂️ Estructura del Proyecto

```text
dashboard-alicuotas-fintech/
│
├── index.html
├── styles.css
├── app.js
├── data.js
│
├── assets/
│   ├── argentina.svg
│   ├── logo.png
│   └── screenshots/
│
└── README.md
```

---

## 🧩 Arquitectura

La aplicación está diseñada bajo una arquitectura desacoplada:

- **HTML** → Interfaz de usuario
- **CSS** → Diseño y estilos
- **app.js** → Lógica de negocio
- **data.js** → Datos de alícuotas

Esto permite actualizar información sin modificar la interfaz.

---

## 📋 Formato de Datos

Los datos se almacenan en:

```javascript
// data.js

const datos = [
  {
    provincia: "San Juan",
    producto: "Créditos",
    alicuota: 6.5
  },
  {
    provincia: "Mendoza",
    producto: "Créditos",
    alicuota: 7.5
  }
];
```

---

## 🔄 Actualización de Datos

1. Abrir el archivo:

```text
data.js
```

2. Incorporar nuevos registros:

```javascript
{
  provincia: "Neuquén",
  producto: "Créditos",
  alicuota: 9.0
}
```

3. Guardar cambios.

4. Recargar la aplicación.

Los gráficos y mapas se actualizarán automáticamente.

---

## 🛠️ Tecnologías Utilizadas

- HTML5
- CSS3
- JavaScript ES6
- Chart.js
- SVG Interactivo
- Bootstrap 5
- Font Awesome

## 🎯 Casos de Uso

### Fintechs

- Evaluación de localización fiscal.
- Comparación tributaria entre provincias.
- Análisis de expansión territorial.

### Gobiernos Provinciales

- Benchmark tributario.
- Diseño de incentivos.
- Evaluación de competitividad.

### Consultoras

- Estudios sectoriales.
- Informes de inversión.
- Análisis regulatorios.

### Cámaras Empresariales

- Seguimiento de competitividad fiscal.
- Informes comparativos.

---

## 🔮 Mejoras Futuras

- Conexión automática a Google Sheets.
- Exportación a Excel.
- Exportación PDF.
- Series históricas.
- Simulador tributario.
- Indicadores de competitividad fiscal.
- Modo oscuro.
- Comparaciones interanuales.
- Responsive Mobile First.

---

## 👩‍💼 Autora

### Silvana Sánchez Di Domenico

Economista | Especialista en Gobernanza de Datos, Analítica e Inteligencia Artificial

💼 https://www.linkedin.com/in/silsansj

💻 https://github.com/ssanchezdd7

---

## 🤖 Desarrollo

Esta aplicación fue desarrollada por **Silvana Sánchez Di Domenico** con apoyo de herramientas de Inteligencia Artificial Generativa, incluyendo ChatGPT y Claude, para acelerar tareas de diseño, programación y documentación.

---

## 📜 Licencia

Uso libre para fines académicos, de investigación y análisis.

© 2026 SDA Consulting. Todos los derechos reservados.
