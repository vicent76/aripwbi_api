SELECT
ss1.*, 
ss1.pesobrut * ss2.coste_uc_kg_brut AS coste_kg_brut_uc,
ss1.pesobrut * ss2.coste_mp_kg_brut AS coste_kg_brut_mp,
ss1.pesoneto * ss2.coste_uc_kg_neto AS coste_kg_neto_uc,
ss1.pesoneto * ss2.coste_mp_kg_neto AS coste_kg_neto_mp,
ss1.numcajas * ss2.coste_uc_tot_cajas AS coste_cajas_uc,
ss1.numcajas * ss2.coste_mp_tot_cajas AS coste_cajas_mp
FROM
ariagro10.palets_variedad AS ss1
LEFT JOIN
(SELECT
s1.numpalet, 
coste_uc / kg_brut AS coste_uc_kg_brut,
coste_mp / kg_brut AS coste_mp_kg_brut,
coste_uc / kg_neto AS coste_uc_kg_neto,
coste_mp / kg_neto AS coste_mp_kg_neto,
coste_uc / tot_cajas AS coste_uc_tot_cajas,
coste_mp / tot_cajas AS coste_mp_tot_cajas
FROM
(SELECT
p.numpalet, p.codpalet, SUM(pv.pesobrut) AS kg_brut, SUM(pv.pesoneto) AS kg_neto, SUM(numcajas) AS tot_cajas
FROM ariagro10.palets_variedad AS pv
LEFT JOIN ariagro10.palets AS p ON p.numpalet = pv.numpalet
GROUP BY p.numpalet) AS s1
LEFT JOIN
(SELECT
c1.codpalet, c1.nompalet,  SUM(c2.cantidad * a.preciouc) coste_uc, SUM(c2.cantidad * a.preciomp) AS coste_mp
FROM ariagro10.confpale AS c1
LEFT JOIN ariagro10.confpale_envases AS c2 ON c2.codpalet = c1.codpalet
LEFT JOIN ariagro10.sartic AS a ON a.codartic = c2.codartic
GROUP BY c1.codpalet) AS s2
ON s2.codpalet = s1.codpalet) AS ss2
ON ss1.numpalet = ss2.numpalet