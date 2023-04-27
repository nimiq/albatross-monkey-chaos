import { Action, AsyncAction, State } from "../../types.d";
import { AsyncEdge, Edge, EdgeWithProbability, EdgesInput, StateMachine } from "./StateMachine";

type BaseMovement<T> = {
  origin?: State;
  target: State;
  item: T | undefined;
};

export type Movement<T> = BaseMovement<T> & {
  action: Action;
};

export type AsyncExecution<T> = BaseMovement<T> & {
  action: AsyncAction;
};

export class Selector<T> extends StateMachine<T> {
  constructor(nodes: [State, T[]][], edges: EdgesInput, entryEdge: Edge) {
    super(nodes, edges, entryEdge);
  }

  // Returns the default execution which does not require an item.
  // An item must be created outside the context of the state machine
  getDefaultMovement(): Movement<T> {
    return { ...this.entryEdge, item: undefined };
  }

  private weightedRandomChoice(edges: EdgeWithProbability<T>[]): EdgeWithProbability<T> {
    const sumWeights = edges.map(e => e.weight).reduce((a, b) => a + b, 0);
    const randomValue = Math.random() * sumWeights;
    let weightAccumulator = 0;
    for (const edge of edges) {
      weightAccumulator += edge.weight
      if (randomValue <= weightAccumulator) {
        return edge;
      }
    }
    return edges[edges.length - 1];
  }

  chooseMovement(): Movement<T> {
    const possibleMoves = this.getPossibleMoves();
    if (possibleMoves.length === 0) return this.getDefaultMovement();
    const execution = this.weightedRandomChoice(possibleMoves);
    const eligibleItems = this.nodes.get(execution.origin)!.items;
    const item = eligibleItems[Math.floor(Math.random() * eligibleItems.length)];
    return this.createMovement(execution.action, item, execution.origin, execution.target);
  }

  createMovement(action: Action, item: T, origin: State, target: State): Movement<T> {
    return { action, item, target, origin };
  }

  // Sum of all the items in the state machine
  size(): number {
    return Array.from(this.nodes.values()).reduce((acc, node) => acc + node.items.length, 0);
  }
}
