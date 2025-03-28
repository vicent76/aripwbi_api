CREATE TABLE `aripwbi`.`categorias` (  
  `categoriaId` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la categoria de gasto',
  `nombre` VARCHAR(255) COMMENT 'Nombre de la categoría de gasto',
  PRIMARY KEY (`categoriaId`)
);
ALTER TABLE `aripwbi`.`categorias`   
	CHANGE `categoriaId` `categoria_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la categoria de gasto';

ALTER TABLE `aripwbi`.`conceptos`   
	ADD COLUMN `categoria_id` INT(11) NULL COMMENT 'Referencia a la categoría de gasto a la que pertenece este concepto' AFTER `descripcion`,
  ADD CONSTRAINT `ref_concepto_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `aripwbi`.`categorias`(`categoria_id`);

#Permisos para las categorias
ALTER TABLE `aripwbi`.`grupos_usuarios`   
	ADD COLUMN `categorias` INT(11) DEFAULT 1 NULL COMMENT 'Permisos para manejar las categorias' AFTER `conceptos_apuntes`;

