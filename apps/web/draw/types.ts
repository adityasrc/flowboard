export type Shape =
  | {
    type: "Rect";
    x: number;
    y: number;
    width: number;
    height: number;
    seed: number;
    id: string;
  }
  | {
    type: "Circle";
    centerX: number;
    centerY: number;
    radius: number;
    seed: number;
    id: string;
  }
  | {
    type: "Pencil";
    points: [number, number][];
    seed: number;
    id: string;
  }
  | {
    type: "Line";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    seed: number;
    id: string;
  }
  | {
    type: "Arrow";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    seed: number;
    id: string;
  }
  | {
    type: "Diamond";
    x: number;
    y: number;
    width: number;
    height: number;
    seed: number;
    id: string;
  }
  | {
    type: "Text";
    text: string;
    x: number;
    y: number;
    seed: number;
    id: string;
  };
