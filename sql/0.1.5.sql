# Crear la tabla de orígenes
CREATE TABLE `aripwbi`.`origenes` (  
  `origen_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del origen',
  `nombre` VARCHAR(255) COMMENT 'Nombre del origen',
  `contadb` VARCHAR(255) COMMENT 'Nombre de la base de datos de contabilidad que corresponde con ese origen',
  PRIMARY KEY (`origen_id`)
);

# Permisos para los nuevos orígenes en los grupos de usuarios
ALTER TABLE `aripwbi`.`grupos_usuarios`   
	ADD COLUMN `origenes` INT(11) DEFAULT 1 NULL COMMENT 'Permisos para el mantenimiento de artículos' AFTER `categorias`;

# Añadir la referecia al origen en el concepto para que se puedan combinar cuentas de diferentes contabilidades
# se modifica la clave de única para evitar que dos conceptos tengan la misma cuenta de la misma contabilidad
ALTER TABLE `aripwbi`.`conceptos_cuentas`   
	ADD COLUMN `origen_id` INT(11) NULL COMMENT 'Relación con la tabla de orígenes para poder combinar cuentas de varias contabilidades' AFTER `periodo`, 
  DROP INDEX `conceptos_cuentas_un`,
  ADD  UNIQUE INDEX `conceptos_cuentas_un` (`codmacta`, `origen_id`);

/*
# Actualizar los conceptos cuentas para conservar los orígenes ya dados de alta
# Ojo, en el cliente el id será el que ellos hayan dado de alta
UPDATE aripwbi.conceptos_cuentas SET origen_id = 1;
*/

#Incluir la referencia al origen en la tabla de conceptos_apuntes
ALTER TABLE `aripwbi`.`conceptos_apuntes`   
	ADD COLUMN `origen_id` INT(11) NULL COMMENT 'Origen al que pertenece la cuenta contable' AFTER `periodo`,
  ADD CONSTRAINT `conceptos_apuntes_origenes` FOREIGN KEY (`origen_id`) REFERENCES `aripwbi`.`origenes`(`origen_id`);

/*
# Actualizar los conceptos apuntes para conservar los orígenes ya dados de alta
# Ojo, en el cliente el id será el que ellos hayan dado de alta
UPDATE aripwbi.conceptos_apuntes SET origen_id = 1;
*/

#Indicador de si el coste es computable o no
ALTER TABLE `aripwbi`.`conceptos`   
	ADD COLUMN `no_computable` BOOL DEFAULT FALSE NULL AFTER `categoria_id`;
ALTER TABLE `aripwbi`.`conceptos`   
	CHANGE `no_computable` `no_computable` TINYINT(1) DEFAULT 0 NULL COMMENT 'Indica si el concepto solo se va usar para estadística o comprobación pero no participa en el cálculo de costes';

#Indicador de si el coste solo se aplica en el periodo en el que está vigente
ALTER TABLE `aripwbi`.`conceptos`   
	ADD COLUMN `solo_periodo` BOOL DEFAULT FALSE NULL COMMENT 'Indica si el coste solo se aplica en su periodo de vigencia. Si no se considera que el coste es fijo.' AFTER `no_computable`;
