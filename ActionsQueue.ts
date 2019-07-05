import {BidirectionalExecutable, Executable} from "@src/modules/base/Actions/BaseClasses";
import {IBidirectionalExecutable, IExecutableAction} from "@src/modules/base/Actions/ActionsTypes";
import {INotification} from "lib/puremvc/typescript/multicore/interfaces/INotification";


export class ActionsQueue extends BidirectionalExecutable {
    // private actions: (IBidirectionalExecutable | IExecutableAction)[];

    constructor(private actions: (IBidirectionalExecutable | IExecutableAction)[], public isRunImmediately: boolean) {
        super(false);
        // this.actions = actions;
        this.init();
        if (isRunImmediately)
            this.run();
        // for (let i = 0; i < this.actions.length; i++) {
        //     let currentAction: IBidirectionalExecutable | IExecutableAction = this.actions[i];
        //     if (currentAction.isRunImmediately)
        //         throw new Error('In actions queue passed action which already run');
        //
        //     currentAction.onComplete(() => this.runAction(this.actions[i + 1]));
        // }
    }

    run(args?: any) {
        this.runAction(this.actions[0]);
    }

    private init() {
        for (let i = 0; i < this.actions.length; i++) {
            let currentAction: IBidirectionalExecutable | IExecutableAction = this.actions[i];
            if (currentAction.isRunImmediately)
                throw new Error('In actions queue passed action which already run');

            currentAction.onComplete(() => this.runAction(this.actions[i + 1]));
        }
    }

    private runAction(action: IBidirectionalExecutable | IExecutableAction) {
        if (!action) {
            return this.finish();
        }

        action.run();

        /**
         * If action 'non blocking' queue will immediately run next action
         */
        if ((action as IExecutableAction).isActionNonBlocking)
            action.finish(null);
    }
}