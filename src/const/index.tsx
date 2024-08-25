// https://chainlog.makerdao.com/api/mainnet/active.json
export const ILK_REGISTRY_CONTRACT_ADDRESS = '0x5a464C28D19848f44199D003BeF5ecc87d090F87';
export const DSS_CDP_MANAGER_CONTRACT_ADDRESS = '0x5ef30b9986345249bc32d8928b7ee64de9435e39';
export const VAULT_INFO_CONTRACT_ADDRESS = '0x68C61AF097b834c68eA6EA5e46aF6c04E8945B2d';
export const VAT_CONTRACT_ADDRESS = '0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B';
export const SPOTTER_CONTRACT_ADDRESS = '0x65C79fcB50Ca1594B025960e539eD7A9a6D434A3';
export const JUG_CONTRACT_ADDRESS = '0x19c0976f590D67707E62397C87829d896Dc0f1F1';
export const CAT_CONTRACT_ADDRESS = '0x78F2c2AF65126834c51822F56Be0d7469D7A523E';

export const systemKeyCodes = [ 8, 17, 18, 91, 16, 9, 93, 37, 40, 39, 38 ];

export const WAD = 10 ** 18;
export const RAY = 10 ** 27;
export const RAD = 10 ** 45;

export const SECONDS_IN_YEAR = 31536000;

// @note: tried to use Spotter to determinate price, but I think I need to be whitelisted
// @note: "?" - could not find price or price is not accurate
export const PRICE_FEED = {
  "WETH": 2623.90,
  "BAT": 0.1774,
  "TUSD": 1.0000,
  "ZRX": 0.3234,
  "KNC": 0.4596,
  "MANA": 0.2813,
  "USDT": 1.0000,
  "COMP": 50.01,
  "LRC": 0.1349,
  "LINK": 11.36,
  "BAL": 2.05,
  "YFI": 5226.42,
  "UNI": 6.99,
  "renBTC": 60570.30,
  "AAVE": 138.65,
  "UNI-V2": 0.814128097571,
  "RWA001": 0, // ??
  "RWA002": 0, // ??
  "RWA003": 0, // ??
  "RWA004": 0, // ??
  "RWA005": 0, // ??
  "RWA006": 0, // ??
  "PAX": 1.0000,
  "MATIC": 0.532215707356,
  "RWA013": 0, // ??
  "WBTC": 60740.06,
  "GUSD": 1.0000,
  "G-UNI": 0.033694,
  "steCRV": 1.0000, // ??
  "wstETH": 3087.20,
  "RWA008": 0, // ?
  "RWA009": 0, // ?
  "RWA007": 0, // ?
  "rETH": 2928.92,
  "cDAI": 0.02373,
  "GNO": 168.54,
  "RWA010": 0, // ?
  "RWA011": 0, // ?
  "RWA012": 0, // ?
  "aDAI": 1.0000,
  "RWA014": 0, // ?
  "RWA015": 0, // ?
  "spDAI": 1.0000,
  "USDC": 1.0000
}