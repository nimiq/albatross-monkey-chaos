import { Action, AsyncAction, State } from "../../types.d";
import { Selector } from "./Selector";
import { Edge, EdgesInput } from "./StateMachine";
import { Validator } from "./Validator";

export function getSelector(weights: number[]) {
    if (weights.length !== 4 && weights.length !== 5) {
        throw new Error(`Weights must be an array of 4 numbers, got: ${weights}`)
    }

    const nodes = Object.values(State).map((state) => [state, []] as [State, Validator[]])
    const entryEdge: Edge = { target: State.ACTIVATED, weight: weights[0], action: Action.CREATE }
    const edges: EdgesInput = [
        [State.ACTIVATED, [{ action: Action.DEACTIVATE, target: State.WAITING_DEACTIVATION, weight: weights[1] }]],
        [State.WAITING_DEACTIVATION, [{ action: AsyncAction.ASYNC_DEACTIVATE, target: State.DEACTIVATED }]],
        [State.DEACTIVATED, [
            { action: Action.RETIRE, target: State.RETIRED, weight: weights[3] },
            { action: Action.REACTIVATE, target: State.ACTIVATED, weight: weights[2] }
        ]],
        [State.RETIRED, [{ action: AsyncAction.ASYNC_DELETE, target: State.DELETED }]],
    ]
    const selector = new Selector<Validator>(nodes, edges, entryEdge);
    return selector
}