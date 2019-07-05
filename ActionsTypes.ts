import {INotification} from "lib/puremvc/typescript/multicore/interfaces/INotification";

export type TAction = string | [string, any?, string?];

export type TActionHandler = (notification: INotification, next: () => void) => void;

export type TActionHandlerDef = {
    action: TAction,
    handler: TActionHandler,
    nextAction?: IExecutableAction
};

export type TRunFunc = (args?: any) => void;

export interface IExecutable {
    isRunImmediately: boolean;
    run(args?: any);
}

export interface IExecutableAction extends IBidirectionalExecutable {
    core: () => void;
    isActionNonBlocking: boolean;
    action: TAction;
    handler: TActionHandler;
}

export interface IBidirectionalExecutable extends IExecutable {
    finish(notification: INotification);
    onComplete(handler: Function);
}

export interface INotificationSpec {
    name: string,
    body: any,
    type: string
}

export interface IActionContextIdentifier {
    NAME?: string;
}