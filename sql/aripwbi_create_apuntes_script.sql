# Eliminar los registros que ya no están en la contabilidad
DELETE FROM conceptos_apuntes
WHERE concepto_apunte_id IN
(SELECT concepto_apunte_id
FROM 
(SELECT *
FROM conceptos_apuntes 
WHERE (numdiari, fechaent, numasien, linliapu)
NOT IN (SELECT numdiari, fechaent, numasien, linliapu FROM ariconta1.hlinapu)) AS conceptmp)
AND fechaent >= '2019-01-01' AND fechaent <= '2019-12-31';

# Obtener los registros nuevos de la contabilidad que no están en la base de datos
SELECT 
c2.concepto_id, c1.codmacta, c.nommacta, c1.fechaent, 
ABS(COALESCE(c1.timporteH,0) - COALESCE(c1.timporteD,0)) AS importe,
c1.numasien, c1.numdocum, c1.ampconce,
c1.numdiari, c1.linliapu
FROM ariconta1.hlinapu AS c1
LEFT JOIN ariconta1.cuentas AS c ON c.codmacta = c1.codmacta
LEFT JOIN conceptos_cuentas AS c2 
ON c2.codmacta = c1.codmacta
LEFT JOIN (SELECT numdiari, fechaent, numasien, linliapu FROM conceptos_apuntes) AS c3
ON (c3.numdiari = c1.numdiari AND c3.fechaent = c1.fechaent AND c3.numasien = c1.numasien AND c3.linliapu = c1.linliapu)
WHERE NOT c2.concepto_id IS NULL 
AND c3.numdiari IS NULL
AND c1.fechaent >= '2019-01-01' AND c1.fechaent <= '2019-12-31';

# Obtener los registros que ya tenemos procesados pero en los que el importe han cambiado
# Si el cambio se hubiera producido en la fecha el registro habría quedado huérfano y se eliminaría en el primer paso.
SELECT 
c3.concepto_apunte_id, c2.concepto_id, c1.codmacta, c.nommacta, c1.fechaent, 
ABS(COALESCE(c1.timporteH,0) - COALESCE(c1.timporteD,0)) AS importe, 
c1.numasien, c1.numdocum, c1.ampconce,
c1.numdiari, c1.linliapu
FROM ariconta1.hlinapu AS c1
LEFT JOIN ariconta1.cuentas AS c ON c.codmacta = c1.codmacta
LEFT JOIN conceptos_cuentas AS c2 
ON c2.codmacta = c1.codmacta
LEFT JOIN (SELECT numdiari, fechaent, numasien, linliapu, importe, concepto_apunte_id, periodo FROM conceptos_apuntes) AS c3
ON (c3.numdiari = c1.numdiari AND c3.fechaent = c1.fechaent AND c3.numasien = c1.numasien AND c3.linliapu = c1.linliapu)
WHERE NOT c2.concepto_id IS NULL 
AND NOT c3.numdiari IS NULL
AND ABS(COALESCE(c1.timporteH,0) - COALESCE(c1.timporteD,0)) <> c3.importe
OR c2.periodo <> COALESCE(c3.periodo,'')
AND c1.fechaent >= '2019-01-01' AND c1.fechaent <= '2019-12-31';



