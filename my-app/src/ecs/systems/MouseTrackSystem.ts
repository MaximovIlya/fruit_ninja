import type { MousePosition } from "../../types";

export class MouseTrackSystem {
    private _mousePos: MousePosition = null;


    get mousePosition(): MousePosition {
        return this._mousePos;
    }
    
    set mousePosition(mousePos: MousePosition) {
        this._mousePos = mousePos;
    }
}