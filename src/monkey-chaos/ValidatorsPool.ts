import { Action, Probabilities, State, ValidatorKeys } from "../types";

const ACTIONS_WITH_VALIDATOR: Action[] = ['deactivate', 'delete', 'reactivate'];

type Victim = {
    action: Action,
    validator: ValidatorKeys
    onSucess: () => void,
} | {
    action: 'create',
    validator: undefined
    onSucess: (key: ValidatorKeys) => void,
}

type ProbabilitiesRanges = { range: [number, number], action: Action}[];

const graph: Record<Action, State> = {
    'create': 'active',
    'deactivate': 'deactivate',
    'reactivate': 'active',
    'delete': 'deleted',
}

export class ValidatorsPool {
    probabilities: Probabilities;
    actions: Action[] = ['deactivate', 'reactivate', 'create', 'delete'];
    active: Set<ValidatorKeys>;
    deactivate: Set<ValidatorKeys>;
    requestedDeactivate: Set<ValidatorKeys>; // Validators cannot change status from deactivate to active immediately
    deleted: Set<ValidatorKeys>;

    constructor(probabilities: Probabilities) {
        this.probabilities = probabilities

        this.active = new Set<ValidatorKeys>()
        this.deactivate = new Set<ValidatorKeys>()
        this.requestedDeactivate = new Set<ValidatorKeys>()
        this.deleted = new Set<ValidatorKeys>()
    }

    changeValidatorStatus(validator: ValidatorKeys, status: State) {
        switch (status) {
            case 'active':
                this.active.add(validator);
                this.deactivate.delete(validator);
                this.requestedDeactivate.delete(validator);
                this.deleted.delete(validator);
                break;
            case 'deactivate':
                this.active.delete(validator);
                this.requestedDeactivate.add(validator);
                this.deleted.delete(validator);
                break;
            case 'deleted':
                this.active.delete(validator);
                this.deactivate.delete(validator);
                this.requestedDeactivate.delete(validator);
                this.deleted.add(validator);
                break;
        }
    }

    distributeProbabilities(probabilities: Probabilities, ignoreAction: Action): Probabilities {
        // if action is create and we have { create: 500, delete: 500, activate: 0, deactivate: 0}, then we need to change it to { create: 1000, delete: 0, activate: 0, deactivate: 0}
        // if action is delete and we have { create: 250, delete: 250, activate: 250, deactivate: 250}, then we need to change it to { create: 0, delete: 333, activate: 333, deactivate: 333}
        const updatedProbabilities: Probabilities = { ...probabilities };
        const sumOfOtherActions = Object.keys(updatedProbabilities)
            .filter((action) => action !== ignoreAction)
            .reduce((sum, action) => sum + updatedProbabilities[action as Action], 0);

        const redistributedValue = probabilities[ignoreAction];
        updatedProbabilities[ignoreAction] = 0;

        Object.keys(updatedProbabilities).forEach((action) => {
            if (action !== ignoreAction) {
                updatedProbabilities[action as Action] += Math.round((redistributedValue / sumOfOtherActions) * probabilities[action as Action]) || 0;
            }
        });

        return updatedProbabilities;
    }

    // 1. We cannot choose deactivate if there are no active validators
    // 2. We cannot choose delete if there are no deactivated validators
    // 3. We cannot choose reactivate if there are no deactivated validators
    getProbabilities(): ProbabilitiesRanges {
        let probabilities = this.probabilities;
    
        if (this.active.size === 0) {
            probabilities = this.distributeProbabilities(probabilities, 'deactivate');
        }
    
        if (this.deactivate.size === 0) {
            probabilities = this.distributeProbabilities(probabilities, 'reactivate');
        }
    
        if (this.deactivate.size === 0) {
            probabilities = this.distributeProbabilities(probabilities, 'delete');
        }

        const probabilitiesRanges: ProbabilitiesRanges = this.actions.reduce((acc, action, index) => {
            const start = acc[index - 1]?.range?.[1] || 0;
            const end = start + probabilities[action];
            return [...acc, { range: [start, end], action }];
        }, [] as ProbabilitiesRanges);
        return probabilitiesRanges;
    }

    private getRandomAction() {
        const probabilities = this.getProbabilities();
        const total = probabilities[probabilities.length - 1].range[1];
        const random = Math.floor(Math.random() * total);
        const action = probabilities.find(({ range }) => range && range[0] <= random && range[1] > random)?.action || 'create';
        return action;
    }

    private getValidators(action: Action) {
        switch (action) {
            case 'deactivate':
                return Array.from(this.active);
            case 'delete':
                return Array.from(this.active).concat(Array.from(this.deactivate));
            case 'reactivate':
                return Array.from(this.deactivate);
            default:
                return [];
        }
    }

    private getRandomValidator(action: Action) {
        const validators = this.getValidators(action);
        const random = Math.floor(Math.random() * validators.length);
        return validators[random];
    }

    private doesRequireValidator(action: Action) {
        return ACTIONS_WITH_VALIDATOR.includes(action);
    }

    getState(action: Action) {
        return graph[action];
    }

    getVictim(): Victim {
        const action = this.getRandomAction();
        if (!this.doesRequireValidator(action)) {
            return {
                action,
                validator: undefined,
                onSucess: (keys: ValidatorKeys) => {
                    this.changeValidatorStatus(keys, this.getState(action));
                }
            } as Victim;
        }
        const validator = this.getRandomValidator(action);
        const onSucess = () => this.changeValidatorStatus(validator, this.getState(action));
        return { action, validator, onSucess };
    }

    processDeactivate() {
        this.deactivate = new Set([...this.deactivate, ...this.requestedDeactivate]);
        this.requestedDeactivate = new Set();
    }

    size() {
        return this.active.size + this.deactivate.size + this.requestedDeactivate.size + this.deleted.size + this.deleted.size;
    }
}