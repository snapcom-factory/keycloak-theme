import React, { memo } from "react";
import { useConst } from "powerhooks/useConst";
import { Evt } from "evt";
import { useStateRef } from "powerhooks/useStateRef";
import { useTranslation } from "../../../../i18n";
import { declareComponentKeys } from "i18nifty";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { fr, getColors } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { makeStyles } from "tss-react/dsfr";
import { FiltersPicker, FiltersPickerProps } from "./FiltersPicker";

type CatalogSearchAreaProps = {
    className?: string;
    tags: string[];
    selectedTags: string[];
    onSelectedTagsChange: (selectedTags: string[]) => void;
    search: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const { CatalogSearchArea } = (() => {
    const CatalogSearchArea = memo((props: CatalogSearchAreaProps) => {
        const {
            className,
            tags,
            selectedTags,
            onSelectedTagsChange,
            search,
            onSearchChange,
        } = props;

        /*        const evtSearchBarAction = useConst(() =>
            Evt.create<SearchBarProps["evtAction"]>(),
        );*/

        const evtFiltersPickerAction = useConst(() =>
            Evt.create<FiltersPickerProps["evtAction"]>(),
        );

        const buttonRef = useStateRef<HTMLButtonElement>(null);

        const { classes, cx } = useStyles();

        const { t } = useTranslation({ CatalogSearchArea });

        return (
            <form className={cx(classes.root, className)}>
                <div className={cx(classes.headerSearchBar)}>
                    <div className={cx(classes.searchBarContainer)}>
                        <input
                            className={cx(
                                fr.cx("fr-btn", "fr-btn--tertiary"),
                                classes.searchBar,
                            )}
                            placeholder={
                                "Rechercher un logiciel, un mot, une référence..."
                            }
                            onChange={onSearchChange}
                        />
                        {/*Todo: type submit ?*/}
                        <Button
                            iconId="fr-icon-search-line"
                            onClick={function noRefCheck() {}}
                            title="Search"
                            className={cx(classes.searchButton)}
                        />
                    </div>
                    <button
                        className={cx(
                            fr.cx("fr-btn", "fr-btn--tertiary"),
                            classes.toggleFiltersButton,
                        )}
                        onClick={event => {
                            event.preventDefault();
                            return evtFiltersPickerAction.post({
                                "action": "toggleFilters",
                            });
                        }}
                    >
                        Filtres
                        <i className={fr.cx("fr-icon-arrow-down-s-fill")} />
                    </button>
                </div>

                <FiltersPicker evtAction={evtFiltersPickerAction} />

                {/*                {selectedTags.map(tag => (
                    <CustomTag
                        className={classes.tag}
                        tag={tag}
                        key={tag}
                        onRemove={() =>
                            onSelectedTags({
                                "isSelect": false,
                                tag,
                            })
                        }
                    />
                ))}*/}
                {/*                <Button
                    ref={buttonRef}
                    className={classes.tagButton}
                    startIcon="add"
                    variant="secondary"
                    onClick={() =>
                        evtGitHubPickerAction.post({
                            "action": "open",
                            "anchorEl":
                                (assert(buttonRef.current !== null), buttonRef.current),
                        })
                    }
                >
                    {t("filter by tags")}
                </Button>
                <GitHubPicker
                    evtAction={evtGitHubPickerAction}
                    getTagColor={tag => getTagColor({ tag, theme }).color}
                    tags={tags}
                    selectedTags={selectedTags}
                    onSelectedTags={onSelectedTags}
                />*/}
            </form>
        );
    });

    return { CatalogSearchArea };
})();

export const { i18n } = declareComponentKeys<"filter by tags">()({ CatalogSearchArea });

const useStyles = makeStyles({ "name": { CatalogSearchArea } })(theme => ({
    "root": {
        "display": "flex",
        "flexDirection": "column",
        "paddingTop": fr.spacing("4v"),
        "paddingBottom": fr.spacing("4v"),
    },
    "headerSearchBar": {
        "display": "flex",
        "flex": 1,
        "marginBottom": fr.spacing("4v"),
    },
    "searchBarContainer": {
        "display": "flex",
        "width": "100%",
        "marginRight": fr.spacing("4v"),
    },
    "searchBar": {
        "borderTopLeftRadius": fr.spacing("1v"),
        "width": "100%",
    },
    "searchButton": {
        "borderTopRightRadius": fr.spacing("1v"),
    },
    "toggleFiltersButton": {
        "marginLeft": "auto",

        "&>i": {
            "&::before": {
                "--icon-size": fr.spacing("4v"),
            },
        },
    },
    "filtersContainer": {
        "display": "grid",
        "gridTemplateColumns": "repeat(4, 1fr)",
        "gap": fr.spacing("4v"),
    },
    "filter": {
        "&:not(:last-of-type)": {
            "borderRightWidth": "1px",
            "borderRightStyle": "solid",
            "borderRightColor": getColors(theme.isDark).decisions.border.default.grey
                .default,
            "paddingRight": fr.spacing("4v"),
        },
    },
}));