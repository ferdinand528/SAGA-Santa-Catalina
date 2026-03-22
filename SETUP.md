# 🏥 S.A.G.A - Sistema de Administración y Gestión Autogestivo
## Proyecto: Santa Catalina - Versión 2.1 (Enero 2026)

Este archivo contiene las instrucciones necesarias para reconstruir el entorno de desarrollo desde cero en caso de falla del hardware o migración de equipo.

---

## 1. 🛠 Requisitos de Software (Instaladores)
Antes de tocar el código, instalar los siguientes programas en este orden:

1. **Node.js (LTS):** [https://nodejs.org/](https://nodejs.org/) 
   * *Nota: Instalar la versión recomendada para la mayoría (v18 o superior).*
2. **Git:** [https://git-scm.com/](https://git-scm.com/)
   * *Configurar con: `git config --global user.name "Fernando"` y `git config --global user.email "tu@email.com"`*
3. **Visual Studio Code:** [https://code.visualstudio.com/](https://code.visualstudio.com/)

---

## 2. 🔌 Extensiones de VS Code (Plugins)
Para que el código se vea y se audite como en la versión actual, instalar estas extensiones desde el Marketplace:
* **ESLint:** (Identificador de errores en tiempo real).
* **Prettier - Code formatter:** (Auto-ordenado de código).
* **Tailwind CSS IntelliSense:** (Sugerencias de diseño v4).
* **Lucide Iconiser:** (Para los iconos institucionales).
* **ES7+ React/Redux/React-Native snippets:** (Plantillas de código rápido).

---

## 3. 🚀 Pasos para la Reinstalación

### 1er paso - Clonar el Repositorio:
Abrir la terminal y ejecutar:
```bash
git clone [https://github.com/ferdinand528/SAGA-Santa-Catalina.git](https://github.com/ferdinand528/SAGA-Santa-Catalina.git)
cd SAGA-Santa-Catalina

## 2do paso - Instalar Dependencias (Estructura Anidada):
      Debido a la arquitectura del proyecto, se debe instalar en dos niveles:

      Nivel 1 (Raíz - Auditoría):

      npm install

      Nivel 2 (Núcleo del Sistema):

      cd santa
      npm install

## 3er paso - Configurar Variables de Env (.env):
⚠️ MUY IMPORTANTE: GitHub no guarda las claves por seguridad. Crear un archivo llamado .env dentro de la carpeta /santa y pegar tus credenciales:

VITE_SUPABASE_URL=tu_url_de_supabase_aqui
VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase_aqui

## 4to paso - Correr el Proyecto:

npm run dev

---

### 💡 ¿Cómo subirlo ahora?
Para que esto quede guardado en tu nube de una vez, tirá estos comandos finales:

1.  `git add SETUP.md`
2.  `git commit -m "Docs: Manual de reconstrucción total v2.1 finalizado"`
3.  `git push origin main`



**¿Pudiste guardarlo y subirlo correctamente, Fernando?** Con esto ya podés estar tranquilo de que tu trabajo está protegido contra cualquier problema técnico en tu PC. ¿Querés que hagamos una última revisión de la carpeta `/santa` para ver si quedó algún archivo suelto que debamos documentar?