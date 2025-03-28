SELECT 
c.concepto_id, cp.codmacta, cp.nommacta, cp.fecha_inicio_coste, cp.fecha_fin_coste, importe
FROM aripwbi.conceptos_apuntes AS cp
LEFT JOIN aripwbi.conceptos AS c ON c.concepto_id = cp.concepto_id
WHERE NOT no_computable AND solo_periodo

SELECT
p1.fechaconf, p2.codvarie, p2.pesobrut, p2.pesoneto, p2.numcajas
FROM ariagro10.palets AS p1
LEFT JOIN ariagro10.palets_variedad AS p2 ON p2.numpalet = p1.numpalet

SELECT
p1.fechaconf, p2.*
FROM ariagro10.palets AS p1
LEFT JOIN ariagro10.palets_variedad AS p2 ON p2.numpalet = p1.numpalet

SELECT 
s1.concepto_apunte_id, s1.concepto_id, s1.importe, s1.fecha_inicio_coste, s1.fecha_fin_coste,
importe / SUM(s2.pesobrut) AS coste_kg_brut, importe / SUM(s2.pesoneto) AS coste_kg_net, importe / SUM(s2.numcajas)  AS coste_caja
FROM 
(SELECT 
cp.concepto_apunte_id, c.concepto_id, cp.codmacta, cp.nommacta, cp.fecha_inicio_coste, cp.fecha_fin_coste, importe
FROM aripwbi.conceptos_apuntes AS cp
LEFT JOIN aripwbi.conceptos AS c ON c.concepto_id = cp.concepto_id
WHERE NOT no_computable AND solo_periodo) AS s1
LEFT JOIN
(SELECT
p1.fechaconf, p2.codvarie, p2.pesobrut, p2.pesoneto, p2.numcajas
FROM ariagro10.palets AS p1
LEFT JOIN ariagro10.palets_variedad AS p2 ON p2.numpalet = p1.numpalet) AS s2
ON s2.fechaconf >= s1.fecha_inicio_coste AND s2.fechaconf <= s1.fecha_fin_coste
GROUP BY s1.concepto_apunte_id


SELECT * FROM aripwbi.conceptos_apuntes WHERE concepto_apunte_id = 36220

SELECT * FROM ariagro10.palets WHERE fechaconf >= '2018-02-01' AND fechaconf <= '2018-02-28'