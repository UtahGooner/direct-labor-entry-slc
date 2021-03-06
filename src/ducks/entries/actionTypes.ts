import {ActionInterface, ActionPayload} from "chums-ducks";
import {Employee, Entry, ITOrder, WorkOrder} from "../common-types";
import {ThunkAction} from "redux-thunk";
import {RootState} from "../index";

export interface EntryPayload extends ActionPayload {
    entry?: Entry,
    nextEntry?: Entry,
    savedEntry?: Entry,
    list?: Entry[],
    id?: number,
    employee?: Employee | null,
    date?: string | null,
    change?: object,
    workCenters?: string[],
    workOrder?: WorkOrder,
    itOrders?: ITOrder[]
}

export interface EntryAction extends ActionInterface {
    payload?: EntryPayload,
    status?: string,
}

export interface EntryThunkAction extends ThunkAction<any, RootState, unknown, EntryAction> {
}
