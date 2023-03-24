import { MonkeyChaosConfig } from "./monkey-chaos";

export default {
    probabilities: {
        'deactivate': 450,
        'reactivate': 450,
        'create': 50,
        'delete': 50
    },
    count: 100,
    timer: [1, 5]
} satisfies MonkeyChaosConfig;