import {INotification} from "lib/puremvc/typescript/multicore/interfaces/INotification";
import {IFacade} from "lib/puremvc/typescript/multicore/interfaces/IFacade";
import {Notifier} from "lib/puremvc/typescript/multicore/patterns/observer/Notifier";
import {ICommand} from "lib/puremvc/typescript/multicore/interfaces/ICommand";
import {INotifier} from "lib/puremvc/typescript/multicore/interfaces/INotifier";
import {Notification} from "lib/puremvc/typescript/multicore/patterns/observer/Notification";
import {Facade} from "lib/puremvc/typescript/multicore/patterns/facade/Facade";
import {IVLNotifier} from "@src/modules/base/interfaces/IVLObserver";
import {Action} from "@src/modules/base/Actions/Action";
import {
    IActionContextIdentifier, IBidirectionalExecutable,
    IExecutableAction, INotificationSpec,
    TAction,
    TActionHandler
} from "@src/modules/base/Actions/ActionsTypes";
import {ActionsQueue} from "@src/modules/base/Actions/ActionsQueue";
import {ActionsBatch} from "@src/modules/base/Actions/ActionsBatch";

export class ActionController {
    private static _facade: IFacade;
    private static _controllersMap: Map<string, ActionController> = new Map();
    private _handlersSet: IExecutableAction[] = [];
    private _context: IFacade;
    private _complemeIdentifier: string;

    /**
     * Should be run in startup to provide facade for registration listeners
     * @param facade
     */
    static init(facade: IFacade) {
        this._facade = facade;
    }

    static getFacade() {
        return this._facade;
    }

    static registerContext(contextIdentifier: IActionContextIdentifier | string): void {
        let identifier: string = this.getContextName(contextIdentifier);


        if (this._controllersMap.get(identifier))
            throw new Error(`Action context with name ${identifier} already registered`);

        this._controllersMap.set(identifier, new this(identifier));
    }

    static getContext(contextIdentifier: IActionContextIdentifier | string): ActionController {
        return this._controllersMap.get(this.getContextName(contextIdentifier));
    }

    private static getContextName(contextIdentifier: IActionContextIdentifier | string): string {
        if (typeof contextIdentifier === 'string')
            return contextIdentifier;

        return contextIdentifier.NAME || contextIdentifier.constructor.name;
    }

    constructor(private _contextIdentifier: string) {
        this._context = ActionController.getFacade();
        this.createControllerContext();
    }

    static queue(actions: IExecutableAction[], runImmediately: boolean = true): IBidirectionalExecutable {
        return new ActionsQueue(actions, runImmediately);
    }

    static batch(actions: IExecutableAction[], runImmediately: boolean = true , type: string = ActionsBatch.AWAIT_FOR_ALL): IBidirectionalExecutable {
        return new ActionsBatch(actions, runImmediately, type);
    }

    action(actionNotification: TAction, handler?: TActionHandler, runImmediately = true): IExecutableAction {
        let action: IExecutableAction = new Action(
            () => this.sendNotificationFromAction(actionNotification),
            handler,
            runImmediately,
            actionNotification
        );

        this._handlersSet.push(action);

        return action;
    }

    private getActionsParts(action: TAction): INotificationSpec {
        let [ name, body = null, type = null ] = Array.isArray(action) ? action : [action];

        return {
            name,
            body,
            type
        };
    }

    private getActionNotificationName(actionNotification: TAction): string {
        let { name } = this.getActionsParts(actionNotification);
        return name;
    }

    private sendNotificationFromAction(action: TAction) {
        let { name, body, type } = this.getActionsParts(action);
        this._context.sendNotification(name, body, type);
    }

    finishAction(actionName: string) {
        this._context.sendNotification(this._contextIdentifier, actionName);
    }

    private createControllerContext() {
        let self = this;
        this._context.registerCommand(
            this._contextIdentifier,
            class extends Notifier implements ICommand, INotifier {
                execute(notification: INotification): void {
                    for (let i = 0; i < self._handlersSet.length; i++) {
                        let handler: IExecutableAction = self._handlersSet[i];
                        if (self.getActionNotificationName(handler.action) !== notification.getBody())
                            continue;

                        // handler.handler(
                        //     new Notification(notification.getBody(), notification.getType()),
                        handler.finish(new Notification(notification.getBody(), notification.getType()));
                        // );

                        self._handlersSet.splice(i, 1);
                        break;
                    }
                }
            }
        );
    }

    /**
     * @deprecated
     */
    // private static runAction(action: IExecutableAction) {
    //     if (!action)
    //         return;
    //
    //     if (action.isActionNonBlocking) {
    //         action.run();
    //         this.runAction(action.nextAction);
    //     } else {
    //         action.run();
    //     }
    // }

    destroyController() {
        this._context.removeCommand(this.getActionNotificationName(this._contextIdentifier));
        this._handlersSet = [];
    }
}

// export class ChainableExecutable extends Executable implements IChainableExecutable {
//     constructor(
//         // private _run: TRunFunc,
//         public isRunImmediately: boolean,
//         public nextAction?: IChainableExecutable
//     ) {
//         super(isRunImmediately);
//         // if (isRunImmediately)
//         //     this.run(this);
//     }
// }
