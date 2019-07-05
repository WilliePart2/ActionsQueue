import {INotification} from "lib/puremvc/typescript/multicore/interfaces/INotification";
import {IBidirectionalExecutable, IExecutableAction, TAction, TActionHandler} from "./ActionsTypes";
import {BidirectionalExecutable, Executable} from "@src/modules/base/Actions/BaseClasses";

export class Action extends BidirectionalExecutable implements IExecutableAction {
    isActionNonBlocking: boolean;

    constructor(
        public core: () => void,
        public handler: TActionHandler,
        public isRunImmediately: boolean,
        public action: TAction,
    ) {
        super(isRunImmediately);
        this.isActionNonBlocking = !handler;
    }

    run() {
        this.core();
    }

    finish(notification: INotification) {
        if (!this.handler)
            return super.finish();

        this.handler(notification, () => {
            super.finish();
        });
    }
}
