import { SoftwareDetails } from "ui-dsfr/pages/SoftwareDetails/SoftwareDetails";
import { sectionName } from "./sectionName";
import { createMockRoute, getStoryFactory } from "stories/getStory";

const { meta, getStory } = getStoryFactory({
    sectionName,
    "wrappedComponent": { SoftwareDetails },
    "defaultContainerWidth": 0
});

export default meta;

export const VueDefault = getStory({
    "route": createMockRoute("softwareDetails", {
        "name": "NextCloud"
    })
});
