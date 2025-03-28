#ARIPWBI_API  

Este servicio se encarga de las gestión de los datos de Business Intelligence para las aplicaciones de Ariadna.  

##Documentación
La documentación de la API está diosponible en POSTAM en el siguiente enlace:  
https://documenter.getpostman.com/view/52076/S11PrwEb

##Configuración   
La aplicación se puede configurar mediante las variables de entorno o con un fichero .env en la raiz de la carpeta de instalación.  
El significado de las variables es el siguiente:  
ARIPWBI_PORT = Puerto asociado a la aplicación  

ARIPWBI_WINSTON_FILELEVEL = Nivel de log en fichero (Ex: "info")  
ARIPWBI_WINSTON_CONSOLELEVEL = Nivel de log por pantalla (Ex: "debug")  

ARIPWBI_JWT_KEY = Palabra secreta para codificar los json web tokens (Ex: "mitesoro")

ARIPWBI_MYSQL_HOST = Dirección del servidor de producción (Ex: "localhost")  
ARIPWBI_MYSQL_USER = Usuario mysql de producción (Ex:"root")  
ARIPWBI_MYSQL_PASSWORD = Contraseña del usuario mysql (Ex:"password")  
ARIPWBI_MYSQL_DATABASE = Nombre de la base de datos de producción (Ex: "ARIPWBI_prod")  
ARIPWBI_MYSQL_PORT = Puerto de mysql en producción (Ex: "3306")  
ARIPWBI_MYSQL_USUARIOS = Base de datos de usuarios que se usará para entrar en la aplicación  



