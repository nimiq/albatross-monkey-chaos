import { Action, AsyncAction, Result, State } from "../../types.d";

export type Edge = {
    target: State,
    action: Action,
    weight: number
};

export type AsyncEdge = {
    target: State,
    action: AsyncAction,
};

export type EdgeWithProbability<T> = (Edge & { origin: State, eligibleItems: T[], probability: number });

export type Node<T> = {
    state: State,
    items: T[],
    edges: (Edge | AsyncEdge)[],
}

export type EdgesInput = [State, (Edge | AsyncEdge)[]][]

export class StateMachine<T> {
    nodes = new Map<State, Node<T>>();
    entryEdge: Edge; // Special edge without origin and reprensent how items enter the machine

    constructor(nodes: [State, T[]][], edges: EdgesInput, entryEdge: Edge) {
        nodes.forEach(([state, items]) => {
            this.nodes.set(state, { state, items, edges: [] });
        });

        const checkNode = (state: State | undefined) => {
            if (!state || !this.nodes.get(state)) throw new Error(`No node found for state: ${state}`);
        }

        edges.forEach(([state, edge]) => {
            checkNode(state)
            this.nodes.get(state)!.edges.push(...edge);
        });

        checkNode(entryEdge.target);
        this.entryEdge = entryEdge;
    }

    getItems(state: State): T[] {
        return this.nodes.get(state)!.items;
    }

    getNodeByItem(item: T): Result<{ node: Node<T>, index: number }> {
        for (const [_, node] of this.nodes) {
            if (node.items.includes(item)) {
                const index = node.items.indexOf(item);
                if (index === -1) {
                    return { error: 'Item not found in state machine', data: undefined };
                }
                return { error: undefined, data: { node, index } };
            }
        }

        return { error: 'Item not found in state machine', data: undefined };
    }

    isValidMove(item: T, state: State): Result<{ index: number, node: Node<T> }> {
        const isEntryEdge = state === this.entryEdge.target;
        if (isEntryEdge) {
            return { error: undefined, data: { index: -1, node: this.nodes.get(this.entryEdge.target)! } };
        }

        const nodeResult = this.getNodeByItem(item);
        if (!isEntryEdge && nodeResult.error) {
            return { error: 'Item not found in state machine', data: undefined };
        }

        const { node, index } = nodeResult.data!;
        if (!node.edges.find(edge => edge.target === state)) {
            return { error: `No edges found for ${node.state}->${state} state. The edges targets for ${node.state} are: ${node.edges.map(e => e.target)}`, data: undefined };
        }

        return { error: undefined, data: { node, index } };
    }

    moveItem(item: T, state: State): Result<boolean> {
        const nodeResult = this.getNodeByItem(item);
        if (!nodeResult.error && nodeResult.data!.node.state === state) {
            return { error: undefined, data: true };
        }

        const validMove = this.isValidMove(item, state);
        if (validMove.error) {
            return validMove;
        }
        const { node, index } = validMove.data!;
        node.items.splice(index, 1);
        this.nodes.get(state)!.items.push(item);
        return { error: undefined, data: true };
    }

    insertItem(item: T): Result<boolean> {
        const node = this.nodes.get(this.entryEdge.target);
        if (!node) {
            return { error: `No entry node found for state machine`, data: undefined };
        }
        node.items.push(item);
        return { error: undefined, data: true };
    }

    getPossibleMoves(): EdgeWithProbability<T>[] {
        // Get all the nodes from the state machine
        const nodes = Array.from(this.nodes.values());

        // Filter nodes with at least one item
        const eligibleNodes = nodes.filter(node => node.items.length > 0);
        if (eligibleNodes.length === 0) {
            return [];
        }

        const actions = Object.values(Action);
        const edges = eligibleNodes
            .map((n) => n.edges)
            .flat()
            .filter(e => actions.includes(e.action as Action)) as Edge[];

        const totalWeight = edges.reduce((acc, edge) => acc + edge.weight, 0);
        const edgeProbabilities = edges.map((edge) => edge.weight / totalWeight);

        const edgesWithProbabilities = edges.map((edge, index) => {
            const node = nodes.find((node) => node.edges.includes(edge))!;
            const eligibleItems = eligibleNodes
                .map((n) => n.items)
                .flat();

            return {
                ...edge,
                eligibleItems,
                probability: edgeProbabilities[index],
                origin: node.state!,
            };
        });

        return edgesWithProbabilities;
    }

    getAllItems() {
        return Array.from(this.nodes.values()).map(node => node.items).flat();
    }

    printItemsWithDetails(callback: (item: T) => string) {
        const possibleMoves = this.getPossibleMoves();
        const allItems = this.getAllItems();
        const itemsWithDetails: { item: string; probability: string; state: State; actions: string }[] = [];

        allItems.forEach((item) => {
            const nodeResult = this.getNodeByItem(item);
            if (nodeResult.error) {
                return;
            }
            const node = nodeResult.data!.node;
            const state = node.state;

            const eligibleMoves = possibleMoves.filter((move) => move.eligibleItems.includes(item));
            const totalProbability = eligibleMoves.reduce((acc, move) => acc + move.probability, 0);
            const itemProbability = totalProbability / node.items.length;
            const itemString = callback(item);
            const actions = eligibleMoves.map(({ action, probability }) => `${action}(${(probability * 100).toFixed(3)}%)`).join(' | ');

            itemsWithDetails.push({
                item: itemString,
                state,
                actions,
                probability: `${(itemProbability * 100).toFixed(3)}%`,
            });
        });

        return itemsWithDetails;
    }

}