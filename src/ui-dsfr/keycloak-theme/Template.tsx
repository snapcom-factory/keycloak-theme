// Copy pasted from: https://github.com/InseeFrLab/keycloakify/blob/main/src/lib/components/shared/Template.tsx

// You can replace all relative imports by cherry picking files from the keycloakify module.
// For example, the following import:
// import { assert } from "./tools/assert";
// becomes:
import { assert } from "keycloakify/lib/tools/assert";
import { clsx } from "keycloakify/lib/tools/clsx";
import type { TemplateProps } from "keycloakify/lib/KcProps";
import { usePrepareTemplate } from "keycloakify/lib/Template";
import type { KcContext } from "./kcContext";
import type { I18n } from "./i18n";
import { makeStyles } from "tss-react/dsfr";
import Header from "@codegouvfr/react-dsfr/Header";
import { fr } from "@codegouvfr/react-dsfr";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        displayWide = false,
        showAnotherWayIfPresent = true,
        headerNode,
        showUsernameNode = null,
        formNode,
        infoNode = null,
        kcContext,
        i18n,
        doFetchDefaultThemeResources,
        stylesCommon,
        styles,
        scripts,
        kcHtmlClass
    } = props;

    const { msg, msgStr, changeLocale, labelBySupportedLanguageTag, currentLanguageTag } =
        i18n;

    const { realm, locale, auth, url, message, isAppInitiatedAction } = kcContext;

    const { isReady } = usePrepareTemplate({
        doFetchDefaultThemeResources,
        stylesCommon,
        styles,
        scripts,
        url,
        kcHtmlClass
    });

    const { classes, cx } = useStyles();

    if (!isReady) {
        return null;
    }

    return (
        <div>
            <Header
                brandTop={msgStr("brand")}
                serviceTitle={msgStr("service title")}
                homeLinkProps={{
                    "href": "https://sill.etalab.gouv.fr/",
                    "title": msgStr("home title")
                }}
            />
            <div className={cx(fr.cx("fr-container"), classes.container)}>
                <div
                    className={clsx(
                        classes.centerCol,
                        displayWide && props.kcFormCardAccountClass
                    )}
                >
                    <header className={clsx(props.kcFormHeaderClass)}>
                        {!(
                            auth !== undefined &&
                            auth.showUsername &&
                            !auth.showResetCredentials
                        ) ? (
                            displayRequiredFields ? (
                                <div className={clsx(props.kcContentWrapperClass)}>
                                    <div
                                        className={clsx(
                                            props.kcLabelWrapperClass,
                                            "subtitle"
                                        )}
                                    >
                                        <span className="subtitle">
                                            <span className="required">*</span>
                                            {msg("requiredFields")}
                                        </span>
                                    </div>
                                    <div className="col-md-10">
                                        <h1 id="kc-page-title">{headerNode}</h1>
                                    </div>
                                </div>
                            ) : (
                                <h2 id="kc-page-title">{headerNode}</h2>
                            )
                        ) : displayRequiredFields ? (
                            <div className={clsx(props.kcContentWrapperClass)}>
                                <div
                                    className={clsx(
                                        props.kcLabelWrapperClass,
                                        "subtitle"
                                    )}
                                >
                                    <span className="subtitle">
                                        <span className="required">*</span>{" "}
                                        {msg("requiredFields")}
                                    </span>
                                </div>
                                <div className="col-md-10">
                                    {showUsernameNode}
                                    <div className={clsx(props.kcFormGroupClass)}>
                                        <div id="kc-username">
                                            <label id="kc-attempted-username">
                                                {auth?.attemptedUsername}
                                            </label>
                                            <a
                                                id="reset-login"
                                                href={url.loginRestartFlowUrl}
                                            >
                                                <div className="kc-login-tooltip">
                                                    <i
                                                        className={clsx(
                                                            props.kcResetFlowIcon
                                                        )}
                                                    ></i>
                                                    <span className="kc-tooltip-text">
                                                        {msg("restartLoginTooltip")}
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {showUsernameNode}
                                <div className={clsx(props.kcFormGroupClass)}>
                                    <div id="kc-username">
                                        <label id="kc-attempted-username">
                                            {auth?.attemptedUsername}
                                        </label>
                                        <a
                                            id="reset-login"
                                            href={url.loginRestartFlowUrl}
                                        >
                                            <div className="kc-login-tooltip">
                                                <i
                                                    className={clsx(
                                                        props.kcResetFlowIcon
                                                    )}
                                                ></i>
                                                <span className="kc-tooltip-text">
                                                    {msg("restartLoginTooltip")}
                                                </span>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </>
                        )}
                    </header>
                    <div id="kc-content">
                        <div id="kc-content-wrapper">
                            {/* App-initiated actions should not see warning messages about the need to complete the action during login. */}
                            {displayMessage &&
                                message !== undefined &&
                                (message.type !== "warning" || !isAppInitiatedAction) && (
                                    <div
                                        className={clsx("alert", `alert-${message.type}`)}
                                    >
                                        {message.type === "success" && (
                                            <span
                                                className={clsx(
                                                    props.kcFeedbackSuccessIcon
                                                )}
                                            ></span>
                                        )}
                                        {message.type === "warning" && (
                                            <span
                                                className={clsx(
                                                    props.kcFeedbackWarningIcon
                                                )}
                                            ></span>
                                        )}
                                        {message.type === "error" && (
                                            <span
                                                className={clsx(
                                                    props.kcFeedbackErrorIcon
                                                )}
                                            ></span>
                                        )}
                                        {message.type === "info" && (
                                            <span
                                                className={clsx(props.kcFeedbackInfoIcon)}
                                            ></span>
                                        )}
                                        <span
                                            className="kc-feedback-text"
                                            dangerouslySetInnerHTML={{
                                                "__html": message.summary
                                            }}
                                        />
                                    </div>
                                )}
                            <div>{formNode}</div>
                            {auth !== undefined &&
                                auth.showTryAnotherWayLink &&
                                showAnotherWayIfPresent && (
                                    <form
                                        id="kc-select-try-another-way-form"
                                        action={url.loginAction}
                                        method="post"
                                        className={clsx(
                                            displayWide && props.kcContentWrapperClass
                                        )}
                                    >
                                        <div
                                            className={clsx(
                                                displayWide && [
                                                    props.kcFormSocialAccountContentClass,
                                                    props.kcFormSocialAccountClass
                                                ]
                                            )}
                                        >
                                            <div className={clsx(props.kcFormGroupClass)}>
                                                <input
                                                    type="hidden"
                                                    name="tryAnotherWay"
                                                    value="on"
                                                />
                                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                <a
                                                    href="#"
                                                    id="try-another-way"
                                                    onClick={() => {
                                                        document.forms[
                                                            "kc-select-try-another-way-form" as never
                                                        ].submit();
                                                        return false;
                                                    }}
                                                >
                                                    {msg("doTryAnotherWay")}
                                                </a>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            {displayInfo && (
                                <div id="kc-info" className={clsx(props.kcSignUpClass)}>
                                    <div
                                        id="kc-info-wrapper"
                                        className={clsx(props.kcInfoAreaWrapperClass)}
                                    >
                                        {infoNode}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const useStyles = makeStyles({
    "name": { Template }
})(() => ({
    "container": {
        "marginTop": fr.spacing("10v")
    },
    "centerCol": {
        "display": "flex",
        "flexDirection": "column",
        "alignItems": "center"
    }
}));
