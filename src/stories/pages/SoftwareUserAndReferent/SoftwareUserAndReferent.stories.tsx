import { SoftwareUserAndReferent } from "ui-dsfr/pages/SoftwareUserAndReferent/SoftwareUserAndReferent";
import { sectionName } from "./sectionName";
import { createMockRoute, getStoryFactory } from "stories/getStory";

const { meta, getStory } = getStoryFactory({
    sectionName,
    "wrappedComponent": { SoftwareUserAndReferent },
    "defaultContainerWidth": 0
});

export default meta;

export const VueDefault = getStory({
    "route": createMockRoute("softwareUsersAndReferents", {
        "name": "NextCloud"
    })
});
