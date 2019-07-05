import {BidirectionalExecutable} from "@src/modules/base/Actions/BaseClasses";
import {IBidirectionalExecutable} from "@src/modules/base/Actions/ActionsTypes";

export class ActionsBatch extends BidirectionalExecutable {
    static COMPLETE_AFTER_FIRST = 'COMPLETE_AFTER_FIRST';
    static AWAIT_FOR_ALL = 'AWAIT_FOR_ALL';

    private _isBatchFinished: boolean = false;

    constructor(
        private actions: IBidirectionalExecutable[],
        public isRunImmediately: boolean,
        public type: string,
    ) {
        super(isRunImmediately);
        this.init();
    }

    private init() {
        switch (this.type) {
            case ActionsBatch.COMPLETE_AFTER_FIRST:
                this.actions.forEach((action: IBidirectionalExecutable) => {
                    action.onComplete(() => this.finish());
                });
                break;
            case ActionsBatch.AWAIT_FOR_ALL:
                Promise.all(
                    this.actions.map((action: IBidirectionalExecutable) => {
                        return new Promise((resolve, reject) => {
                            action.onComplete(resolve);
                        });
                    })
                ).then(() => this.finish());
                break;
            default:
                throw new Error('Actions batch has created without "type" thus will not execute');
        }

        this.actions.forEach((action: IBidirectionalExecutable) => action.run())
    }

    finish(args?: any) {
        if (this._isBatchFinished)
            return;

        this._isBatchFinished = true;
        super.finish(args);
    }
}
