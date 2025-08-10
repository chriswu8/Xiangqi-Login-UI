// Files 0..8 (left->right), Ranks 0..9 (top->bottom). Black at top, Red at bottom.
export const backRank = ["R","N","B","A","K","A","B","N","R"];
export const redChars = { R:"俥", N:"傌", B:"相", A:"仕", K:"帥", C:"炮", P:"兵" };
export const blackChars = { R:"車", N:"馬", B:"象", A:"士", K:"將", C:"砲", P:"卒" };
export function initialPieces() {
  const pcs = [];
  // Black
  backRank.forEach((t, f) => pcs.push({ f, r:0, t, side:'b' }));
  [1,7].forEach(f => pcs.push({ f, r:2, t:'C', side:'b' }));
  [0,2,4,6,8].forEach(f => pcs.push({ f, r:3, t:'P', side:'b' }));
  // Red
  backRank.forEach((t, f) => pcs.push({ f, r:9, t, side:'r' }));
  [1,7].forEach(f => pcs.push({ f, r:7, t:'C', side:'r' }));
  [0,2,4,6,8].forEach(f => pcs.push({ f, r:6, t:'P', side:'r' }));
  return pcs;
}
