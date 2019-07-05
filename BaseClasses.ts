import {IBidirectionalExecutable, IExecutable} from "@src/modules/base/Actions/ActionsTypes";
import {INotification} from "lib/puremvc/typescript/multicore/interfaces/INotification";

export class Executable implements IExecutable {
    constructor(public isRunImmediately: boolean) {
        if (isRunImmediately)
            this.run();
    }

    /**
     * @abstract
     */
    run(args?: any) {

    }
}

export class BidirectionalExecutable extends Executable implements IBidirectionalExecutable {
    private _onComplete: () => void;

    finish(args?: any) {
        if (this._onComplete)
            this._onComplete();
    }

    onComplete(handler: () => void) {
        this._onComplete = handler;
    }
}