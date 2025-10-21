Importar municipios desde el GeoJSON

Este script importa los municipios contenidos en `mapa-frontend/public/capas/Municipios_DANE.geojson` al modelo `Municipality` de la base de datos.

Requisitos
- Tener las variables de entorno (.env) con la configuración de la base de datos (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST).
- Haber instalado dependencias en `mapa-backend` (npm install).
- Asegurarse de que el archivo GeoJSON existe en `mapa-frontend/public/capas/Municipios_DANE.geojson`.

Uso
Desde la carpeta `mapa-backend` ejecutar:

```cmd
node scripts/importMunicipalities.js
```

Qué hace
- Lee cada feature, toma `properties.muncodigo` como `id`, `properties.munnombre` como `name`, y guarda `geometry` en el campo JSON `geometry` de `Municipality`.
- Usa `Municipality.upsert` para crear o actualizar registros.
- Intenta actualizar la secuencia serial (Postgres) para que futuros inserts automáticos no colisionen.
- Lee cada feature, toma `properties.muncodigo` como `id` y `properties.munnombre` como `name`. El script no almacena la geometría en la base de datos (la columna `geometry` fue eliminada del modelo).
- Realiza INSERT ... ON CONFLICT (id) DO UPDATE para mantener sólo las columnas `id`, `name`, `createdAt` y `updatedAt`.
- Intenta actualizar la secuencia serial (Postgres) para que futuros inserts automáticos no colisionen.

Notas
- El script realiza parseInt en `muncodigo`; si tienes códigos con ceros a la izquierda y deseas preservarlos, podemos almacenar el código en un campo string alternativo.
- Haz una copia de seguridad antes de ejecutar en producción.
