type Result<T> = {
    error: string;
    data: undefined;
} | {
    error: undefined;
    data: T;
};

export { Result };
