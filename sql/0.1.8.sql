# Tabla de periodos 
CREATE TABLE `aripwbi`.`periodo` (  
  `periodo_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del periodo',
  `nombre` VARCHAR(255) NOT NULL COMMENT 'Nombre del periodo',
  `fecha_inicio` DATE NOT NULL COMMENT 'Fecha en la que se inicia el periodo',
  `fecha_fin` DATE NOT NULL COMMENT 'Fecha en la que termina el periodo',
  PRIMARY KEY (`periodo_id`)
);
# Hemos puesto mal el nombre de la Tabla
RENAME TABLE `aripwbi`.`periodo` TO `aripwbi`.`periodos`;
# Permisos en grupo de ususarios para el mantenimiento de periodos
ALTER TABLE `aripwbi`.`grupos_usuarios`   
	ADD COLUMN `periodos` INT(11) DEFAULT 1 NULL COMMENT 'Permisos para el mantenimiento de periodos' AFTER `origenes`;

# Relacionar las cuentas por concepto con los periodos en el caso de periodos específicos
ALTER TABLE `aripwbi`.`conceptos_cuentas`   
	ADD COLUMN `periodo_id` INT(11) NULL COMMENT 'Cuando se utiliza un periodo específico esta columna relaciona el periodo del que se trata' AFTER `origen_id`,
  ADD CONSTRAINT `conceptos_cuentas_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `aripwbi`.`periodos`(`periodo_id`);

#relacionar los periodos con las tablas de apuntes
ALTER TABLE `aripwbi`.`conceptos_apuntes`   
	ADD COLUMN `periodo_id` INT(11) NULL COMMENT 'Si está asociado a un periodo en concreto auí figura la id' AFTER `origen_id`,
  ADD CONSTRAINT `conceptos_apuntes_periodos` FOREIGN KEY (`periodo_id`) REFERENCES `aripwbi`.`periodos`(`periodo_id`);
