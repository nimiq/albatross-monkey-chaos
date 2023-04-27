import { describe, expect, it } from "vitest";
import { getSelector } from ".";
import { Action, State, ValidatorKeys } from "../../types.d";
import { Movement } from "./Selector";
import { Validator } from "./Validator";

function getSelectorWithValidators(addValidators = true, weights: [number, number, number, number] = [1, 1, 1, 1]) {
    const selector = getSelector(weights);
    if (!addValidators) return { selector }

    const validators = Array.from({ length: 3 }).map((_) => {
        const v = new Validator()
        v.createValidator(false);
        return v;
    })
    validators.forEach((validator) => selector.insertItem(validator))
    return { validators, selector }
}

describe('state machine methods', () => {
    it('getItems should return all items in the state machine', () => {
        const { selector, validators } = getSelectorWithValidators();
        const [v1] = validators!;
        selector.moveItem(v1, State.WAITING_DEACTIVATION)
        const items = selector.getAllItems();
        expect(items.length).toBe(3);
        expect(items).toEqual(expect.arrayContaining(validators!));
    });

    it('insertItem should add an item to the entry node', () => {
        const { selector } = getSelectorWithValidators(false);
        const validator = new Validator();
        validator.createValidator(false);
        const result = selector.insertItem(validator);
        expect(result.error).toBeUndefined();
        expect(result.data).toBe(true);
        expect(selector.getItems(selector.entryEdge.target)).toContain(validator);
    });

    it('isValidMove should return error for invalid move', () => {
        const { selector, validators } = getSelectorWithValidators();
        const [v1] = validators!;
        const result = selector.isValidMove(v1, State.DELETED);
        expect(result.error).toBeDefined();
        expect(result.data).toBeUndefined();
    });

    it('isValidMove should return node and index for valid move', () => {
        const { selector, validators } = getSelectorWithValidators();
        const [v1] = validators!;
        const result = selector.isValidMove(v1, State.WAITING_DEACTIVATION);
        expect(result.error).toBeUndefined();
        expect(result.data).toMatchObject({ index: 0, node: selector.nodes.get(State.ACTIVATED) });
    });
});

describe('state selector functionality', () => {
    it('create a selector with 3 validators in initial state', () => {
        const { selector, validators } = getSelectorWithValidators()
        expect(selector.getItems(State.ACTIVATED)).toEqual(validators);
    })

    it('Move one initial validator to deleted'), () => {
        const { selector, validators } = getSelectorWithValidators()
        const [v1, v2, v3] = validators!
        selector.moveItem(v1, State.ACTIVATED)
        const result1 = selector.moveItem(v1, State.DEACTIVATED)
        expect(result1.error).toBeUndefined()
        expect(result1).toBeDefined()
        expect(selector.getItems(State.ACTIVATED).map(v => v.name)).toEqual([v2.name, v3.name])
        expect(2).toBe(selector.nodes.get(State.ACTIVATED)?.items.length)

        // Move directly to deleted should be error
        const result2 = selector.moveItem(v1, State.DELETED)
        expect(result2.error).toBeDefined()
        expect(result2).toBeUndefined()
        expect(selector.getItems(State.DELETED)).toEqual(v1)

        selector.moveItem(v1, State.WAITING_DEACTIVATION)
        selector.moveItem(v1, State.DEACTIVATED)
        selector.moveItem(v1, State.ACTIVATED)
        selector.moveItem(v1, State.WAITING_DEACTIVATION)
        selector.moveItem(v1, State.DEACTIVATED)
        selector.moveItem(v1, State.RETIRED)
        const ok = selector.moveItem(v1, State.DELETED)
        expect(ok.error).toBe(undefined);
        expect(ok.data).toBe(true);
    }

    it('Move one initial validator to deleted. Expect error'), () => {
        const { selector, validators } = getSelectorWithValidators()
        const [v1] = validators!
        const result = selector.moveItem(v1, State.DELETED)
        expect(result.error).toBeDefined()
        expect(result).toBeUndefined()
        expect(selector.getItems(State.DELETED)).toEqual([])
    }

    it('Move to activated and find it'), () => {
        const { selector, validators } = getSelectorWithValidators()
        const [v1] = validators!
        const result2 = selector.moveItem(v1, State.ACTIVATED)
        expect(result2.error).toBeUndefined()
        expect(result2).toBe(true)
        expect(selector.getItems(State.ACTIVATED)).toEqual([v1])
        expect(selector.getNodeByItem(v1)).toEqual({ state: State.ACTIVATED, items: [v1] })
    }
})

describe('state selector probabilities', () => {
    it('should choose a CREATE since there are no eligible validators', () => {
        const { selector } = getSelectorWithValidators(false)
        const result = selector.chooseMovement()
        const expected: Movement<ValidatorKeys> = {
            action: Action.CREATE,
            item: undefined,
            target: State.ACTIVATED
        }
        expect(result).toMatchObject(expected)
    });

    it('should choose a DEACTIVATED', () => {
        const { selector } = getSelectorWithValidators(true, [0, 1, 1, 0])
        const result = selector.chooseMovement()
        const expected: Omit<Movement<Validator>, 'item'> = {
            action: Action.DEACTIVATE,
            target: State.WAITING_DEACTIVATION
        }
        expect(result).toMatchObject(expected)
    });

    it('should choose a validator in the ACTIVATED state since it has more weight', () => {
        for (let i = 0; i < 8; i++) {
            const { selector, validators } = getSelectorWithValidators(true, [0, 0, 1, 0])
            const [v1] = validators!
            selector.moveItem(v1, State.WAITING_DEACTIVATION)
            selector.moveItem(v1, State.DEACTIVATED)
            const result = selector.chooseMovement()
            const expected: Movement<Validator> = {
                action: Action.REACTIVATE,
                item: v1,
                target: State.ACTIVATED,
                origin: State.DEACTIVATED
            }
            expect(result).toMatchObject(expected)
        }
    });

    it('should choose a validator in the DEACTIVATED state since it has the only one with a probability and with at least one validator', () => {
        for (let i = 0; i < 8; i++) {
            const { selector, validators } = getSelectorWithValidators(true, [0, 1, 10000000, 0])
            const [v1] = validators!

            selector.moveItem(v1, State.ACTIVATED)
            selector.moveItem(v1, State.WAITING_DEACTIVATION)
            selector.moveItem(v1, State.DEACTIVATED)

            const result = selector.chooseMovement()
            const expected = selector.createMovement(Action.REACTIVATE, v1, State.DEACTIVATED, State.ACTIVATED)
            expect(result).toMatchObject(expected)
        }
    });

    it('should choose the from ACTIVATED since the others states have weight 0', () => {
        for (let i = 0; i < 8; i++) {
            const { selector, validators } = getSelectorWithValidators(true, [0, 1, 1, 0])
            const [v1, v2, v3] = validators!

            selector.moveItem(v1, State.ACTIVATED)
            selector.moveItem(v1, State.WAITING_DEACTIVATION)
            selector.moveItem(v1, State.DEACTIVATED)
            selector.moveItem(v1, State.RETIRED)
            selector.moveItem(v1, State.WAITING_DELETION)
            selector.moveItem(v1, State.DELETED)

            selector.moveItem(v2, State.ACTIVATED)
            selector.moveItem(v2, State.WAITING_DEACTIVATION)
            selector.moveItem(v2, State.DEACTIVATED)
            selector.moveItem(v2, State.RETIRED)

            selector.moveItem(v3, State.ACTIVATED)
            selector.moveItem(v3, State.WAITING_DEACTIVATION)
            selector.moveItem(v3, State.DEACTIVATED)

            const result = selector.chooseMovement()
            expect(result.item).toBe(v3)
            expect([Action.REACTIVATE, Action.RETIRE]).contain(result.action)
        }
    });
})

