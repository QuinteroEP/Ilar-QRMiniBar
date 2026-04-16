Este proyecto es un prototipo para un sistema que le permita a los huespedes de un hotel ordenar comida del minibar por medio de un codigo QR.

El proyecto tiene una arquitectura de monolito y sigue el patron MVC

# Directorio
## Controllers
Controladores para cada entidad de la base de datos

## db
Conexion a la base de datos

## models
ORM de cada entidad de la base de datos

## utils
Wrapper para las respuestas del API

# Tecnologias
## Frontend
1. NextJS

## Backend
1. Python
2. FastAPI
3. PostgreSQL

# Ejecucion
Para ejecutar el sistema se debe crear un entorno virtual

1. Crear el entorno con *python3 -m venv .venv*
2. Activar el entorno con *source .venv/bin/activate*
3. Instalar las dependencias con *pip install -r requirements.txt*
4. Ejecutar la aplicacion con *uvicorn main:app --reload*

# Creditos
Pablo Enrique Quintero (Backend)

Juan Diego Arias (Frontend)