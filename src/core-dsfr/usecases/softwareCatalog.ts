import type { ThunkAction, State as RootState } from "../setup";
import { createSelector } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { createObjectThatThrowsIfAccessed } from "redux-clean-architecture/tools/createObjectThatThrowsIfAccessed";
import type { PayloadAction } from "@reduxjs/toolkit";
import { objectKeys } from "tsafe/objectKeys";
import memoize from "memoizee";
import { id } from "tsafe/id";
import { Fzf } from "fzf";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";

export type SoftwareCatalogState = {
    softwares: SoftwareCatalogState.Software.Internal[];

    search: string;
    sort: SoftwareCatalogState.Sort | undefined;
    /** Used in organizations: E.g: DINUM */
    organization: string | undefined;
    /** E.g: JavaScript */
    category: string | undefined;
    environment: SoftwareCatalogState.Environment | undefined;
    prerogatives: SoftwareCatalogState.Prerogative[];
};

export namespace SoftwareCatalogState {
    export type Sort =
        | "added time"
        | "update time"
        | "last version publication date"
        | "user count"
        | "referent count"
        | "user count ASC"
        | "referent count ASC";

    export type Environment = "linux" | "windows" | "mac" | "browser" | "smartphone";

    export type Prerogative =
        | "isInstallableOnUserTerminal"
        | "isPresentInSupportContract"
        | "isFromFrenchPublicServices"
        | "doRespectRgaa"
        | "isTestable";

    export namespace Software {
        type Common = {
            softwareId: number;
            logoUrl: string | undefined;
            softwareName: string;
            softwareDescriptions: string;
            lastVersion:
                | {
                      semVer: string;
                      publicationTime: number;
                  }
                | undefined;
            referentsCount: number;
            userCounts: number;
            parentSoftware:
                | {
                      softwareName: string;
                      softwareId: string;
                  }
                | undefined;
            testUrl: string | undefined;
        };

        export type External = Common & {
            prerogatives: Record<Prerogative, boolean>;
        };

        export type Internal = Common & {
            addedTime: number;
            updateTime: number;
            categories: string[];
            organizations: string[];
            environments: Record<Environment, boolean>;
            //NOTE: We can deduce if it's installable on user terminal by looking at the environments
            prerogatives: Record<
                Exclude<Prerogative, "isInstallableOnUserTerminal">,
                boolean
            >;
            search: string;
        };
    }
}

export const name = "softwareCatalog" as const;

export type ChangeValueParams<K extends ChangeValueParams.Key = ChangeValueParams.Key> = {
    key: K;
    value: SoftwareCatalogState[K];
};

export namespace ChangeValueParams {
    export type Key = keyof Omit<SoftwareCatalogState, "softwares">;
}

export const { reducer, actions } = createSlice({
    name,
    "initialState": createObjectThatThrowsIfAccessed<SoftwareCatalogState>(),
    "reducers": {
        "initialized": (
            _state,
            {
                payload,
            }: PayloadAction<{ softwares: SoftwareCatalogState.Software.Internal[] }>,
        ) => {
            const { softwares } = payload;

            return {
                softwares,
                "search": "",
                "sort": undefined,
                "organization": undefined,
                "category": undefined,
                "environment": undefined,
                "prerogatives": [],
            };
        },
        "valueUpdated": (state, { payload }: PayloadAction<ChangeValueParams>) => {
            const { key, value } = payload;

            (state as any)[key] = value;
        },
    },
});

export const thunks = {
    "updateFilter":
        <K extends ChangeValueParams.Key>(
            params: ChangeValueParams<K>,
        ): ThunkAction<void> =>
        (...args) => {
            const [dispatch] = args;
            dispatch(actions.valueUpdated(params));
        },
};

export const privateThunks = {
    "initialize":
        (): ThunkAction =>
        async (...args) => {
            const [dispatch, , {}] = args;

            dispatch(
                actions.initialized({
                    "softwares": [],
                }),
            );
        },
};

export const selectors = (() => {
    const internalSoftwares = (rootState: RootState) =>
        rootState.softwareCatalog.softwares;
    const search = (rootState: RootState) => rootState.softwareCatalog.search;
    const sort = (rootState: RootState) => rootState.softwareCatalog.sort;
    const organization = (rootState: RootState) => rootState.softwareCatalog.organization;
    const category = (rootState: RootState) => rootState.softwareCatalog.category;
    const environment = (rootState: RootState) => rootState.softwareCatalog.environment;
    const prerogatives = (rootState: RootState) => rootState.softwareCatalog.prerogatives;

    function internalSoftwareToExternalSoftware(
        software: SoftwareCatalogState.Software.Internal,
    ): SoftwareCatalogState.Software.External {
        const {
            softwareId,
            logoUrl,
            softwareName,
            softwareDescriptions,
            lastVersion,
            referentsCount,
            userCounts,
            parentSoftware,
            testUrl,
            addedTime,
            updateTime,
            categories,
            organizations,
            environments,
            prerogatives,
            search,
            ...rest
        } = software;

        assert<Equals<typeof rest, {}>>();

        return {
            softwareId,
            logoUrl,
            softwareName,
            softwareDescriptions,
            lastVersion,
            referentsCount,
            userCounts,
            parentSoftware,
            testUrl,
            "prerogatives": {
                ...prerogatives,
                "isInstallableOnUserTerminal":
                    environments.linux ||
                    environments.mac ||
                    environments.windows ||
                    environments.smartphone,
            },
        };
    }

    const { filterBySearch } = (() => {
        const getFzf = memoize(
            (softwares: SoftwareCatalogState.Software.Internal[]) =>
                new Fzf(softwares, { "selector": ({ search }) => search }),
            { "max": 1 },
        );

        const filterBySearchMemoized = memoize(
            (softwares: SoftwareCatalogState.Software.Internal[], search: string) =>
                new Set(
                    getFzf(softwares)
                        .find(search)
                        .map(({ item: { softwareId } }) => softwareId),
                ),
            { "max": 1 },
        );

        function filterBySearch(params: {
            softwares: SoftwareCatalogState.Software.Internal[];
            search: string;
        }) {
            const { softwares, search } = params;

            const softwareIds = filterBySearchMemoized(softwares, search);

            return softwares.filter(({ softwareId }) => softwareIds.has(softwareId));
        }

        return { filterBySearch };
    })();

    function filterByOrganization(params: {
        softwares: SoftwareCatalogState.Software.Internal[];
        organization: string;
    }) {
        const { softwares, organization } = params;

        return softwares.filter(({ organizations }) =>
            organizations.includes(organization),
        );
    }

    function filterByCategory(params: {
        softwares: SoftwareCatalogState.Software.Internal[];
        category: string;
    }) {
        const { softwares, category } = params;

        return softwares.filter(({ categories }) => categories.includes(category));
    }

    function filterByEnvironnement(params: {
        softwares: SoftwareCatalogState.Software.Internal[];
        environment: SoftwareCatalogState.Environment;
    }) {
        const { softwares, environment } = params;

        return softwares.filter(({ environments }) => environments[environment]);
    }

    function filterByPrerogative(params: {
        softwares: SoftwareCatalogState.Software.Internal[];
        prerogative: SoftwareCatalogState.Prerogative;
    }) {
        const { softwares, prerogative } = params;

        return softwares.filter(
            software =>
                internalSoftwareToExternalSoftware(software).prerogatives[prerogative],
        );
    }

    const softwares = createSelector(
        internalSoftwares,
        search,
        sort,
        organization,
        category,
        environment,
        prerogatives,
        (
            internalSoftwares,
            search,
            sort,
            organization,
            category,
            environment,
            prerogatives,
        ) => {
            let tmpSoftwares = internalSoftwares;

            if (search !== "") {
                tmpSoftwares = filterBySearch({
                    "softwares": tmpSoftwares,
                    search,
                });
            }

            if (organization !== undefined) {
                tmpSoftwares = filterByOrganization({
                    "softwares": tmpSoftwares,
                    "organization": organization,
                });
            }

            if (category !== undefined) {
                tmpSoftwares = filterByCategory({
                    "softwares": tmpSoftwares,
                    "category": category,
                });
            }

            if (environment !== undefined) {
                tmpSoftwares = filterByEnvironnement({
                    "softwares": tmpSoftwares,
                    "environment": environment,
                });
            }

            for (const prerogative of prerogatives) {
                tmpSoftwares = filterByPrerogative({
                    "softwares": tmpSoftwares,
                    prerogative,
                });
            }

            tmpSoftwares.sort(
                (() => {
                    switch (sort) {
                        case "added time": {
                            const getWeight = (
                                s: SoftwareCatalogState.Software.Internal,
                            ) => s.addedTime;

                            return (a, b) => getWeight(b) - getWeight(a);
                        }
                        case "last version publication date": {
                            const getWeight = (
                                s: SoftwareCatalogState.Software.Internal,
                            ) => s.lastVersion?.publicationTime ?? 0;

                            return (a, b) => getWeight(b) - getWeight(a);
                        }
                        case "referent count":
                            return null as any;
                        case "referent count ASC":
                            return null as any;
                        case "update time":
                            return null as any;
                        case "user count":
                            return null as any;
                        case "user count ASC":
                            return null as any;
                    }
                })(),
            );

            return tmpSoftwares.map(internalSoftwareToExternalSoftware);
        },
    );

    const organizationOptions = createSelector(
        internalSoftwares,
        search,
        category,
        environment,
        prerogatives,
        (
            internalSoftwares,
            search,
            category,
            environment,
            prerogatives,
        ): { organization: string; softwareCount: number }[] => {
            const softwareCountInCurrentFilterByOrganization = Object.fromEntries(
                Array.from(
                    new Set(
                        internalSoftwares
                            .map(({ organizations }) => organizations)
                            .reduce((prev, curr) => [...prev, ...curr], []),
                    ),
                ).map(organization => [organization, 0]),
            );

            let tmpSoftwares = internalSoftwares;

            if (search !== "") {
                tmpSoftwares = filterBySearch({
                    "softwares": tmpSoftwares,
                    search,
                });
            }

            if (category !== undefined) {
                tmpSoftwares = filterByCategory({
                    "softwares": tmpSoftwares,
                    "category": category,
                });
            }

            if (environment !== undefined) {
                tmpSoftwares = filterByEnvironnement({
                    "softwares": tmpSoftwares,
                    "environment": environment,
                });
            }

            for (const prerogative of prerogatives) {
                tmpSoftwares = filterByPrerogative({
                    "softwares": tmpSoftwares,
                    prerogative,
                });
            }

            tmpSoftwares.forEach(({ organizations }) =>
                organizations.forEach(
                    organization =>
                        softwareCountInCurrentFilterByOrganization[organization]++,
                ),
            );

            return Object.entries(softwareCountInCurrentFilterByOrganization)
                .map(([organization, softwareCount]) => ({
                    organization,
                    softwareCount,
                }))
                .sort((a, b) => a.softwareCount - b.softwareCount);
        },
    );

    const categoryOptions = createSelector(
        internalSoftwares,
        search,
        organization,
        environment,
        prerogatives,
        (
            internalSoftwares,
            search,
            organization,
            environment,
            prerogatives,
        ): { category: string; softwareCount: number }[] => {
            const softwareCountInCurrentFilterByCategory = Object.fromEntries(
                Array.from(
                    new Set(
                        internalSoftwares
                            .map(({ categories }) => categories)
                            .reduce((prev, curr) => [...prev, ...curr], []),
                    ),
                ).map(category => [category, 0]),
            );

            let tmpSoftwares = internalSoftwares;

            if (search !== "") {
                tmpSoftwares = filterBySearch({
                    "softwares": tmpSoftwares,
                    search,
                });
            }

            if (organization !== undefined) {
                tmpSoftwares = filterByOrganization({
                    "softwares": tmpSoftwares,
                    "organization": organization,
                });
            }

            if (environment !== undefined) {
                tmpSoftwares = filterByEnvironnement({
                    "softwares": tmpSoftwares,
                    "environment": environment,
                });
            }

            for (const prerogative of prerogatives) {
                tmpSoftwares = filterByPrerogative({
                    "softwares": tmpSoftwares,
                    prerogative,
                });
            }

            tmpSoftwares.forEach(({ categories }) =>
                categories.forEach(
                    category => softwareCountInCurrentFilterByCategory[category]++,
                ),
            );

            return Object.entries(softwareCountInCurrentFilterByCategory)
                .map(([category, softwareCount]) => ({
                    category,
                    softwareCount,
                }))
                .sort((a, b) => a.softwareCount - b.softwareCount);
        },
    );

    const environmentOptions = createSelector(
        internalSoftwares,
        search,
        organization,
        category,
        prerogatives,
        (
            internalSoftwares,
            search,
            organization,
            category,
            prerogatives,
        ): { environment: SoftwareCatalogState.Environment; softwareCount: number }[] => {
            const softwareCountInCurrentFilterByEnvironment = new Map(
                Array.from(
                    new Set(
                        internalSoftwares
                            .map(({ environments }) =>
                                objectKeys(environments).filter(
                                    environment => environments[environment],
                                ),
                            )
                            .reduce((prev, curr) => [...prev, ...curr], []),
                    ),
                ).map(environment => [environment, id<number>(0)] as const),
            );

            let tmpSoftwares = internalSoftwares;

            if (search !== "") {
                tmpSoftwares = filterBySearch({
                    "softwares": tmpSoftwares,
                    search,
                });
            }

            if (organization !== undefined) {
                tmpSoftwares = filterByOrganization({
                    "softwares": tmpSoftwares,
                    "organization": organization,
                });
            }

            if (category !== undefined) {
                tmpSoftwares = filterByCategory({
                    "softwares": tmpSoftwares,
                    "category": category,
                });
            }

            for (const prerogative of prerogatives) {
                tmpSoftwares = filterByPrerogative({
                    "softwares": tmpSoftwares,
                    prerogative,
                });
            }

            tmpSoftwares.forEach(({ environments }) =>
                objectKeys(environments)
                    .filter(environment => environments[environment])
                    .forEach(environment =>
                        softwareCountInCurrentFilterByEnvironment.set(
                            environment,
                            softwareCountInCurrentFilterByEnvironment.get(environment)! +
                                1,
                        ),
                    ),
            );

            return Array.from(softwareCountInCurrentFilterByEnvironment.entries())
                .map(([environment, softwareCount]) => ({
                    environment,
                    softwareCount,
                }))
                .sort((a, b) => a.softwareCount - b.softwareCount);
        },
    );

    const prerogativeFilterOptions = createSelector(
        internalSoftwares,
        search,
        organization,
        category,
        environment,
        (
            internalSoftwares,
            search,
            organization,
            category,
            environment,
        ): { prerogative: SoftwareCatalogState.Prerogative; softwareCount: number }[] => {
            const softwareCountInCurrentFilterByPrerogative = new Map(
                Array.from(
                    new Set(
                        internalSoftwares
                            .map(({ prerogatives }) =>
                                objectKeys(prerogatives).filter(
                                    prerogative => prerogatives[prerogative],
                                ),
                            )
                            .reduce((prev, curr) => [...prev, ...curr], []),
                    ),
                ).map(prerogative => [prerogative, id<number>(0)] as const),
            );

            let tmpSoftwares = internalSoftwares;

            if (search !== "") {
                tmpSoftwares = filterBySearch({
                    "softwares": tmpSoftwares,
                    search,
                });
            }

            if (organization !== undefined) {
                tmpSoftwares = filterByOrganization({
                    "softwares": tmpSoftwares,
                    "organization": organization,
                });
            }

            if (category !== undefined) {
                tmpSoftwares = filterByCategory({
                    "softwares": tmpSoftwares,
                    "category": category,
                });
            }

            if (environment !== undefined) {
                tmpSoftwares = filterByEnvironnement({
                    "softwares": tmpSoftwares,
                    "environment": environment,
                });
            }

            tmpSoftwares.forEach(({ prerogatives }) =>
                objectKeys(prerogatives)
                    .filter(prerogative => prerogatives[prerogative])
                    .forEach(prerogative =>
                        softwareCountInCurrentFilterByPrerogative.set(
                            prerogative,
                            softwareCountInCurrentFilterByPrerogative.get(prerogative)! +
                                1,
                        ),
                    ),
            );

            return Array.from(softwareCountInCurrentFilterByPrerogative.entries())
                .map(([prerogative, softwareCount]) => ({
                    prerogative,
                    softwareCount,
                }))
                .sort((a, b) => a.softwareCount - b.softwareCount);
        },
    );

    return {
        softwares,
        organizationOptions,
        categoryOptions,
        environmentOptions,
        prerogativeFilterOptions,
    };
})();