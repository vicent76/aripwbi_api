SELECT
s1. codvarie, s1.total_kgs_brut, s1.total_kgs_neto, s1.total_cajas, s2.compra,
s2.compra / s1.total_kgs_brut AS coste_kg_brut,
s2.compra / s1.total_kgs_neto AS coste_kg_neto,
s2.compra / s1.total_cajas AS coste_caja
FROM
(SELECT  
p2.codvarie ,SUM(p2.pesobrut) AS total_kgs_brut, SUM(p2.pesoneto) AS total_kgs_neto, SUM(p2.numcajas) AS total_cajas 
FROM ariagro10.palets_variedad AS p2 
GROUP BY p2.codvarie) AS s1
LEFT JOIN
(SELECT
c1.codvarie, SUM(c1.imporvar) AS compra
FROM ariagro10.rfactsoc_variedad AS c1
GROUP BY c1.codvarie) AS s2
ON s2.codvarie = s1.codvarie