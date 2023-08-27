import { _decorator, Component, EventMouse, Input, input, Node, Vec3, Animation } from 'cc';
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40;
export const EMIT_JUMP_END = 'jump:end';

enum BodyAnimationEnum {
    ONE_STEP = 'oneStep',
    TWO_STEP = 'twoStep',
}

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

    // 紀錄多少步
    private _curMoveIndex = 0;

    @property(Animation)
    BodyAnimation: Animation = null;

    start() {
        // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this); // 改由外部控制
    }

    reset() {
        this._curMoveIndex = 0;
    }

    /**
     * 增加結束監聽事件
     */
    onOnceJumpEnd() {
        this.node.emit(EMIT_JUMP_END, this._curMoveIndex);
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

    setInputActive(active: boolean) {
        if (active) {
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    /**
     * 跳躍動畫
     * @param step 跳躍方式
     * @returns 
     */
    private playBodyAnimation(step: number) {
        if (!this.BodyAnimation) return;
        if (step === 1) {
            this.BodyAnimation.play(BodyAnimationEnum.ONE_STEP);
        }
        if (step === 2) {
            this.BodyAnimation.play(BodyAnimationEnum.TWO_STEP);
        }
    }

    private stepEnd() {
        this.node.setPosition(this._targetPos); // 強制位置到終點
        this._startJump = false; // 清除跳躍狀態
        this.onOnceJumpEnd();
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

        const clipName = step === 1 ? BodyAnimationEnum.ONE_STEP : BodyAnimationEnum.TWO_STEP;
        const state = this.BodyAnimation.getState(clipName);
        this._jumpTime = state.duration;  // 跳躍動畫時間
        
        this._curJumpSpeed = this._jumpStep * BLOCK_SIZE / this._jumpTime; // 依據時間計算速度
        this.node.getPosition(this._curPos); // 取得角色當前位置
        // Vector3 縮寫
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0)); // 計算出目標位置

        // run body animation
        this.playBodyAnimation(step);

        this._curMoveIndex += step;
    }
}

