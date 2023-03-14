import type { ThunkAction } from "../setup";
import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { State as RootState } from "../setup";
import { createObjectThatThrowsIfAccessed } from "redux-clean-architecture";
import { removeDuplicates } from "evt/tools/reducers/removeDuplicates";

export type State = {
    profile: State.Profile | undefined
};

namespace State {
    export type Profile = "agent" | "CIO"
}

export const name = "searchByProfile";

export type UpdateFilterParams<
    K extends UpdateFilterParams.Key = UpdateFilterParams.Key
> = {
    key: K;
    value: State[K];
};

export namespace UpdateFilterParams {
    export type Key = keyof Omit<State, "softwares">;
}

export const { reducer, actions } = createSlice({
    name,
    "initialState": createObjectThatThrowsIfAccessed<State>({
        "debugMessage": "Not yet initialized"
    }),
    "reducers": {
        "initialized": (
            _state,
        ) => {

            return {
                profile: undefined
            };
        },
        "filterUpdated": (state, { payload }: PayloadAction<UpdateFilterParams>) => {
            const { key, value } = payload;

            (state as any)[key] = value;
        }
    }
});

export const thunks = {
    "updateFilter":
        <K extends UpdateFilterParams.Key>(
            params: UpdateFilterParams<K>
        ): ThunkAction<void> =>
        (...args) => {
            const [dispatch] = args;
            dispatch(actions.filterUpdated(params));
        }
};

export const privateThunks = {
    "initialize":
        (): ThunkAction =>
        async (...args) => {
            const [dispatch] = args;

            dispatch(
                actions.initialized()
            );
        }
};

export const selectors = (() => {
    const readyState = (rootState: RootState) => {
        const state = rootState[name];

        return state;
    };


    const profile = createSelector(
        readyState,
        readyState => readyState?.profile
    );

    return { profile };
})();
