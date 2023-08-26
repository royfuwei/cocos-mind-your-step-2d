import { _decorator, Component, EventMouse, Input, input, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40;

@ccclass('PlayerController')
export class PlayerController extends Component {
    private _startJump: boolean = false;
    private _jumpStep: number = 0;
    private _curJumpTime: number = 0;
    private _jumpTime: number = 0.1;
    private _curJumpSpeed: number = 0;
    private _curPos: Vec3 = new Vec3();
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);
    private _targetPos: Vec3 = new Vec3();
    start() {
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    /**
     * 根據每次更新計算角色最新位置
     * @param deltaTime 
     */
    update(deltaTime: number) {
        if (!this._startJump) return;
        this._curJumpTime += deltaTime; // 累計總跳躍時間
        if (this._curJumpTime > this._jumpTime) {
            this.stepEnd();
        } else {
            this.stepTween(deltaTime);
        }
    }

    private stepEnd() {
        this.node.setPosition(this._targetPos); // 強制位置到終點
        this._startJump = false; // 清除跳躍狀態
    }

    private stepTween(deltaTime: number) {
        this.node.getPosition(this._curPos); 
        this._deltaPos.x = this._curJumpSpeed * deltaTime; // 每一幀依據速度和時間計算位移
        Vec3.add(this._curPos, this._curPos, this._deltaPos); // 應用這個位移
        this.node.setPosition(this._curPos); // 給角色位置
    }

    /**
     * 滑鼠監聽
     * @param event EventMouse
     */
    onMouseUp(event: EventMouse) {
        if(event.getButton() === 0) {
            this.jumpByStep(1);
        } else if (event.getButton() === 2) {
            this.jumpByStep(2);
        }
    }

    /**
     * 步數跳躍
     * @param step 
     */
    jumpByStep(step: number) {
        if (this._startJump) return;
        this._startJump = true; // 標記開始跳躍
        this._jumpStep = step; // 
        this._curJumpTime = 0; // 重置開始跳躍時間
        this._curJumpSpeed = this._jumpStep / this._jumpTime; // 依據時間計算速度
        this.node.getPosition(this._curPos); // 取得角色當前位置
        // Vector3 縮寫
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0)); // 計算出目標位置
    }
}

