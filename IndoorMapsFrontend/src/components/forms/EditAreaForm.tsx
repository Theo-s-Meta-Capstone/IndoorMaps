import { Checkbox, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { graphql, useMutation } from "react-relay";
import { useDebounce, useRefreshRelayCache } from "../../utils/hooks";
import FormErrorNotification from "./FormErrorNotification";
import { EditAreaFormMutation } from "./__generated__/EditAreaFormMutation.graphql";
import { Feature, Geometry } from "geojson";

type Props = {
    area: L.Layer,
}

const EditAreaForm = ({ area }: Props) => {
    const [formError, setFormError] = useState<string | null>(null);
    const { refreshFloorData } = useRefreshRelayCache();
    const feature = (area as L.GeoJSON<Geometry>).feature as Feature;

    const form = useForm({
        mode: 'controlled',
        initialValues: { title: '', description: '', traversable: false },
    });

    const debouncedFormValue = useDebounce(form.values, form.values, 500);

    const [commit, isInFlight] = useMutation<EditAreaFormMutation>(graphql`
        mutation EditAreaFormMutation($input: AreaModifyInput!) {
            modifyArea(data: $input) {
                floorDatabaseId
            }
        }
    `);

    const handleSubmit = async (values: typeof form.values) => {
        if (feature == undefined || feature.properties == null) {
            setFormError("Area id not found");
            return
        }
        try {
            commit({
                variables: {
                    input: {
                        id: feature.properties.databaseId,
                        title: values.title,
                        description: values.description,
                        traversable: values.traversable,
                    },
                },
                onCompleted(data) {
                    feature.properties!.title = values.title;
                    feature.properties!.description = values.description;
                    feature.properties!.traversable = values.traversable;
                    refreshFloorData(data.modifyArea.floorDatabaseId)
                },
                onError(error) {
                    setFormError(error.message);
                }
            });
        } catch (error) {
            const errorMessage = (error as Error).message;
            setFormError(errorMessage);
        }
    };

    useEffect(() => {
        form.setFieldValue("title", (feature.properties ? feature.properties.title : ""));
        form.setFieldValue("description", (feature.properties ? feature.properties.description : ""));
        form.setFieldValue("traversable", (feature.properties ? feature.properties.traversable : false));
    }, [area]);

    useEffect(() => {
        if (feature.properties!.title == debouncedFormValue.title && feature.properties!.description == debouncedFormValue.description && feature.properties!.traversable == debouncedFormValue.traversable) {
            return;
        }
        handleSubmit(debouncedFormValue);
    }, [debouncedFormValue]);

    return (
        <div>
            <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
            <TextInput {...form.getInputProps('title')} label="Area Name" placeholder="101" />
            <Textarea {...form.getInputProps('description')}
                autosize
                minRows={2}
                label="Area Description"
                placeholder="Classes: Geology 101 930, ..." />
            <Checkbox {...form.getInputProps('traversable')} checked={form.getValues().traversable} label="Traversable" />
            <div>{(isInFlight) ? "saving area details ..." : "area details saved"}</div>
        </div>
    )
}

export default EditAreaForm;
