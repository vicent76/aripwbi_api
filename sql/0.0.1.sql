ALTER TABLE usuarios.usuarios   
	ADD COLUMN `nivelusupwbi` INT(11) NULL COMMENT 'Se corresponde con el grupo de usuarios para pwbi';

# Crear la tabla de grupos de permisos en la base de datos del panel
CREATE TABLE `grupos_usuarios` (
  `grupo_usuario_id` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del grupo',
  `nombre` VARCHAR(255) COLLATE utf8_spanish_ci NOT NULL COMMENT 'Nombre de grupo de usuarios',
  `inicio` INT(11) DEFAULT '1' COMMENT 'Permisos para inicio',
  `administracion` INT(11) DEFAULT '1' COMMENT 'Permisos para administracion',
  `gruposUsuarios` INT(11) DEFAULT '1' COMMENT 'Permisos para grupos de usuarios',
  `usuarios` INT(11) DEFAULT '1' COMMENT 'Permisos para usuarios',
  PRIMARY KEY (`grupo_usuario_id`)
) ENGINE=INNODB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci COMMENT='Grupos a los que pertenecen los usuarios';

# crear un registro de administradores con los máximos privilegios.
INSERT INTO `grupos_usuarios` (`grupo_usuario_id`, `nombre`, `inicio`, `administracion`, `gruposUsuarios`, `usuarios`) VALUES (1, 'Administradores', '5', '5', '5', '5'); 

UPDATE usuarios.usuarios SET codusu = 9999 WHERE codusu = 0;

CREATE TABLE aripwbi.conceptos (
	concepto_id INT NOT NULL AUTO_INCREMENT COMMENT 'Es la clave única autogenerada que identifica al concepto',
	nombre VARCHAR(255) NOT NULL COMMENT 'Nombre del concepto',
	descripcion TEXT NULL COMMENT 'En realidad es una ampliación del nombre del concepto por si se quiere incluir información adicional',
	CONSTRAINT conceptos_pk PRIMARY KEY (concepto_id)
)
ENGINE=INNODB
DEFAULT CHARSET=utf8
COLLATE=utf8_general_ci
COMMENT='Maneja los conceptos de costo contemplados en la aplicación';

ALTER TABLE `aripwbi`.`grupos_usuarios`   
	ADD COLUMN `gestion` INT(11) DEFAULT 1 NULL COMMENT 'Permisos para el punto de menú de gestión' AFTER `usuarios`,
	ADD COLUMN `conceptos` INT(11) DEFAULT 1 NULL COMMENT 'Permisos para conceptos de coste' AFTER `gestion`;

CREATE TABLE aripwbi.conceptos_cuentas (
	concepto_cuenta_id INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la relación entre concepto y cuenta',
	concepto_id INT NOT NULL COMMENT 'Clave relacional a la tabla de conceptos',
	codmacta varchar(255) NOT NULL COMMENT 'Número de cuenta en la contabilidad',
	nommacta varchar(255) NOT NULL COMMENT 'Nombre de la cuenta en la contabilidad',
	periodo varchar(255) NOT NULL COMMENT 'Indica el periodo en el que es aplicable el concepto de gasto para esa cuenta. Las posibilidades son DIA, SEMANA, MES, ANO',
	CONSTRAINT conceptos_cuentas_pk PRIMARY KEY (concepto_cuenta_id),
	CONSTRAINT conceptos_cuentas_conceptos_fk FOREIGN KEY (concepto_id) REFERENCES aripwbi.conceptos(concepto_id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8
COLLATE=utf8_general_ci
COMMENT='Maneja la relación entre conceptos de coste y las cuentas';


ALTER TABLE aripwbi.conceptos_cuentas ADD CONSTRAINT conceptos_cuentas_un UNIQUE KEY (codmacta);

CREATE TABLE aripwbi.conceptos_apuntes (
	concepto_apunte_id INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del apunte para ese concepto de coste',
	concepto_id INT NOT NULL COMMENT 'Clave que relaciona con el tipo de coste',
	codmacta varchar(255) NOT NULL COMMENT 'Código de la cuenta contable a la que hace referencia',
	nomacta varchar(255) NULL COMMENT 'Nombre de la cuenta contable a la que referencia',
	fechaent DATE NULL COMMENT 'Fecha del apunte',
	importe decimal(12,2) NULL COMMENT 'Valor absoluto de la diferencia entre importeH e importeD. Es decir el valor del apunte.',
	numasien INT NULL COMMENT 'Número de asiento en la contabilidad',
	numdocum varchar(255) NULL COMMENT 'Número del documento en el apunte contable.',
	ampconce varchar(255) NULL COMMENT 'Ampliación del concepto en el apunte contable',
	CONSTRAINT conceptos_apuntes_pk PRIMARY KEY (concepto_apunte_id),
	CONSTRAINT conceptos_apuntes_conceptos_fk FOREIGN KEY (concepto_id) REFERENCES aripwbi.conceptos(concepto_id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8
COLLATE=utf8_general_ci
COMMENT='Mantiene todos los apuntes relacionados con una cuenta y su concepto';

ALTER TABLE aripwbi.conceptos_apuntes ADD numdiari INT NULL COMMENT 'Número del diario al que pertence el asiento';
ALTER TABLE aripwbi.conceptos_apuntes ADD linliapu INT NULL COMMENT 'Linea de apunte. Pertenece a la clave primaria';

ALTER TABLE aripwbi.conceptos_apuntes ADD fecha_inicio_costo DATE NULL COMMENT 'En función del periodo del concepto de costo se calcula la fecha en al que comienza a contar el coste.';
ALTER TABLE aripwbi.conceptos_apuntes ADD fecha_fin_coste date NULL COMMENT 'En función del periodo del concepto de costo se calcula la fecha en al que finaliza a contar el coste.';
ALTER TABLE aripwbi.conceptos_apuntes CHANGE fecha_inicio_costo fecha_inicio_coste date NULL COMMENT 'En función del periodo del concepto de costo se calcula la fecha en al que comienza a contar el coste.';
ALTER TABLE `aripwbi`.`conceptos_apuntes`   
	CHANGE `nomacta` `nommacta` VARCHAR(255) CHARSET utf8 COLLATE utf8_general_ci NULL COMMENT 'Nombre de la cuenta contable a la que referencia';

ALTER TABLE `aripwbi`.`grupos_usuarios` ADD COLUMN `conceptosApuntes` INT(11) DEFAULT 1 NULL COMMENT 'Permisos para manejar lo apuntes' AFTER `conceptos`; 
# Nos hemos equivocado con el nombre del campo.
ALTER TABLE `aripwbi`.`grupos_usuarios` CHANGE `conceptosApuntes` `conceptos_apuntes` INT(11) DEFAULT 1 NULL COMMENT 'Permisos para manejar lo apuntes'; 
# Inclusión de la columna periodo por si cambia
ALTER TABLE `aripwbi`.`conceptos_apuntes`   
	ADD COLUMN `periodo` VARCHAR(255) NULL COMMENT 'Refleja el periodo usado para hacer los cálculos' AFTER `fecha_fin_coste`;