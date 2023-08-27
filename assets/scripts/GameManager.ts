import { _decorator, Component, Node, Prefab, CCInteger, instantiate, Label, Vec3 } from 'cc';
import { BLOCK_SIZE, EMIT_JUMP_END, PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

/**
 * prfab box 狀態
 */
enum BoxTypeEnum {
    /**
     * 石頭
     */
    BOX_STONE,
    /**
     * 空的 Box
     */
    BOX_NONE,
}

enum GameStatusEnum {
    GS_INIT,
    GS_PLAYING,
    GS_END,
}

@ccclass('GameManager')
export class GameManager extends Component {

    // 使用已建好的預置體
    @property({ type: Prefab })
    public boxPrefab: Prefab = null;

    @property({ type: CCInteger })
    public roadLength: number = 50;

    // 遊戲控制器
    @property({ type: PlayerController })
    private playerCtl: PlayerController | null = null;

    // startMenu
    @property({ type: Node })
    private startMenu: Node | null = null;

    // 計步器
    @property({ type: Label })
    private stepLabel: Label | null = null;

    // 產生的路線
    private _roads: BoxTypeEnum[] = [];

    start() {
        this.setCurStatue(GameStatusEnum.GS_INIT);
        this.playerCtl?.node.on(EMIT_JUMP_END, this.onPlayerJumpEnd, this);
    }

    update(deltaTime: number) {
        
    }

    generateRoad() {
        this.initial();
        this.randomRoads();
        this.genNodeChildByRoads();
    }

    setCurStatue(state: GameStatusEnum) {
        switch(state) {
            case GameStatusEnum.GS_INIT:
                this.init();
                break;
            case GameStatusEnum.GS_PLAYING:
                this.playing();
                break;
            case GameStatusEnum.GS_END:
                this.end();
                break;
        };
    }

    private init() {
        if (this.startMenu) this.startMenu.active = true;
        // this.generateRoad();
        this.initial();

        if (this.playerCtl) {
            this.playerCtl.setInputActive(false);
            this.playerCtl.node.setPosition(Vec3.ZERO);
            this.playerCtl.reset();
        }
    }

    onStartButtonClicked() {
        this.setCurStatue(GameStatusEnum.GS_PLAYING);
    }

    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepLabel) {
            this.stepLabel.string = `Step: ${moveIndex}`;
        }
        this.gameRule(moveIndex);
    }

    private gameRule(moveIndex: number) {
        if (moveIndex > this.roadLength) {
            this.setCurStatue(GameStatusEnum.GS_INIT);
            return;
        }
        const road = this._roads[moveIndex];
        if (road === BoxTypeEnum.BOX_NONE) {
            this.setCurStatue(GameStatusEnum.GS_END);
        }
    }

    private playing() {
        this.generateRoad();

        if (this.startMenu) {
            this.startMenu.active = false;
        }

        if (this.stepLabel) this.stepLabel.string = 'Step: 0';

        setTimeout(() => {
            if (this.playerCtl) {
                this.playerCtl.setInputActive(true);
            }
        }, 0.1);
    }

    private end() {}

    /**
     * 產生遊戲方塊亂數場景
     */
    private randomRoads() {
        for (let i = 1; i < this.roadLength; i++) {
            const lastRoad = this._roads[i - 1];
            if (lastRoad === BoxTypeEnum.BOX_NONE) {
                this._roads.push(BoxTypeEnum.BOX_STONE);
            } else {
                this._roads.push(Math.floor(Math.random() * 2));
            }
        }
    }

    /**
     * 根據 _roads 產生遊戲方塊場景
     */
    private genNodeChildByRoads() {
        for (let i = 0; i < this._roads.length; i++) {
            const road = this._roads[i];
            const block = this.spawnBlockByType(road);
            if (!block) continue;
            this.node.addChild(block);
            block.setPosition(i * BLOCK_SIZE, 0, 0);
        }
    }

    /**
     * 根據 BoxTypeEnum 產生方塊
     * @param type BoxTypeEnum
     */
    private spawnBlockByType(type: BoxTypeEnum): Node | null {
        if (!this.boxPrefab) return null;

        let block: Node | null = null;

        switch (type) {
            case BoxTypeEnum.BOX_STONE:
                block = instantiate(this.boxPrefab);
                break;
        }
        return block;
    }

    /**
     * 初始化遊戲場景
     */
    private initial() {
        this.node.removeAllChildren();
        this._roads = [];
        // startPos
        this._roads.push(BoxTypeEnum.BOX_STONE);
    }
}

