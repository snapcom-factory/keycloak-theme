import { useI18n as useI18nBase } from "keycloakify";

type Props = Omit<Parameters<typeof useI18nBase>[0], "extraMessages">;

export function useI18n(props: Props) {
    const { kcContext } = props;
    return useI18nBase({
        kcContext,
        "extraMessages": {
            "en": {
                "brand": "SILL",
                "service title": "Magnify",
                "home title": "Home - Magnify",
                "back": "Back",
                "alphanumericalCharsOnly": "Only alphanumerical characters",
                "administrativeEmail": "Administrative Email",
                "agencyName": "Agency Name",
                "connect": "Connect",
                "selfCredentials": "Or use your credentials",
                "email": "Your personal email",
                "email hint": "For example : name@example.com",
                "password": "Your password",
                "noAccount": "No account yet",
                "backToLogin": "Back to login"
            },
            "fr": {
                /* spell-checker: disable */
                "brand": "SILL",
                "service title": "Magnify",
                "home title": "Acceuil - Magnify",
                "back": "Retour",
                "alphanumericalCharsOnly": "Caractère alphanumérique uniquement",
                "administrativeEmail": "Email administratif",
                "agencyName": "Nom du service de rattachement",
                "connect": "Se connecter",
                "selfCredentials": "Ou utiliser vos identifiants",
                "email": "Votre email personnel",
                "email hint": "Par exemple : nom@exemple.com",
                "password": "Votre mot de passe",
                "noAccount": "Pas encore de compte",
                "backToLogin": "Retour à la connexion"
                /* spell-checker: enable */
            }
        }
    });
}

export type I18n = NonNullable<ReturnType<typeof useI18n>>;
