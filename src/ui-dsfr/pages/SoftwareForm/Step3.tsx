import { useState } from "react";
import { useForm } from "react-hook-form";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import type { FormData } from "core-dsfr/usecases/softwareForm";
import { declareComponentKeys } from "i18nifty";
import { useTranslation } from "ui-dsfr/i18n";

export type Step2Props = {
    className?: string;
    isCloudNativeSoftware: boolean;
    initialFormData: FormData["step3"] | undefined;
    onSubmit: (formData: FormData["step3"]) => void;
    evtActionSubmit: NonPostableEvt<void>;
};

export function SoftwareFormStep3(props: Step2Props) {
    const { className, initialFormData, onSubmit, evtActionSubmit } = props;

    const { t } = useTranslation({ SoftwareFormStep3 });
    const commoni18n = useTranslation({ "App": "App" });

    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<{
        isPresentInSupportContractInputValue: "true" | "false" | undefined;
        isFromFrenchPublicServiceInputValue: "true" | "false";
        isPublicInstanceInputValue: "true" | "false";
        targetAudience: string;
    }>({
        "defaultValues": (() => {
            if (initialFormData === undefined) {
                return undefined;
            }

            const { isFromFrenchPublicService, isPresentInSupportContract } =
                initialFormData;

            return {
                "isPresentInSupportContractInputValue":
                    isPresentInSupportContract === undefined
                        ? undefined
                        : isPresentInSupportContract
                        ? "true"
                        : "false",
                "isFromFrenchPublicServiceInputValue":
                    isFromFrenchPublicService === undefined
                        ? undefined
                        : isFromFrenchPublicService
                        ? "true"
                        : "false"
            };
        })()
    });

    const [submitButtonElement, setSubmitButtonElement] =
        useState<HTMLButtonElement | null>(null);

    useEvt(
        ctx => {
            if (submitButtonElement === null) {
                return;
            }

            evtActionSubmit.attach(ctx, () => submitButtonElement.click());
        },
        [evtActionSubmit, submitButtonElement]
    );

    return (
        <form
            className={className}
            onSubmit={handleSubmit(
                ({
                    isPresentInSupportContractInputValue,
                    isFromFrenchPublicServiceInputValue
                }) =>
                    onSubmit({
                        "isPresentInSupportContract": (() => {
                            switch (isPresentInSupportContractInputValue) {
                                case undefined:
                                    return undefined;
                                case "true":
                                    return true;
                                case "false":
                                    return false;
                            }
                        })(),
                        "isFromFrenchPublicService": (() => {
                            switch (isFromFrenchPublicServiceInputValue) {
                                case "true":
                                    return true;
                                case "false":
                                    return false;
                            }
                        })()
                    })
            )}
        >
            <RadioButtons
                legend={t("is present in support market")}
                options={[
                    {
                        "label": commoni18n.t("yes"),
                        "nativeInputProps": {
                            ...register("isPresentInSupportContractInputValue"),
                            "value": "true"
                        }
                    },
                    {
                        "label": commoni18n.t("no"),
                        "nativeInputProps": {
                            ...register("isPresentInSupportContractInputValue"),
                            "value": "false"
                        }
                    }
                ]}
            />
            <RadioButtons
                legend={t("is from french public service")}
                options={[
                    {
                        "label": commoni18n.t("yes"),
                        "nativeInputProps": {
                            ...register("isFromFrenchPublicServiceInputValue", {
                                "required": true
                            }),
                            "value": "true"
                        }
                    },
                    {
                        "label": commoni18n.t("no"),
                        "nativeInputProps": {
                            ...register("isFromFrenchPublicServiceInputValue", {
                                "required": true
                            }),
                            "value": "false"
                        }
                    }
                ]}
                state={
                    errors.isFromFrenchPublicServiceInputValue !== undefined
                        ? "error"
                        : undefined
                }
                stateRelatedMessage={commoni18n.t("required")}
            />
            <button
                style={{ "display": "none" }}
                ref={setSubmitButtonElement}
                type="submit"
            />
        </form>
    );
}

export const { i18n } = declareComponentKeys<
    "is present in support market" | "is from french public service"
>()({ SoftwareFormStep3 });
