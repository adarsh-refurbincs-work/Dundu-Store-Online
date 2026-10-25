const jwt = require('jsonwebtoken');
const env = require('../config/env');

const ADMIN_ROLES = ['admin', 'super_admin'];

const expiresInFor = (payload) =>
  ADMIN_ROLES.includes(payload?.role) ? env.adminJwtExpiresIn : env.jwtExpiresIn;

// Strip the registered claims so a payload taken from a verified token can be re-signed.
const stripClaims = ({ iat, exp, nbf, jti, ...rest }) => rest;

const sign = (payload) =>
  jwt.sign(stripClaims(payload), env.jwtSecret, { expiresIn: expiresInFor(payload) });

const verify = (token) => jwt.verify(token, env.jwtSecret);

// True when less than half of the token's lifetime remains → caller should issue a fresh one.
const shouldRefresh = (payload) => {
  if (!payload?.iat || !payload?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return (payload.exp - now) < (payload.exp - payload.iat) / 2;
};

module.exports = { sign, verify, shouldRefresh, ADMIN_ROLES };
