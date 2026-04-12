import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ForkMeControl } from "./index";

// ---------- minimal DOM mock ----------

class MockElement {
  tagName: string;
  className = "";
  href = "";
  target = "";
  rel = "";
  src = "";
  alt = "";
  style: Record<string, string> = {};
  children: MockElement[] = [];
  parentNode: MockElement | null = null;

  constructor(tag: string) {
    this.tagName = tag.toUpperCase();
  }

  appendChild(child: MockElement) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  querySelector(selector: string): MockElement | null {
    // 簡易的なタグ名マッチ
    const tag = selector.toUpperCase();
    for (const child of this.children) {
      if (child.tagName === tag) return child;
      const found = child.querySelector(selector);
      if (found) return found;
    }
    return null;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter(
        (c) => c !== this,
      );
      this.parentNode = null;
    }
  }

  contains(el: MockElement): boolean {
    if (this === el) return true;
    return this.children.some((c) => c.contains(el));
  }
}

function setupDocumentMock() {
  const original = globalThis.document;
  const mock = {
    createElement: vi.fn((tag: string) => new MockElement(tag)),
  };
  globalThis.document = mock as any;
  return () => {
    globalThis.document = original;
  };
}

function createMockMap(
  ctrlGroups: Record<string, { style: Record<string, string> }> = {},
) {
  const mapContainer = {
    querySelector: vi.fn((selector: string) => {
      for (const [pos, el] of Object.entries(ctrlGroups)) {
        if (selector === `.maplibregl-ctrl-${pos}`) return el;
      }
      return null;
    }),
  };
  return { getContainer: () => mapContainer } as any;
}

// ---------- tests ----------

describe("ForkMeControl", () => {
  let restoreDocument: () => void;

  beforeEach(() => {
    restoreDocument = setupDocumentMock();
  });

  afterEach(() => {
    restoreDocument();
  });

  it("getDefaultPosition returns 'top-left'", () => {
    const ctrl = new ForkMeControl({ url: "https://example.com" });
    expect(ctrl.getDefaultPosition()).toBe("top-left");
  });

  it("onAdd creates container with correct DOM structure", () => {
    const topLeft = { style: { top: "", padding: "" } };
    const map = createMockMap({ "top-left": topLeft });
    const ctrl = new ForkMeControl({ url: "https://example.com" });

    const el = ctrl.onAdd(map);

    expect(el.className).toBe("maplibregl-ctrl");

    const anchor = el.querySelector("a");
    expect(anchor).not.toBeNull();
    expect(anchor?.href).toBe("https://example.com");
    expect(anchor?.target).toBe("_blank");
    expect(anchor?.rel).toBe("noopener noreferrer");

    const img = anchor?.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.alt).toBe("Fork me on GitHub");
    expect(img?.style.position).toBe("absolute");
    expect(img?.style.top).toBe("-149px");
    expect(img?.style.border).toBe("0");
  });

  it("onAdd applies custom image and alt options", () => {
    const map = createMockMap();
    const ctrl = new ForkMeControl({
      url: "https://example.com",
      image: "https://example.com/custom.png",
      alt: "Custom ribbon",
    });

    const el = ctrl.onAdd(map);
    const img = el.querySelector("img");

    expect(img?.src).toBe("https://example.com/custom.png");
    expect(img?.alt).toBe("Custom ribbon");
  });

  it("onAdd shifts top-left control group down by ribbon height", () => {
    const topLeft = { style: { top: "", padding: "" } };
    const map = createMockMap({ "top-left": topLeft });
    const ctrl = new ForkMeControl({ url: "https://example.com" });

    ctrl.onAdd(map);

    expect(topLeft.style.top).toBe("149px");
  });

  it("onRemove removes container from parent", () => {
    const map = createMockMap();
    const ctrl = new ForkMeControl({ url: "https://example.com" });
    const el = ctrl.onAdd(map);

    const parent = new MockElement("div");
    parent.appendChild(el as any);
    expect(parent.contains(el as any)).toBe(true);

    ctrl.onRemove();

    expect(parent.contains(el as any)).toBe(false);
  });

  it("onRemove restores original top-left style", () => {
    const topLeft = { style: { top: "10px", padding: "10px" } };
    const map = createMockMap({ "top-left": topLeft });
    const ctrl = new ForkMeControl({ url: "https://example.com" });

    ctrl.onAdd(map);
    expect(topLeft.style.top).toBe("149px");

    ctrl.onRemove();
    expect(topLeft.style.top).toBe("10px");
  });

  it("onAdd uses local image when specified", () => {
    const map = createMockMap();
    const ctrl = new ForkMeControl({
      url: "https://example.com",
      image: "/assets/forkme_left_darkblue.svg",
    });

    const el = ctrl.onAdd(map);
    const img = el.querySelector("img");

    expect(img?.src).toBe("/assets/forkme_left_darkblue.svg");
  });

  it("getDefaultPosition returns 'top-right' when position is top-right", () => {
    const ctrl = new ForkMeControl({
      url: "https://example.com",
      position: "top-right",
    });
    expect(ctrl.getDefaultPosition()).toBe("top-right");
  });

  it("top-right positions image to the right", () => {
    const topRight = { style: { top: "", padding: "" } };
    const map = createMockMap({ "top-right": topRight });
    const ctrl = new ForkMeControl({
      url: "https://example.com",
      position: "top-right",
    });

    const el = ctrl.onAdd(map);
    const img = el.querySelector("img");

    expect(img?.style.right).toBe("0");
    expect(img?.style.left).toBeUndefined();
    expect(topRight.style.top).toBe("149px");
  });

  it("onRemove is safe to call without prior onAdd", () => {
    const ctrl = new ForkMeControl({ url: "https://example.com" });
    expect(() => ctrl.onRemove()).not.toThrow();
  });
});
