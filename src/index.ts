import type { ControlPosition, IControl, Map } from "maplibre-gl";

const RIBBON_IMAGES = {
  "top-left":
    "https://github.blog/wp-content/uploads/2008/12/forkme_left_darkblue_121621.png",
  "top-right":
    "https://github.blog/wp-content/uploads/2008/12/forkme_right_darkblue_121621.png",
} as const;

const RIBBON_HEIGHT = 149;

type ForkMePosition = "top-left" | "top-right";

export interface ForkMeControlOptions {
  /** GitHub リポジトリなどのリンク先 URL */
  url: string;
  /** 配置位置（デフォルト: "top-left"） */
  position?: ForkMePosition;
  /** リボン画像の URL（デフォルト: position に応じた GitHub 公式リボン） */
  image?: string;
  /** img 要素の alt テキスト */
  alt?: string;
}

export class ForkMeControl implements IControl {
  private readonly position: ForkMePosition;
  private readonly options: Required<Omit<ForkMeControlOptions, "position">>;
  private container: HTMLDivElement | undefined;
  private ctrlGroupElement: HTMLElement | undefined;
  private originalCtrlGroupTop: string | undefined;
  private originalCtrlGroupPadding: string | undefined;

  constructor(options: ForkMeControlOptions) {
    const position = options.position ?? "top-left";
    this.position = position;
    this.options = {
      image: RIBBON_IMAGES[position],
      alt: "Fork me on GitHub",
      ...options,
    };
  }

  onAdd(map: Map): HTMLDivElement {
    const { url, image, alt } = this.options;

    const container = document.createElement("div");
    container.className = "maplibregl-ctrl";
    Object.assign(container.style, {
      margin: "0",
    });

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";

    const isRight = this.position === "top-right";

    const img = document.createElement("img");
    img.src = image;
    img.alt = alt;
    Object.assign(img.style, {
      position: "absolute",
      top: `-${RIBBON_HEIGHT}px`,
      [isRight ? "right" : "left"]: "0",
      border: "0",
    });

    anchor.appendChild(img);
    container.appendChild(anchor);

    // リボン分の高さだけコントロール群を下げる
    const mapContainer = map.getContainer();
    const ctrlGroup = mapContainer.querySelector<HTMLElement>(
      `.maplibregl-ctrl-${this.position}`,
    );
    if (ctrlGroup) {
      this.ctrlGroupElement = ctrlGroup;
      this.originalCtrlGroupTop = ctrlGroup.style.top;
      this.originalCtrlGroupPadding = ctrlGroup.style.padding;
      ctrlGroup.style.padding = "0";
      ctrlGroup.style.top = `${RIBBON_HEIGHT}px`;
    }

    this.container = container;
    return container;
  }

  onRemove(): void {
    this.container?.remove();
    this.container = undefined;

    // 副作用を元に戻す
    if (this.ctrlGroupElement) {
      this.ctrlGroupElement.style.top = this.originalCtrlGroupTop ?? "";
      this.ctrlGroupElement.style.padding = this.originalCtrlGroupPadding ?? "";
      this.ctrlGroupElement = undefined;
      this.originalCtrlGroupTop = undefined;
      this.originalCtrlGroupPadding = undefined;
    }
  }

  getDefaultPosition(): ControlPosition {
    return this.position;
  }
}

export default ForkMeControl;
