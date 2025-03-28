SELECT 
s1.ano, s1.total, s2.total_kgs_brut, s2.total_kgs_neto, s2.total_cajas, s1.total / s2.total_kgs_brut AS coste_kg_bruto, 
s1.total / s2.total_kgs_neto AS coste_kg_neto, s1.total / s2.total_cajas AS coste_caja 
FROM (
SELECT  YEAR(cp.fechaent) AS ano, SUM(importe) AS total 
FROM aripwbi.conceptos_apuntes AS cp 
LEFT JOIN aripwbi.conceptos AS c ON c.concepto_id = cp.concepto_id 
WHERE NOT c.no_computable AND NOT c.solo_periodo 
GROUP BY YEAR(cp.fechaent)) AS s1 
LEFT JOIN (
SELECT  YEAR(p1.fechaconf) AS ano, SUM(p2.pesobrut) AS total_kgs_brut, SUM(p2.pesoneto) AS total_kgs_neto, SUM(numcajas) AS total_cajas 
FROM ariagro10.palets AS p1 
LEFT JOIN ariagro10.palets_variedad AS p2 ON p2.numpalet = p1.numpalet 
GROUP BY YEAR(p1.fechaconf)) AS s2 
ON s2.ano = s1.ano;

SELECT 
s1.cd, s1.total, s2.total_kgs_brut, s2.total_kgs_neto, s2.total_cajas, s1.total / s2.total_kgs_brut AS coste_kg_bruto, 
s1.total / s2.total_kgs_neto AS coste_kg_neto, s1.total / s2.total_cajas AS coste_caja 
FROM 
(SELECT  1 AS cd ,SUM(p2.pesobrut) AS total_kgs_brut, SUM(p2.pesoneto) AS total_kgs_neto, SUM(numcajas) AS total_cajas 
FROM ariagro10.palets AS p1 
LEFT JOIN ariagro10.palets_variedad AS p2 ON p2.numpalet = p1.numpalet) AS s2 
LEFT JOIN
(SELECT  1 AS cd, SUM(cp.importe) AS total
FROM aripwbi.conceptos_apuntes AS cp 
LEFT JOIN aripwbi.conceptos AS c ON c.concepto_id = cp.concepto_id 
LEFT JOIN ariagro10.empresas AS ae ON TRUE
WHERE NOT c.no_computable AND NOT c.solo_periodo
AND cp.fechaent >= ae.fechaini AND cp.fechaent <= ae.fechafin) AS s1
ON s2.cd = s1.cd

