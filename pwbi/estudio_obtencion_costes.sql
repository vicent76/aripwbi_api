# forfaits_costes
SELECT 
f.*, SUM(fe.cantidad * a.preciouc) AS coste_preciouc, SUM(fe.cantidad * a.preciomp) AS coste_preciomp
FROM ariagro10.forfaits AS f
LEFT JOIN ariagro10.forfaits_envases AS fe ON fe.codforfait = f.codforfait
LEFT JOIN ariagro10.sartic AS a ON a.codartic = fe.codartic
GROUP BY f.codforfait;

#confpale_costes
SELECT
c.*, SUM(ce.cantidad * a.preciouc) AS coste_preciouc, SUM(ce.cantidad * a.preciomp) AS coste_preciomp
FROM ariagro10.confpale AS c
LEFT JOIN ariagro10.confpale_envases AS ce ON ce.codpalet = c.codpalet
LEFT JOIN ariagro10.sartic AS a ON a.codartic = ce.codartic
GROUP BY c.codpalet;

