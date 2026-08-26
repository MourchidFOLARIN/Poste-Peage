/**
 * Module singleton — Paramètres globaux du système de péage
 * Le tarif est modifiable à chaud via l'API admin sans redémarrage.
 */

let TOLL_FEE = parseFloat(process.env.TOLL_FEE) || 500.0;

/**
 * Retourne le tarif de péage actuel en FCFA
 */
function getTollFee() {
  return TOLL_FEE;
}

/**
 * Met à jour le tarif de péage (en mémoire — persisté jusqu'au redémarrage)
 * @param {number|string} amount - Nouveau montant en FCFA
 */
function setTollFee(amount) {
  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error('Le montant du tarif doit être un nombre positif');
  }
  TOLL_FEE = parsed;
  return TOLL_FEE;
}

module.exports = { getTollFee, setTollFee };
