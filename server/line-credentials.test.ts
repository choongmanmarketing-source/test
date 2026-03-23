import { describe, it, expect } from "vitest";

describe("LINE Credentials", () => {
  it("should have LINE_CHANNEL_ID configured", () => {
    const channelId = process.env.LINE_CHANNEL_ID;
    expect(channelId).toBeDefined();
    expect(channelId).toBe("2009565084");
  });

  it("should have LINE_CHANNEL_SECRET configured", () => {
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    expect(channelSecret).toBeDefined();
    expect(channelSecret).toBe("b45c9c63cfdf56e77f7f185300e7b0eb");
  });

  it("should have valid LINE credentials format", () => {
    const channelId = process.env.LINE_CHANNEL_ID;
    const channelSecret = process.env.LINE_CHANNEL_SECRET;

    // Channel ID should be numeric
    expect(channelId).toMatch(/^\d+$/);

    // Channel Secret should be a hex string
    expect(channelSecret).toMatch(/^[a-f0-9]{32}$/);
  });
});
