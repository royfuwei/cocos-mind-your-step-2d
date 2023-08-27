import { _decorator, Component, Node, Prefab, CCInteger, instantiate } from 'cc';
import { BLOCK_SIZE } from './PlayerController';
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

@ccclass('GameManager')
export class GameManager extends Component {

    // 使用已建好的預置體
    @property({ type: Prefab })
    public boxPrefab: Prefab = null;

    @property({ type: CCInteger })
    public roadLength: number = 50;

    // 產生的路線
    private _roads: BoxTypeEnum[] = [];

    start() {
        this.generateRoad();
    }

    update(deltaTime: number) {
        
    }

    generateRoad() {
        this.initial();
        this.randomRoads();
        this.genNodeChildByRoads();
    }

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

