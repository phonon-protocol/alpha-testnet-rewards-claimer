import { expect } from "chai";

export const expectRevert = async (fn: () => void, message: string) =>
  (expect(fn()).to.be as any).revertedWith(message);
