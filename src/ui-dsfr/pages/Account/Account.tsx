import React, { useEffect, useState, useReducer } from "react";
import { createGroup, type Route } from "type-route";
import { routes } from "ui-dsfr/routes";
import { makeStyles } from "tss-react/dsfr";
import { fr } from "@codegouvfr/react-dsfr";
import { useTranslation } from "ui-dsfr/i18n";
import { assert } from "tsafe/assert";
import { Equals } from "tsafe";
import { declareComponentKeys } from "i18nifty";
import { useCoreFunctions, useCoreState } from "core-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { z } from "zod";
import { AutocompleteInput } from "ui-dsfr/shared/AutocompleteInput";

Account.routeGroup = createGroup([routes.account]);
type PageRoute = Route<typeof Account.routeGroup>;
Account.getDoRequireUserLoggedIn = () => false;

export type Props = {
    className?: string;
    route: PageRoute;
};

export function Account(props: Props) {
    const { className, route, ...rest } = props;

    /** Assert to make sure all props are deconstructed */
    assert<Equals<typeof rest, {}>>();

    const { userAuthentication } = useCoreFunctions();

    const { classes, cx } = useStyles();
    const { t } = useTranslation({ Account });

    useEffect(() => {
        triggerFetchAgencyNames();
    }, []);

    const { agencyNames, triggerFetchAgencyNames } = (function useClosure() {
        const [agencyNames, setAgencyNames] = useState<string[]>([]);
        const [isTriggered, triggerFetchAgencyNames] = useReducer(() => true, false);

        useEffect(() => {
            if (!isTriggered) {
                return;
            }

            let isCleanedUp = false;

            userAuthentication.getAgencyNames().then(agencyNames => {
                if (isCleanedUp) {
                    return;
                }

                //NOTE: Just so that we do not have infinite loading for the first user
                if (agencyNames.length === 0) {
                    agencyNames = [""];
                }

                setAgencyNames(agencyNames);
            });

            return () => {
                isCleanedUp = true;
            };
        }, [isTriggered]);

        return { agencyNames, triggerFetchAgencyNames };
    })();

    const { allowedEmailRegexp } = (function useClosure() {
        const [allowedEmailRegexp, setAllowedEmailRegexp] = useState<RegExp | undefined>(
            undefined
        );

        useEffect(() => {
            let isCleanedUp = false;

            userAuthentication.getAllowedEmailRegexp().then(allowedEmailRegexp => {
                if (isCleanedUp) {
                    return;
                }

                setAllowedEmailRegexp(allowedEmailRegexp);
            });

            return () => {
                isCleanedUp = true;
            };
        }, []);

        return { allowedEmailRegexp };
    })();

    const { value: agencyName } = useCoreState(
        state => state.userAuthentication.agencyName
    );

    const { value: email } = useCoreState(state => state.userAuthentication.email);

    const keycloakAccountConfigurationUrl =
        userAuthentication.getKeycloakAccountConfigurationUrl();

    const onRequestUpdateFieldFactory = (
        fieldName: "agencyName" | "email",
        value: string
    ) => userAuthentication.updateField({ fieldName, value });

    const isValidEmail = (value: string) => {
        assert(allowedEmailRegexp !== undefined);

        try {
            z.string().email().parse(value);
        } catch {
            return {
                "isValidValue": false,
                "message": "invalid email"
            };
        }

        if (!allowedEmailRegexp.test(value)) {
            return {
                "isValidValue": false,
                "message": "Your email domain isn't allowed yet"
            };
        }

        return { "isValidValue": true };
    };

    if (allowedEmailRegexp === undefined) {
        return null;
    }

    return (
        <div className={cx(fr.cx("fr-container"), classes.root, className)}>
            <h2 className={classes.title}>{t("title")}</h2>
            <div className={classes.emailContainer}>
                <Input
                    label={t("mail")}
                    nativeInputProps={{
                        onChange: event =>
                            onRequestUpdateFieldFactory("email", event.target.value),
                        value: email
                    }}
                    state={isValidEmail(email).isValidValue ? undefined : "error"}
                    stateRelatedMessage={isValidEmail(email).message}
                />
            </div>
            <div>
                <AutocompleteInput
                    options={agencyNames}
                    value={agencyName}
                    onValueChange={value =>
                        onRequestUpdateFieldFactory("agencyName", value ?? "")
                    }
                    getOptionLabel={entry => entry}
                    renderOption={(liProps, entry) => (
                        <li {...liProps}>
                            <span>{entry}</span>
                        </li>
                    )}
                    noOptionText="No result"
                    dsfrInputProps={{
                        "label": t("organization")
                    }}
                />
            </div>
            {keycloakAccountConfigurationUrl !== undefined && (
                <a href={keycloakAccountConfigurationUrl} target="_blank">
                    {t("update data")}
                </a>
            )}
        </div>
    );
}

const useStyles = makeStyles({
    "name": { Account }
})(_theme => ({
    "root": {
        "paddingTop": fr.spacing("6v")
    },
    "title": {
        "marginBottom": fr.spacing("10v"),
        [fr.breakpoints.down("md")]: {
            "marginBottom": fr.spacing("8v")
        }
    },
    "emailContainer": {
        marginBottom: fr.spacing("6v")
    }
}));

export const { i18n } = declareComponentKeys<
    "title" | "mail" | "organization" | "update data" | "no organization"
>()({ Account });
