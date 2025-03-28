
CREATE
    /*[ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}]
    [DEFINER = { user | CURRENT_USER }]
    [SQL SECURITY { DEFINER | INVOKER }]*/
    VIEW `ariagro10`.`bi_forfait_costes` 
    AS
(SELECT 
f.*, SUM(fe.cantidad * a.preciouc) AS coste_preciouc, SUM(fe.cantidad * a.preciomp) AS coste_preciomp
FROM forfaits AS f
LEFT JOIN forfaits_envases AS fe ON fe.codforfait = f.codforfait
LEFT JOIN sartic AS a ON a.codartic = fe.codartic
GROUP BY f.codforfait);

CREATE
    /*[ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE}]
    [DEFINER = { user | CURRENT_USER }]
    [SQL SECURITY { DEFINER | INVOKER }]*/
    VIEW `ariagro10`.`bi_confpale_costes` 
    AS
(SELECT
c.*, SUM(ce.cantidad * a.preciouc) AS coste_preciouc, SUM(ce.cantidad * a.preciomp) AS coste_preciomp
FROM confpale AS c
LEFT JOIN confpale_envases AS ce ON ce.codpalet = c.codpalet
LEFT JOIN sartic AS a ON a.codartic = ce.codartic
GROUP BY c.codpalet);
